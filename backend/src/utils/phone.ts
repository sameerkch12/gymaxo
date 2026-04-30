export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) return digits.slice(-10);
  return digits || phone.trim();
}

export function phoneSearchValues(phone: string) {
  const trimmed = phone.trim();
  const normalized = normalizePhone(trimmed);
  return Array.from(new Set([trimmed, normalized, `91${normalized}`, `+91${normalized}`].filter(Boolean)));
}

export function phoneLooseRegex(phone: string) {
  const normalized = normalizePhone(phone);
  if (!/^\d{10}$/.test(normalized)) return null;
  return new RegExp(`^(?:\\+?91\\D*)?${normalized.split("").join("\\D*")}$`);
}
