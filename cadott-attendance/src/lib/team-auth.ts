import crypto from "crypto";

export function signPin(pin: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(pin).digest("hex");
}

export function getPinSecret() {
  return process.env.PIN_SECRET ?? "dev-change-me";
}
