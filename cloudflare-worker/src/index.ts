import { Hono } from "hono";
import { cors } from "hono/cors";
import { drizzle } from "drizzle-orm/d1";
import { quotesTable } from "./db/schema";

export type Env = {
  DB: D1Database;
  RESEND_API_KEY: string;
  FROM_EMAIL?: string;
  ALLOWED_ORIGIN?: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use(
  "*",
  cors({
    origin: (origin, c) => {
      const allowed = c.env.ALLOWED_ORIGIN;
      if (!allowed || allowed === "*") return origin;
      return origin === allowed ? origin : allowed;
    },
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

app.get("/api/healthz", (c) => c.json({ status: "ok" }));

app.post("/api/quotes", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const data = body as Record<string, unknown>;

  const name = typeof data.name === "string" ? data.name.trim() : "";
  const phone = typeof data.phone === "string" ? data.phone.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const address = typeof data.address === "string" ? data.address.trim() : "";
  const notes = typeof data.notes === "string" ? data.notes.trim() : "";
  const stumpCount = typeof data.stumpCount === "number" ? data.stumpCount : 0;
  const servicePackage =
    typeof data.servicePackage === "string" ? data.servicePackage.trim() : "";
  const estimatedTotal =
    typeof data.estimatedTotal === "number" ? data.estimatedTotal : 0;

  if (!name || !phone || !email || !address || !servicePackage) {
    return c.json({ error: "Missing required fields" }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: "Invalid email address" }, 400);
  }

  const db = drizzle(c.env.DB);

  const [quote] = await db
    .insert(quotesTable)
    .values({
      name,
      phone,
      email,
      address,
      notes,
      stumpCount,
      servicePackage,
      estimatedTotal: estimatedTotal.toFixed(2),
    })
    .returning();

  c.executionCtx.waitUntil(
    sendQuoteEmail(
      { name, phone, email, address, notes, stumpCount, servicePackage, estimatedTotal },
      c.env.RESEND_API_KEY,
      c.env.FROM_EMAIL
    ).catch((err) => console.error("Email send failed:", err))
  );

  return c.json(quote, 201);
});

app.get("/api/quotes", async (c) => {
  const db = drizzle(c.env.DB);
  const quotes = await db.select().from(quotesTable);
  return c.json(quotes);
});

async function sendQuoteEmail(
  data: {
    name: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
    stumpCount: number;
    servicePackage: string;
    estimatedTotal: number;
  },
  resendApiKey: string,
  fromEmail?: string
) {
  if (!resendApiKey) return;

  const from = fromEmail ?? "Stephenson Stump Grinding <onboarding@resend.dev>";
  const notesRow = data.notes
    ? `<tr style="border-top:1px solid #eee;"><td style="padding:8px 0;color:#666;">Notes</td><td style="padding:8px 0;font-weight:600;">${data.notes}</td></tr>`
    : "";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f5f3;padding:32px;">
      <div style="background:white;border-radius:16px;padding:32px;">
        <h2 style="margin:0 0 8px;color:#111;">New Quote Request</h2>
        <p style="margin:0 0 24px;color:#666;">Submitted via stephensonstumpgrinding.com</p>
        <div style="background:#111;border-radius:12px;padding:20px;margin-bottom:24px;color:white;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="color:#999;font-size:13px;padding-bottom:4px;">Stumps</td>
              <td style="color:#999;font-size:13px;padding-bottom:4px;">Package</td>
              <td style="color:#999;font-size:13px;padding-bottom:4px;text-align:right;">Estimate</td>
            </tr>
            <tr>
              <td style="font-weight:700;font-size:18px;">${data.stumpCount}</td>
              <td style="font-weight:600;font-size:14px;">${data.servicePackage}</td>
              <td style="font-weight:700;font-size:20px;color:#7cc76f;text-align:right;">$${data.estimatedTotal.toFixed(2)}</td>
            </tr>
          </table>
        </div>
        <h3 style="margin:0 0 16px;color:#111;">Customer Details</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#666;width:140px;">Name</td><td style="padding:8px 0;font-weight:600;">${data.name}</td></tr>
          <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;color:#666;">Phone</td><td style="padding:8px 0;font-weight:600;"><a href="tel:${data.phone}" style="color:#2d5e2b;">${data.phone}</a></td></tr>
          <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;font-weight:600;"><a href="mailto:${data.email}" style="color:#2d5e2b;">${data.email}</a></td></tr>
          <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;color:#666;">Address</td><td style="padding:8px 0;font-weight:600;">${data.address}</td></tr>
          ${notesRow}
        </table>
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;color:#999;font-size:12px;">
          Stephenson Stump Grinding &mdash; Ames, Iowa
        </div>
      </div>
    </div>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: ["stephensonstump@gmail.com"],
      reply_to: data.email,
      subject: `New Quote Request — ${data.name} (${data.stumpCount} stump${data.stumpCount !== 1 ? "s" : ""})`,
      html,
    }),
  });
}

export default app;
