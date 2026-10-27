import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ipFromHeaders, rateLimit } from "@/lib/rate-limit";
import type { Role } from "@/lib/roles";

type UserStatus = (typeof users.$inferSelect)["status"];

declare module "next-auth" {
  interface User {
    role: Role;
    status: UserStatus;
  }
  interface Session {
    user: { id: string; email: string; role: Role; status: UserStatus };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    status: UserStatus;
  }
}

class LoginError extends CredentialsSignin {
  constructor(code: string) {
    super();
    this.code = code;
  }
}

const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const ip = ipFromHeaders(request.headers);
        if (!(await rateLimit(`login:${ip}`, 30, 15 * 60 * 1000))) {
          throw new LoginError("rate_limited");
        }

        const [user] = await db.select().from(users).where(eq(users.email, email));
        if (!user?.passwordHash) return null;
        if (user.lockedUntil && user.lockedUntil > new Date()) throw new LoginError("locked");

        if (!(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
          const failed = user.failedLoginCount + 1;
          const locked = failed >= MAX_FAILED_LOGINS;
          await db
            .update(users)
            .set({
              failedLoginCount: locked ? 0 : failed,
              lockedUntil: locked ? new Date(Date.now() + LOCKOUT_MS) : null,
            })
            .where(eq(users.id, user.id));
          if (locked) throw new LoginError("locked");
          return null;
        }

        if (!user.emailVerified) throw new LoginError("unverified");
        if (user.status === "SUSPENDED") throw new LoginError("suspended");

        await db
          .update(users)
          .set({ failedLoginCount: 0, lockedUntil: null, lastLogin: new Date() })
          .where(eq(users.id, user.id));

        return { id: user.id, email: user.email, role: user.role, status: user.status };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.status = token.status;
      return session;
    },
  },
});
