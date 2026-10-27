import { z } from "zod";

export const companySizes = ["1-50", "51-200", "201-1000", "1001-5000", "5000+"] as const;

export const industries = [
  "IT Services",
  "Software Product",
  "Consulting",
  "Banking & Finance",
  "Manufacturing",
  "Electronics & Semiconductors",
  "Energy",
  "Construction & Infrastructure",
  "Healthcare",
  "Education",
  "E-commerce & Retail",
  "Other",
] as const;

const freeEmailDomains = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "ymail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "rediffmail.com",
  "zoho.com",
  "gmx.com",
  "mail.com",
  "yandex.com",
]);

// Lowercased host of a website URL without a leading "www.", or null if it isn't a URL.
export function domainFromWebsite(website: string) {
  try {
    return new URL(website).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function emailDomain(email: string) {
  return email.split("@")[1]?.toLowerCase() ?? "";
}

export function isFreeEmail(email: string) {
  return freeEmailDomains.has(emailDomain(email));
}

// careers.acme.com and acme.com both count as matching an @acme.com address.
export function emailMatchesDomain(email: string, domain: string) {
  const mail = emailDomain(email);
  return mail === domain || mail.endsWith(`.${domain}`) || domain.endsWith(`.${mail}`);
}

const optional = z.string().trim().max(200).transform((v) => v || null);

// Fields the recruiter can edit on their company. Legal fields lock once approved.
export const companyDetailsSchema = z.object({
  name: z.string().trim().min(2, "Enter the company name.").max(120),
  website: z.url({ protocol: /^https?$/, error: "Enter the full website URL, e.g. https://acme.com." }),
  industry: z.enum(industries, "Select an industry."),
  size: z.enum(companySizes, "Select the company size."),
  description: z.string().trim().max(1000).transform((v) => v || null),
  address: z.string().trim().min(10, "Enter the registered address.").max(300),
  linkedinUrl: z
    .url("Enter the LinkedIn page URL.")
    .refine((url) => /(^|\.)linkedin\.com$/.test(domainFromWebsite(url) ?? ""), {
      error: "Enter a linkedin.com URL.",
    }),
  gstinOrCin: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => v === "" || /^[0-9A-Z]{15}$|^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(v), {
      error: "Enter a 15-character GSTIN or a 21-character CIN.",
    })
    .transform((v) => v || null),
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => v === "" || /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v), { error: "Enter a valid PAN." })
    .transform((v) => v || null),
  hiringRoles: optional,
  hiringCtc: optional,
  hiringBatch: optional,
});

export const legalFields = ["name", "website", "gstinOrCin", "pan"] as const;

export const recruiterSchema = z.object({
  recruiterName: z.string().trim().min(2, "Enter your full name.").max(100),
  designation: z.string().trim().min(2, "Enter your designation.").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91[ -]?)?[6-9]\d{9}$/, "Enter a valid 10-digit mobile number."),
});
