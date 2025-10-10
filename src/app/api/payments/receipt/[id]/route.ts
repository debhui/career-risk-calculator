// src/app/api/payments/receipt/[id]/route.ts
import { createClient } from "@supabase/supabase-js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// --- Supabase setup ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  // ✅ FIX: Await params (Next.js App Router requires this)
  const { id } = await context.params;
  const transactionId = id;

  if (!transactionId) {
    return new Response(JSON.stringify({ error: "Missing transactionId" }), {
      status: 400,
    });
  }

  // --- Fetch transaction ---
  const { data: transaction, error } = await supabase
    .from("transactions")
    .select("amount, created_at, user_id, razorpay_payment_id")
    .eq("id", transactionId)
    .single();

  if (error || !transaction) {
    console.error("Transaction fetch error:", error);
    return new Response(JSON.stringify({ error: "Transaction not found" }), {
      status: 404,
    });
  }

  // --- Fetch user email ---
  const { data: user, error: userError } = await supabase.auth.admin.getUserById(
    transaction.user_id
  );
  const userEmail = userError ? "N/A" : user?.user.email || "N/A";

  try {
    const pdfBuffer = await generateReceipt({
      userEmail,
      reportName: "Detailed Career Risk Report",
      amount: transaction.amount,
      paymentId: transaction.razorpay_payment_id,
      createdAt: transaction.created_at,
    });

    return new Response(pdfBufferToArrayBuffer(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=receipt-${transactionId}.pdf`,
      },
    });
  } catch (pdfError) {
    console.error("PDF generation failed:", pdfError);
    return new Response(JSON.stringify({ error: "Failed to generate PDF receipt" }), {
      status: 500,
    });
  }
}

// --- Helper: Convert Buffer to ArrayBuffer ---
function pdfBufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
  // Create a copy as Uint8Array to guarantee a normal ArrayBuffer
  const copy = new Uint8Array(buffer.byteLength);
  copy.set(buffer);
  return copy.buffer;
}
// --- Helper: Generate PDF receipt ---
async function generateReceipt({
  userEmail,
  reportName,
  amount,
  paymentId,
  createdAt,
}: {
  userEmail: string;
  reportName: string;
  amount: number;
  paymentId: string;
  createdAt: string;
}): Promise<Buffer> {
  const fontPath = path.join(process.cwd(), "public/fonts/Roboto-Regular.ttf");

  // ✅ Ensure font exists or fallback to built-in one
  if (!fs.existsSync(fontPath)) {
    console.warn("⚠️ Font not found at:", fontPath);
  }

  return new Promise<Buffer>((resolve, reject) => {
    // ✅ Use custom font immediately to prevent Helvetica.afm ENOENT error
    const doc = new PDFDocument({
      font: path.join(process.cwd(), "public/fonts/Roboto-Regular.ttf"),
    });
    const chunks: Buffer[] = [];

    doc.on("data", chunk => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    if (fs.existsSync(fontPath)) {
      doc.font(fontPath);
    } else {
      doc.font("Times-Roman"); // fallback safe built-in font
    }

    // --- Header ---
    doc
      .fillColor("#059669")
      .fontSize(22)
      .text("Official Payment Receipt", { align: "center" })
      .moveDown(1);

    // --- Transaction info ---
    doc.fillColor("#111827").fontSize(12);
    doc.text(`Transaction ID: ${paymentId}`, { align: "right" });
    doc.text(`Date: ${new Date(createdAt).toLocaleDateString()}`, { align: "right" });
    doc.moveDown(1.5);

    // --- Purchase details ---
    doc.fontSize(16).fillColor("#1f2937").text("Purchase Details", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Product: ${reportName}`);
    doc.text(`Customer Email: ${userEmail}`);
    doc.moveDown(1.5);

    // --- Total ---
    doc
      .fontSize(20)
      .fillColor("#10b981")
      .text(`Total Paid: ₹${amount}`, { align: "center" })
      .moveDown(1.5);

    // --- Footer ---
    doc
      .fontSize(10)
      .fillColor("#6b7280")
      .text(
        "This is an electronically generated receipt and does not require a physical signature.",
        { align: "center" }
      );

    doc.end();
  });
}
