import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { quotesTable } from "@workspace/db";
import { CreateQuoteBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/quotes", async (req, res): Promise<void> => {
  const parsed = CreateQuoteBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid quote request body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, phone, email, address, notes, stumpCount, servicePackage, estimatedTotal } = parsed.data;

  const [quote] = await db
    .insert(quotesTable)
    .values({
      name,
      phone,
      email,
      address,
      notes: notes ?? "",
      stumpCount,
      servicePackage,
      estimatedTotal: String(estimatedTotal),
    })
    .returning();

  req.log.info({ quoteId: quote.id }, "Quote request created");
  res.status(201).json(quote);
});

router.get("/quotes", async (req, res): Promise<void> => {
  const quotes = await db
    .select()
    .from(quotesTable)
    .orderBy(quotesTable.createdAt);

  res.json(quotes);
});

export default router;
