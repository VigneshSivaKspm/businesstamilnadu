const numberFormatter = new Intl.NumberFormat('en-IN');

export const formatNumber = (value: number) => numberFormatter.format(value);

export const pluralize = (count: number, singular: string, plural = `${singular}s`) =>
  `${formatNumber(count)} ${count === 1 ? singular : plural}`;

/** Two-letter monogram used for logo placeholders. */
export function initials(name: string): string {
  const words = name
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .split(' ')
    .filter((w) => w && !['and', 'of', 'the'].includes(w.toLowerCase()));
  return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? '?').slice(0, 2)).toUpperCase();
}

/** "+91 90000 10100" → "tel:+919000010100" */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

export const whatsappHref = (number: string, message?: string) =>
  `https://wa.me/${number.replace(/\D/g, '')}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

export const directionsHref = (query: { latitude?: number; longitude?: number; address?: string; name: string }) => {
  const destination = query.address ? `${query.name}, ${query.address}` : `${query.latitude},${query.longitude}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
};

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
