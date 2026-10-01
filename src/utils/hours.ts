import type { OpeningHours, Weekday } from '@/types';

export const WEEKDAYS: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

/** Current weekday and minutes-since-midnight in India Standard Time. */
export function nowInIndia(date = new Date()): { day: Weekday; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const day = get('weekday').slice(0, 3).toLowerCase() as Weekday;
  return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

export function isOpenNow(hours: OpeningHours | undefined, date = new Date()): boolean {
  if (!hours) return false;
  const { day, minutes } = nowInIndia(date);
  const today = hours[day];
  if (!today) return false;
  return minutes >= toMinutes(today.open) && minutes < toMinutes(today.close);
}

/** "09:30" → "9:30 AM" */
export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function todayLabel(hours: OpeningHours | undefined): string | undefined {
  if (!hours) return undefined;
  const { day } = nowInIndia();
  const today = hours[day];
  if (today === null) return 'Closed today';
  if (!today) return undefined;
  return `${formatTime(today.open)} – ${formatTime(today.close)}`;
}
