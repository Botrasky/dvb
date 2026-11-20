import { handlePhishingCheck } from "../../../../backend/phishing-check.mjs";
import { lookupVirusTotal } from "../../../../backend/virustotal.mjs";

export const prerender = false;

export async function POST({ request }: { request: Request }) {
  return handlePhishingCheck(request, {
    lookup: (url: string) =>
      lookupVirusTotal(url, { apiKey: import.meta.env.VIRUSTOTAL_API }),
  });
}
