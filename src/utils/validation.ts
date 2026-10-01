const digits = (value: string) => value.replace(/\D/g, '');

/** Accepts 10-digit Indian mobile/landline numbers, with optional +91 or 0 prefix. */
export function isValidIndianPhone(value: string) {
  let d = digits(value);
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return d.length === 10 && /^[2-9]/.test(d);
}

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export function isValidUrl(value: string) {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.hostname.includes('.');
  } catch {
    return false;
  }
}
