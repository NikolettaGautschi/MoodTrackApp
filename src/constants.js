export const CHECK_METRICS = [
  { key: "stimmung", label: "Stimmung", color: "#4E6B5C", inField: "checkinStimmung", outField: "checkoutStimmung" },
  { key: "energie", label: "Energie", color: "#C08A4E", inField: "checkinEnergie", outField: "checkoutEnergie" },
];

export const TAGESFORM_OPTIONS = ["Komfort", "Neugier", "Motiviert"];
export const TAGESGESTALTUNG_OPTIONS = ["Lernen", "Neues üben/ausprobieren", "Wiederholen", "Networking"];

export const JANEIN_OPTIONS = ["Ja", "Nein", "Keine Aussage möglich"];
export const KONZENTRATION_OPTIONS = ["Kurz", "Mittel", "Lang", "Keine Aussage möglich"];
export const UMGANG_OPTIONS = ["Gut", "Mittel", "Schwierig", "Keine Aussage möglich"];

export const SUPPORT_FACTORS = [
  { key: "schlaf", label: "Schlafqualität", color: "#5C6B8C" },
  { key: "aktivitaet", label: "Aktivität", color: "#A65B4E" },
  { key: "sozial", label: "Soziale Kontakte", color: "#8C5C7C" },
];

export const DEFAULT_SETTINGS = { schlaf: true, aktivitaet: true, sozial: true, ziel: "" };

export const NAV = [
  { key: "tage", label: "Tagesübersicht" },
  { key: "woche", label: "Wochenrückblick" },
  { key: "auswertung", label: "Auswertungen" },
  { key: "diverses", label: "Diverses" },
];

export function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function toISODate(year, month, day) {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

export function defaultWeekday() {
  const d = new Date();
  const day = d.getDay();
  if (day === 6) d.setDate(d.getDate() - 1);
  if (day === 0) d.setDate(d.getDate() - 2);
  return d.toISOString().slice(0, 10);
}

export function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toISODate(d.getFullYear(), d.getMonth(), d.getDate());
}

export function mondayOfCurrentWeek() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return toISODate(d.getFullYear(), d.getMonth(), d.getDate());
}

export function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateWithWeekday(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
}

export function weekRangeLabel(weekStartISO) {
  return `${formatDate(weekStartISO)} – ${formatDate(addDays(weekStartISO, 4))}`;
}

export function average(nums) {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function pearson(xs, ys) {
  const n = xs.length;
  if (n < 5) return null;
  const mx = average(xs), my = average(ys);
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my;
    num += dx * dy; dx2 += dx * dx; dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  if (denom === 0) return null;
  return num / denom;
}

export function activeSupportFactors(settings) {
  return SUPPORT_FACTORS.filter((f) => settings[f.key]);
}

export function entryToRow(entry, userId) {
  return {
    id: entry.id,
    user_id: userId,
    date: entry.date,
    ts: entry.timestamp,
    notiz: entry.notiz || "",
    checkin: entry.checkin || {},
    checkout: entry.checkout || {},
    schlaf: entry.schlaf ?? null,
    aktivitaet: entry.aktivitaet ?? null,
    sozial: entry.sozial ?? null,
  };
}

export function rowToEntry(row) {
  return {
    id: row.id,
    date: row.date,
    timestamp: row.ts,
    notiz: row.notiz || "",
    checkin: row.checkin || {},
    checkout: row.checkout || {},
    schlaf: row.schlaf,
    aktivitaet: row.aktivitaet,
    sozial: row.sozial,
  };
}

export function reviewToRow(review, userId) {
  return {
    id: review.id,
    user_id: userId,
    week_start: review.weekStart,
    ts: review.timestamp,
    wochenaufgabe: review.wochenaufgabe || {},
    skills: review.skills || {},
  };
}

export function rowToReview(row) {
  return {
    id: row.id,
    weekStart: row.week_start,
    timestamp: row.ts,
    wochenaufgabe: row.wochenaufgabe || {},
    skills: row.skills || {},
  };
}
