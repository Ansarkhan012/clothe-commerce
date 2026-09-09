import { createEmailClient } from "@/src/lib/email/client";
import { getEmailConfig } from "@/src/lib/email/config";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ message: "Not found" }, { status: 404 });
  }

  const config = getEmailConfig();
  if (!config?.adminRecipient) {
    return Response.json(
      { message: "Email test configuration is incomplete." },
      { status: 503 },
    );
  }

  try {
    const { data, error } = await createEmailClient(config.apiKey).emails.send({
      from: config.from,
      to: config.adminRecipient,
      subject: "QurZaib Fabrics — transactional email test",
      html: '<div style="background:#F7F3ED;padding:24px;font-family:Arial,sans-serif;color:#1A1A1A"><div style="max-width:560px;margin:auto;background:#FFFFFF;border:1px solid #E4DDD3;padding:32px"><h1 style="font-family:Georgia,serif;font-weight:normal">QurZaib Fabrics</h1><p>Your transactional email configuration is working.</p></div></div>',
      ...(config.replyTo ? { replyTo: config.replyTo } : {}),
    });
    if (error || !data?.id) {
      console.error("Development email test was rejected by the provider.");
      return Response.json({ message: "Test email could not be sent." }, { status: 502 });
    }
    return Response.json({ success: true, message: "Test email accepted." });
  } catch {
    console.error("Development email test failed.");
    return Response.json({ message: "Test email could not be sent." }, { status: 502 });
  }
}
