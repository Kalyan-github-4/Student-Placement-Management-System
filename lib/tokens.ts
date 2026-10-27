import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { authTokens } from "@/db/schema";

type TokenType = (typeof authTokens.$inferInsert)["type"];

const HOUR = 60 * 60 * 1000;

export const tokenLifetimes: Record<TokenType, number> = {
  EMAIL_VERIFICATION: 24 * HOUR,
  PASSWORD_RESET: HOUR,
  ACCOUNT_ACTIVATION: 7 * 24 * HOUR,
};

export function generateToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

// Issues a new link token, revoking any unused one of the same type for the user.
export async function createAuthToken(userId: string, type: TokenType) {
  const token = generateToken();
  await db.batch([
    db
      .update(authTokens)
      .set({ usedAt: new Date() })
      .where(
        and(eq(authTokens.userId, userId), eq(authTokens.type, type), isNull(authTokens.usedAt))
      ),
    db.insert(authTokens).values({
      userId,
      type,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + tokenLifetimes[type]),
    }),
  ]);
  return token;
}

// Marks a valid token as used and returns its user id, or null if it is invalid,
// expired or already used. The conditional update makes it safe against double use.
export async function consumeAuthToken(token: string, type: TokenType) {
  const [row] = await db
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(authTokens.tokenHash, hashToken(token)),
        eq(authTokens.type, type),
        isNull(authTokens.usedAt),
        gt(authTokens.expiresAt, sql`now()`)
      )
    )
    .returning({ userId: authTokens.userId });
  return row?.userId ?? null;
}

// Checks a token without using it up, so a page can show the form only for valid links.
export async function isAuthTokenValid(token: string, type: TokenType) {
  const [row] = await db
    .select({ id: authTokens.id })
    .from(authTokens)
    .where(
      and(
        eq(authTokens.tokenHash, hashToken(token)),
        eq(authTokens.type, type),
        isNull(authTokens.usedAt),
        gt(authTokens.expiresAt, sql`now()`)
      )
    );
  return !!row;
}
