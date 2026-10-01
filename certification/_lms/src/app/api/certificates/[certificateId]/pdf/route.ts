import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { z } from "zod";
import { getCurrentLearner } from "@/lib/learner";
import { withLearnerTransaction } from "@/lib/learner-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const idSchema = z.string().uuid();
const printable = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\x20-\x7E]/g, "?").slice(0, 150);

export async function GET(request: Request, context: { params: Promise<{ certificateId: string }> }) {
  const learner = await getCurrentLearner();
  if (!learner) return new Response("Sign in required", { status: 401, headers: { "Cache-Control": "no-store" } });
  const { certificateId } = await context.params;
  const parsedId = idSchema.safeParse(certificateId);
  if (!parsedId.success) return new Response("Certificate not found", { status: 404, headers: { "Cache-Control": "no-store" } });

  const certificate = await withLearnerTransaction(learner.id, async (client) => {
    const result = await client.query<{ id: string; public_id: string; recipient_name_snapshot: string; course_title_snapshot: string; version_number: number; issuer_name: string; credential_description: string; issued_at: Date; status: string }>(`SELECT cert.id,cert.public_id,cert.recipient_name_snapshot,cert.course_title_snapshot,v.version_number,
        cert.issuer_name,cert.credential_description,cert.issued_at,cert.status
      FROM lms.certificates cert JOIN lms.course_versions v ON v.id=cert.course_version_id
      WHERE cert.id=$1 AND cert.user_id=$2 AND cert.status='active'`, [parsedId.data, learner.id]);
    return result.rows[0] ?? null;
  });
  if (!certificate) return new Response("Certificate not found", { status: 404, headers: { "Cache-Control": "no-store" } });

  const origin = process.env.LMS_PUBLIC_URL?.replace(/\/$/, "") || new URL(request.url).origin;
  const verificationUrl = `${origin}/certificates/verify?id=${encodeURIComponent(certificate.public_id)}`;
  const qr = await QRCode.toBuffer(verificationUrl, { type: "png", errorCorrectionLevel: "M", margin: 1, width: 250 });
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${certificate.credential_description} - ${certificate.recipient_name_snapshot}`);
  pdf.setAuthor(certificate.issuer_name);
  pdf.setSubject(`Verification ID ${certificate.public_id}`);
  const page = pdf.addPage([842, 595]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const navy = rgb(0.055, 0.105, 0.19);
  const gold = rgb(0.72, 0.51, 0.12);
  const muted = rgb(0.30, 0.35, 0.42);
  page.drawRectangle({ x: 24, y: 24, width: 794, height: 547, borderColor: gold, borderWidth: 2 });
  page.drawRectangle({ x: 34, y: 34, width: 774, height: 527, borderColor: navy, borderWidth: 0.7 });
  const issuer = printable(certificate.issuer_name).toUpperCase();
  page.drawText(issuer, { x: Math.max(40, (842 - bold.widthOfTextAtSize(issuer, 13)) / 2), y: 515, size: 13, font: bold, color: navy });
  page.drawText("COURSE COMPLETION CERTIFICATE", { x: 150, y: 455, size: 28, font: bold, color: navy, maxWidth: 542 });
  page.drawText("This certifies that", { x: 300, y: 405, size: 15, font: regular, color: muted, maxWidth: 242 });
  const holder = printable(certificate.recipient_name_snapshot);
  page.drawText(holder, { x: 95, y: 365, size: 26, font: bold, color: navy, maxWidth: 652 });
  page.drawLine({ start: { x: 145, y: 352 }, end: { x: 697, y: 352 }, thickness: 1, color: gold });
  page.drawText("has completed the learning course", { x: 260, y: 320, size: 14, font: regular, color: muted, maxWidth: 322 });
  const courseTitle = printable(certificate.course_title_snapshot);
  page.drawText(courseTitle, { x: 100, y: 281, size: 21, font: bold, color: navy, maxWidth: 642 });
  page.drawText(`Course version ${certificate.version_number}  |  Issued ${new Date(certificate.issued_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}`, { x: 160, y: 238, size: 12, font: regular, color: muted, maxWidth: 522 });
  page.drawText(printable(certificate.credential_description), { x: 110, y: 208, size: 10, font: regular, color: muted, maxWidth: 622 });
  page.drawText("Educational course-completion award. It is not a government, regulator, bank, employer, or accredited qualification, and does not authorize regulated work or guarantee employment.", { x: 82, y: 112, size: 9, font: regular, color: muted, maxWidth: 540, lineHeight: 13 });
  page.drawText(`Certificate ID: ${certificate.public_id}`, { x: 82, y: 75, size: 9, font: bold, color: navy, maxWidth: 510 });
  page.drawText("Scan to verify", { x: 680, y: 66, size: 8, font: regular, color: muted });
  page.drawImage(await pdf.embedPng(qr), { x: 690, y: 90, width: 90, height: 90 });
  page.drawText(verificationUrl, { x: 82, y: 56, size: 7, font: regular, color: muted, maxWidth: 570 });
  const bytes = await pdf.save();
  const body = Uint8Array.from(bytes).buffer;
  return new Response(body, { status: 200, headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="centaur-certificate-${certificate.public_id}.pdf"`,
    "Cache-Control": "private, no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
  } });
}
