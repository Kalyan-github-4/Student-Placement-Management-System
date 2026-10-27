import "server-only";
import { appUrl, sendEmail } from "@/lib/email";

export function sendVerificationEmail(to: string, token: string) {
  return sendEmail({
    to,
    subject: "Verify your email address",
    lines: [
      "Thanks for registering with the Brainware University placement portal.",
      "Confirm that this is your email address. The link is valid for 24 hours.",
    ],
    action: { label: "Verify email", url: appUrl(`/verify-email?token=${token}`) },
  });
}

export function sendPasswordResetEmail(to: string, token: string) {
  return sendEmail({
    to,
    subject: "Reset your password",
    lines: [
      "We received a request to reset the password for your placement portal account.",
      "The link is valid for 1 hour. If you didn't ask for this, you can ignore this email.",
    ],
    action: { label: "Reset password", url: appUrl(`/reset-password?token=${token}`) },
  });
}

export function sendTpoActivationEmail(to: string, name: string, token: string) {
  return sendEmail({
    to,
    subject: "Your placement cell account is ready",
    lines: [
      `Hello ${name},`,
      "A Training & Placement Office account has been created for you on the Brainware University placement portal.",
      "Set your password to activate it. The link is valid for 7 days.",
    ],
    action: { label: "Activate account", url: appUrl(`/activate?token=${token}`) },
  });
}

export function sendCompanyInviteEmail(to: string, companyName: string, token: string) {
  return sendEmail({
    to,
    subject: "Invitation to recruit at Brainware University",
    lines: [
      `The Training & Placement Office has invited ${companyName} to recruit through the Brainware University placement portal.`,
      "Register with this email address using the link below. Your company will be approved as soon as you sign up. The link is valid for 14 days.",
    ],
    action: { label: "Register company", url: appUrl(`/register/company?invite=${token}`) },
  });
}

export function sendCompanyApprovedEmail(to: string, companyName: string) {
  return sendEmail({
    to,
    subject: `${companyName} is approved`,
    lines: [
      `Good news: the Training & Placement Office has approved ${companyName}.`,
      "You can now sign in to the company portal.",
    ],
    action: { label: "Open company portal", url: appUrl("/company") },
  });
}

export function sendCompanyRejectedEmail(to: string, companyName: string, reason: string) {
  return sendEmail({
    to,
    subject: `Update on ${companyName}'s registration`,
    lines: [
      `The Training & Placement Office could not approve ${companyName}.`,
      `Reason: ${reason}`,
      "You can update your company details and resubmit them for review.",
    ],
    action: { label: "Update details", url: appUrl("/company/profile/edit") },
  });
}

export function sendCompanySuspendedEmail(to: string, companyName: string, reason: string) {
  return sendEmail({
    to,
    subject: `${companyName} has been suspended`,
    lines: [
      `The Training & Placement Office has suspended ${companyName} on the placement portal. Its openings are hidden from students.`,
      `Reason: ${reason}`,
      "Please contact the placement cell if you have questions.",
    ],
  });
}

export function sendCompanyReinstatedEmail(to: string, companyName: string) {
  return sendEmail({
    to,
    subject: `${companyName} has been reinstated`,
    lines: [
      `The Training & Placement Office has reinstated ${companyName}. Its openings are visible to students again.`,
    ],
    action: { label: "Open company portal", url: appUrl("/company") },
  });
}
