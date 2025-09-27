// lib/crypto.ts
import crypto from "crypto";

const keyB = Buffer.from(process.env.ENCRYPTION_KEY || "", "base64");
if (keyB.length !== 32) {
  console.warn("ENCRYPTION_KEY should be 32 bytes (base64). Current length: ", keyB.length);
}

export function encryptJSON(obj: any): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyB, iv);
  const text = JSON.stringify(obj);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptJSON(b64: string): any {
  const b = Buffer.from(b64, "base64");
  const iv = b.slice(0, 12);
  const tag = b.slice(12, 28);
  const data = b.slice(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", keyB, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  return JSON.parse(dec);
}
