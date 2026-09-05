import "server-only";

import { Resend } from "resend";

export function createEmailClient(apiKey: string) {
  return new Resend(apiKey);
}
