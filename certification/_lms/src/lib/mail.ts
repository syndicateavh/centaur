import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { logServerError } from "@/lib/logger";

type AuthEmail = { to: string; subject: string; text: string; actionUrl: string };
export type LocalMailPreview = AuthEmail & { id: string; createdAt: string };

const mailPreviewDirectory = path.resolve(process.cwd(), ".dev-mail");
let smtpTransport: Transporter | undefined;

export function isEmailDeliveryConfigured() {
  if (process.env.NODE_ENV === "development") return true;
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);
}

export async function sendAuthEmail(message: AuthEmail) {
  if (process.env.NODE_ENV === "development") {
    const preview: LocalMailPreview = { ...message, id: randomUUID(), createdAt: new Date().toISOString() };
    await mkdir(mailPreviewDirectory, { recursive: true });
    await writeFile(path.join(mailPreviewDirectory, `${preview.createdAt.replaceAll(":", "-")}-${preview.id}.json`), JSON.stringify(preview, null, 2), { mode: 0o600 });
    return;
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_FROM) {
    throw new Error("The approved internal SMTP relay is not configured.");
  }

  smtpTransport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? "25"),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER && process.env.SMTP_PASSWORD
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });

  await smtpTransport.sendMail({ from: process.env.SMTP_FROM, to: message.to, subject: message.subject, text: `${message.text}\n\n${message.actionUrl}` });
}

export async function listLocalMailPreviews() {
  if (process.env.NODE_ENV !== "development") return [];
  try {
    const names = (await readdir(mailPreviewDirectory)).filter((name) => /^[0-9T.-]+-[0-9a-f-]+\.json$/i.test(name)).sort().reverse().slice(0, 30);
    const previews = await Promise.all(names.map(async (name) => {
      try {
        return JSON.parse(await readFile(path.join(mailPreviewDirectory, name), "utf8")) as LocalMailPreview;
      } catch (error) {
        logServerError("auth.mail_preview.read_failed", error);
        return null;
      }
    }));
    return previews.filter((preview): preview is LocalMailPreview => preview !== null);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") logServerError("auth.mail_preview.list_failed", error);
    return [];
  }
}
