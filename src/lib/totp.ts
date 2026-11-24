// Hand-rolled TOTP (RFC 6238, the standard behind Google Authenticator /
// Authy / 1Password codes) — same reasoning as the HMAC-signed tokens in
// adminSession.ts and adminLink.ts: this is just HMAC-SHA1 plus a small
// amount of bit-twiddling, so a dependency isn't worth adding for it.
// 30-second period, 6 digits — the universal defaults every authenticator
// app assumes when you enter a secret manually (no QR code needed).

import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const PERIOD_SECONDS = 30;
const DIGITS = 6;
// Accept the previous and next 30s step too, so small clock drift between
// the server and the admin's phone doesn't lock anyone out.
const WINDOW = 1;

export function generateBase32Secret(byteLength = 20): string {
  return encodeBase32(randomBytes(byteLength));
}

function encodeBase32(buffer: Buffer): string {
  let bits = "";
  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, "0");
  }

  let output = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    output += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  }

  const remainder = bits.length % 5;
  if (remainder !== 0) {
    const lastChunk = bits.slice(bits.length - remainder).padEnd(5, "0");
    output += BASE32_ALPHABET[parseInt(lastChunk, 2)];
  }

  return output;
}

function decodeBase32(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");

  let bits = "";
  for (const char of clean) {
    const value = BASE32_ALPHABET.indexOf(char);
    if (value === -1) continue;
    bits += value.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }

  return Buffer.from(bytes);
}

// RFC 4226 HOTP — a TOTP code is just this with counter = unix time / 30.
function hotp(secret: Buffer, counter: number): string {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  counterBuffer.writeUInt32BE(counter % 2 ** 32, 4);

  const hmac = createHmac("sha1", secret).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binCode =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (binCode % 10 ** DIGITS).toString().padStart(DIGITS, "0");
}

export function verifyTotpCode(base32Secret: string, code: string): boolean {
  const trimmed = code.trim();
  if (!/^\d{6}$/.test(trimmed)) return false;

  const secret = decodeBase32(base32Secret);
  const counter = Math.floor(Date.now() / 1000 / PERIOD_SECONDS);
  const submitted = Buffer.from(trimmed);

  for (let step = -WINDOW; step <= WINDOW; step++) {
    const expected = Buffer.from(hotp(secret, counter + step));
    if (expected.length === submitted.length && timingSafeEqual(expected, submitted)) {
      return true;
    }
  }

  return false;
}
