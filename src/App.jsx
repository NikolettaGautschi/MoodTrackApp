import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { supabase } from "./supabaseClient";

function entryToRow(entry, userId) {
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

function rowToEntry(row) {
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

function reviewToRow(review, userId) {
  return {
    id: review.id,
    user_id: userId,
    week_start: review.weekStart,
    ts: review.timestamp,
    wochenaufgabe: review.wochenaufgabe || {},
    skills: review.skills || {},
  };
}

function rowToReview(row) {
  return {
    id: row.id,
    weekStart: row.week_start,
    timestamp: row.ts,
    wochenaufgabe: row.wochenaufgabe || {},
    skills: row.skills || {},
  };
}

const CHECK_METRICS = [
  { key: "stimmung", label: "Stimmung", color: "#4E6B5C", inField: "checkinStimmung", outField: "checkoutStimmung" },
  { key: "energie", label: "Energie", color: "#C08A4E", inField: "checkinEnergie", outField: "checkoutEnergie" },
];

const TAGESFORM_OPTIONS = ["Komfort", "Neugier", "Motiviert"];
const TAGESGESTALTUNG_OPTIONS = ["Lernen", "Neues üben/ausprobieren", "Wiederholen", "Networking"];

const JANEIN_OPTIONS = ["Ja", "Nein", "Keine Aussage möglich"];
const KONZENTRATION_OPTIONS = ["Kurz", "Mittel", "Lang", "Keine Aussage möglich"];
const UMGANG_OPTIONS = ["Gut", "Mittel", "Schwierig", "Keine Aussage möglich"];

const SUPPORT_FACTORS = [
  { key: "schlaf", label: "Schlafqualität", color: "#5C6B8C" },
  { key: "aktivitaet", label: "Aktivität", color: "#A65B4E" },
  { key: "sozial", label: "Soziale Kontakte", color: "#8C5C7C" },
];

const DEFAULT_SETTINGS = { schlaf: true, aktivitaet: true, sozial: true, ziel: "" };

const NAV = [
  { key: "tage", label: "Tagesübersicht" },
  { key: "woche", label: "Wochenrückblick" },
  { key: "auswertung", label: "Auswertungen" },
  { key: "diverses", label: "Diverses" },
];

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(ev) {
    ev.preventDefault();
    setError("");
    setInfo("");
    if (!email || !password) {
      setError("Bitte E-Mail und Passwort eingeben.");
      return;
    }
    setBusy(true);
    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) setError(signInError.message);
    } else {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) setError(signUpError.message);
      else setInfo("Konto erstellt. Falls E-Mail-Bestätigung aktiv ist, prüfe dein Postfach, dann anmelden.");
    }
    setBusy(false);
  }

  return (
    <div className="mt-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600&family=Karla:wght@400;500;700&display=swap');
        .mt-app { font-family: 'Karla', -apple-system, sans-serif; background: #F3EFE6; color: #2B2620; min-height: 100vh; }
        .mt-auth-shell { max-width: 360px; margin: 0 auto; padding: 4rem 1.5rem; }
        .mt-title { font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 2rem; margin: 0 0 0.25rem; }
        .mt-subtitle { font-size: 0.95rem; color: #6B6357; margin: 0 0 2rem; }
        .mt-label-block { display: block; font-size: 0.9rem; margin: 1rem 0 0.35rem; color: #6B6357; }
        .mt-text-input { width: 100%; font-family: 'Karla', sans-serif; font-size: 0.95rem; padding: 0.6rem 0.7rem; border: 1px solid #DAD3C4; border-radius: 4px; background: #fff; box-sizing: border-box; color: #2B2620; }
        .mt-btn { font-family: 'Karla', sans-serif; font-size: 0.9rem; padding: 0.65rem 1.4rem; border-radius: 4px; border: 1px solid #4E6B5C; background: #4E6B5C; color: #fff; cursor: pointer; width: 100%; margin-top: 1.5rem; }
        .mt-btn:hover { background: #3E5A4C; }
        .mt-auth-switch { background: none; border: none; color: #4E6B5C; font-size: 0.85rem; cursor: pointer; padding: 0; margin-top: 1rem; text-decoration: underline; }
        .mt-status { font-size: 0.85rem; color: #4E6B5C; margin-top: 0.75rem; }
        .mt-status-error { font-size: 0.85rem; color: #A65B4E; margin-top: 0.75rem; }
      `}</style>
      <div className="mt-auth-shell">
        <h1 className="mt-title">MoodTracker</h1>
        <p className="mt-subtitle">
          {mode === "signin" ? "Melde dich an, um auf deine Daten zuzugreifen." : "Erstelle ein Konto, um loszulegen."}
        </p>
        <form onSubmit={handleSubmit}>
          <label className="mt-label-block" style={{ marginTop: 0 }}>E-Mail</label>
          <input type="email" className="mt-text-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          <label className="mt-label-block">Passwort</label>
          <input type="password" className="mt-text-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mindestens 6 Zeichen" />
          <button className="mt-btn" type="submit" disabled={busy}>
            {mode === "signin" ? "Anmelden" : "Registrieren"}
          </button>
        </form>
        {error && <div className="mt-status-error">{error}</div>}
        {info && <div className="mt-status">{info}</div>}
        <button className="mt-auth-switch" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setInfo(""); }}>
          {mode === "signin" ? "Noch kein Konto? Registrieren" : "Schon ein Konto? Anmelden"}
        </button>
      </div>
    </div>
  );
}

function uid() {
  return (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toISODate(year, month, day) {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

function isWeekday(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  return day !== 0 && day !== 6;
}

function defaultWeekday() {
  const d = new Date();
  const day = d.getDay();
  if (day === 6) d.setDate(d.getDate() - 1);
  if (day === 0) d.setDate(d.getDate() - 2);
  return d.toISOString().slice(0, 10);
}

function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toISODate(d.getFullYear(), d.getMonth(), d.getDate());
}

function mondayOfCurrentWeek() {
  const d = new Date();
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return toISODate(d.getFullYear(), d.getMonth(), d.getDate());
}

function weekRangeLabel(weekStartISO) {
  return `${formatDate(weekStartISO)} – ${formatDate(addDays(weekStartISO, 4))}`;
}

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateWithWeekday(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
}

function average(nums) {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function pearson(xs, ys) {
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

function activeSupportFactors(settings) {
  return SUPPORT_FACTORS.filter((f) => settings[f.key]);
}

export default function MoodTracker() {
  const [session, setSession] = useState(undefined);
  const [view, setView] = useState("tage");
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [weeklyReviews, setWeeklyReviews] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saveStatus, setSaveStatus] = useState("");
  const [weeklyStatus, setWeeklyStatus] = useState("");
  const [hiddenSeries, setHiddenSeries] = useState(() => new Set());
  const [weekFormForceOpen, setWeekFormForceOpen] = useState(false);
  const [dayFormForceOpen, setDayFormForceOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  const [form, setForm] = useState({
    date: defaultWeekday(),
    checkinTagesform: TAGESFORM_OPTIONS[0],
    checkinTagesgestaltung: TAGESGESTALTUNG_OPTIONS[0],
    checkinStimmung: 5, checkinEnergie: 5,
    checkoutStimmung: 5, checkoutEnergie: 5,
    checkoutArbeitsstunden: "", checkoutArbeitsstundenInklPausen: "",
    checkoutNotiz: "",
    schlaf: 5, aktivitaet: 5, sozial: 5,
    notiz: "",
  });

  const [weekForm, setWeekForm] = useState({
    weekStart: mondayOfCurrentWeek(),
    machbar: JANEIN_OPTIONS[2],
    attraktiv: JANEIN_OPTIONS[2],
    verstaendlich: JANEIN_OPTIONS[2],
    konzentration: KONZENTRATION_OPTIONS[3],
    fokusaenderung: UMGANG_OPTIONS[3],
    unerwarteteAufgabe: UMGANG_OPTIONS[3],
  });

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(defaultWeekday() + "T00:00:00");
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      setLoading(true);
      const userId = session.user.id;

      const [entriesRes, weeklyRes, settingsRes] = await Promise.all([
        supabase.from("entries").select("*").eq("user_id", userId).order("ts", { ascending: false }),
        supabase.from("weekly_reviews").select("*").eq("user_id", userId).order("ts", { ascending: false }),
        supabase.from("settings").select("*").eq("user_id", userId).maybeSingle(),
      ]);

      const loadedEntries = (entriesRes.data || []).map(rowToEntry);
      const loadedWeekly = (weeklyRes.data || []).map(rowToReview);
      let loadedSettings = DEFAULT_SETTINGS;
      if (settingsRes.data) {
        loadedSettings = { ...DEFAULT_SETTINGS, ...settingsRes.data };
      } else {
        await supabase.from("settings").insert({ user_id: userId, ...DEFAULT_SETTINGS });
      }

      setEntries(loadedEntries);
      setWeeklyReviews(loadedWeekly);
      setSettings(loadedSettings);
      const initialDate = defaultWeekday();
      const initialEntry = loadedEntries.find((e) => e.date === initialDate);
      if (initialEntry) setForm(buildFormFromEntry(initialDate, initialEntry));
      const initialWeek = mondayOfCurrentWeek();
      const initialReview = loadedWeekly.find((r) => r.weekStart === initialWeek);
      if (initialReview) setWeekForm(buildWeekFormFromReview(initialWeek, initialReview));
      setLoading(false);
    })();
  }, [session?.user?.id]);

  async function persistSettings(next) {
    setSettings(next);
    const userId = session?.user?.id;
    if (!userId) return;
    const { error } = await supabase.from("settings").upsert({ user_id: userId, ...next });
    if (error) console.error("Einstellungen konnten nicht gespeichert werden:", error.message);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  function updateForm(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function prevMonth() {
    setViewDate((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 }));
  }

  function nextMonth() {
    setViewDate((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 }));
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false);
    }
    if (pickerOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pickerOpen]);

  function buildFormFromEntry(dateISO, entry) {
    if (!entry) {
      return {
        date: dateISO,
        checkinTagesform: TAGESFORM_OPTIONS[0],
        checkinTagesgestaltung: TAGESGESTALTUNG_OPTIONS[0],
        checkinStimmung: 5, checkinEnergie: 5,
        checkoutStimmung: 5, checkoutEnergie: 5,
        checkoutArbeitsstunden: "", checkoutArbeitsstundenInklPausen: "",
        checkoutNotiz: "",
        schlaf: 5, aktivitaet: 5, sozial: 5,
        notiz: "",
      };
    }
    return {
      date: dateISO,
      checkinTagesform: entry.checkin?.tagesform || TAGESFORM_OPTIONS[0],
      checkinTagesgestaltung: entry.checkin?.tagesgestaltung || TAGESGESTALTUNG_OPTIONS[0],
      checkinStimmung: entry.checkin?.stimmung ?? 5,
      checkinEnergie: entry.checkin?.energie ?? 5,
      checkoutStimmung: entry.checkout?.stimmung ?? 5,
      checkoutEnergie: entry.checkout?.energie ?? 5,
      checkoutArbeitsstunden: entry.checkout?.arbeitsstunden ?? "",
      checkoutArbeitsstundenInklPausen: entry.checkout?.arbeitsstundenInklPausen ?? "",
      checkoutNotiz: entry.checkout?.notiz || "",
      schlaf: entry.schlaf ?? 5,
      aktivitaet: entry.aktivitaet ?? 5,
      sozial: entry.sozial ?? 5,
      notiz: entry.notiz || "",
    };
  }

  function loadFormForDate(dateISO, sourceEntries) {
    const list = sourceEntries || entries;
    const existing = list.find((e) => e.date === dateISO);
    setForm(buildFormFromEntry(dateISO, existing));
    setDayFormForceOpen(false);
  }

  async function handleSave() {
    const userId = session?.user?.id;
    if (!userId) return;
    const entryDate = form.date || defaultWeekday();
    const existing = entries.find((e) => e.date === entryDate);
    const entry = {
      id: existing ? existing.id : uid(),
      date: entryDate,
      timestamp: new Date(entryDate + "T12:00:00").getTime() || Date.now(),
      notiz: form.notiz.trim(),
      checkin: { stimmung: Number(form.checkinStimmung), energie: Number(form.checkinEnergie), tagesform: form.checkinTagesform, tagesgestaltung: form.checkinTagesgestaltung },
      checkout: {
        stimmung: Number(form.checkoutStimmung),
        energie: Number(form.checkoutEnergie),
        arbeitsstunden: form.checkoutArbeitsstunden !== "" ? Number(form.checkoutArbeitsstunden) : null,
        arbeitsstundenInklPausen: form.checkoutArbeitsstundenInklPausen !== "" ? Number(form.checkoutArbeitsstundenInklPausen) : null,
        notiz: form.checkoutNotiz.trim(),
      },
    };
    activeSupportFactors(settings).forEach((f) => { entry[f.key] = Number(form[f.key]); });

    const { data, error } = await supabase
      .from("entries")
      .upsert(entryToRow(entry, userId), { onConflict: "user_id,date" })
      .select()
      .single();

    if (error) {
      setSaveStatus("Speichern fehlgeschlagen. Bitte erneut versuchen.");
      setTimeout(() => setSaveStatus(""), 3000);
      return;
    }

    const savedEntry = rowToEntry(data);
    const next = (existing ? entries.map((e) => (e.id === existing.id ? savedEntry : e)) : [savedEntry, ...entries])
      .sort((a, b) => b.timestamp - a.timestamp);
    setEntries(next);

    const resetDate = defaultWeekday();
    loadFormForDate(resetDate, next);
    setSaveStatus(existing ? "Eintrag aktualisiert." : "Eintrag gespeichert.");
    setTimeout(() => setSaveStatus(""), 2500);
  }

  async function handleDelete(id) {
    const { error } = await supabase.from("entries").delete().eq("id", id);
    if (error) {
      setSaveStatus("Löschen fehlgeschlagen. Bitte erneut versuchen.");
      setTimeout(() => setSaveStatus(""), 3000);
      return;
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function toggleSeries(dataKey) {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(dataKey)) next.delete(dataKey);
      else next.add(dataKey);
      return next;
    });
  }

  function updateWeekForm(key, value) {
    setWeekForm((f) => ({ ...f, [key]: value }));
  }

  function buildWeekFormFromReview(weekStart, review) {
    if (!review) {
      return {
        weekStart,
        machbar: JANEIN_OPTIONS[2],
        attraktiv: JANEIN_OPTIONS[2],
        verstaendlich: JANEIN_OPTIONS[2],
        konzentration: KONZENTRATION_OPTIONS[3],
        fokusaenderung: UMGANG_OPTIONS[3],
        unerwarteteAufgabe: UMGANG_OPTIONS[3],
      };
    }
    return {
      weekStart,
      machbar: review.wochenaufgabe?.machbar || JANEIN_OPTIONS[2],
      attraktiv: review.wochenaufgabe?.attraktiv || JANEIN_OPTIONS[2],
      verstaendlich: review.wochenaufgabe?.verstaendlich || JANEIN_OPTIONS[2],
      konzentration: review.skills?.konzentration || KONZENTRATION_OPTIONS[3],
      fokusaenderung: review.skills?.fokusaenderung || UMGANG_OPTIONS[3],
      unerwarteteAufgabe: review.skills?.unerwarteteAufgabe || UMGANG_OPTIONS[3],
    };
  }

  function loadWeekForm(weekStart, sourceReviews) {
    const list = sourceReviews || weeklyReviews;
    const existing = list.find((r) => r.weekStart === weekStart);
    setWeekForm(buildWeekFormFromReview(weekStart, existing));
    setWeekFormForceOpen(false);
  }

  function prevReviewWeek() {
    loadWeekForm(addDays(weekForm.weekStart, -7));
  }

  function nextReviewWeek() {
    loadWeekForm(addDays(weekForm.weekStart, 7));
  }

  async function handleSaveWeekly() {
    const userId = session?.user?.id;
    if (!userId) return;
    const existing = weeklyReviews.find((r) => r.weekStart === weekForm.weekStart);
    const review = {
      id: existing ? existing.id : uid(),
      weekStart: weekForm.weekStart,
      timestamp: new Date(weekForm.weekStart + "T12:00:00").getTime() || Date.now(),
      wochenaufgabe: {
        machbar: weekForm.machbar,
        attraktiv: weekForm.attraktiv,
        verstaendlich: weekForm.verstaendlich,
      },
      skills: {
        konzentration: weekForm.konzentration,
        fokusaenderung: weekForm.fokusaenderung,
        unerwarteteAufgabe: weekForm.unerwarteteAufgabe,
      },
    };

    const { data, error } = await supabase
      .from("weekly_reviews")
      .upsert(reviewToRow(review, userId), { onConflict: "user_id,week_start" })
      .select()
      .single();

    if (error) {
      setWeeklyStatus("Speichern fehlgeschlagen. Bitte erneut versuchen.");
      setTimeout(() => setWeeklyStatus(""), 3000);
      return;
    }

    const savedReview = rowToReview(data);
    const next = (existing ? weeklyReviews.map((r) => (r.id === existing.id ? savedReview : r)) : [savedReview, ...weeklyReviews])
      .sort((a, b) => b.timestamp - a.timestamp);
    setWeeklyReviews(next);
    setWeeklyStatus(existing ? "Wochenrückblick aktualisiert." : "Wochenrückblick gespeichert.");
    setTimeout(() => setWeeklyStatus(""), 2500);
  }

  async function handleDeleteWeekly(id) {
    const { error } = await supabase.from("weekly_reviews").delete().eq("id", id);
    if (error) {
      setWeeklyStatus("Löschen fehlgeschlagen. Bitte erneut versuchen.");
      setTimeout(() => setWeeklyStatus(""), 3000);
      return;
    }
    setWeeklyReviews((prev) => prev.filter((r) => r.id !== id));
  }

  const chartData = useMemo(() => {
    return [...entries]
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-30)
      .map((e) => ({
        date: formatDate(e.date),
        stimmungEin: e.checkin?.stimmung, stimmungAus: e.checkout?.stimmung,
        energieEin: e.checkin?.energie, energieAus: e.checkout?.energie,
        schlaf: e.schlaf, aktivitaet: e.aktivitaet, sozial: e.sozial,
      }));
  }, [entries]);

  const sleepMoodCorr = useMemo(() => {
    const pairs = entries.filter((e) => typeof e.schlaf === "number" && typeof e.checkin?.stimmung === "number");
    return pearson(pairs.map((e) => e.schlaf), pairs.map((e) => e.checkin.stimmung));
  }, [entries]);

  function exportCSV() {
    const headers = [
      "Datum",
      "Tagesform (Check-In)", "Tagesgestaltung (Check-In)",
      "Stimmung (Check-In)", "Energie (Check-In)",
      "Stimmung (Check-Out)", "Energie (Check-Out)",
      "Arbeitsstunden (Check-Out)", "Arbeitsstunden inkl. Pausen (Check-Out)",
      ...SUPPORT_FACTORS.map((f) => f.label),
      "Notiz", "Notiz (Check-Out)",
    ];
    const rows = [...entries].sort((a, b) => a.timestamp - b.timestamp).map((e) => [
      e.date,
      e.checkin?.tagesform ?? "", e.checkin?.tagesgestaltung ?? "",
      e.checkin?.stimmung ?? "", e.checkin?.energie ?? "",
      e.checkout?.stimmung ?? "", e.checkout?.energie ?? "",
      e.checkout?.arbeitsstunden ?? "", e.checkout?.arbeitsstundenInklPausen ?? "",
      ...SUPPORT_FACTORS.map((f) => (typeof e[f.key] === "number" ? e[f.key] : "")),
      `"${(e.notiz || "").replace(/"/g, '""')}"`,
      `"${(e.checkout?.notiz || "").replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "moodtracker-export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const monthLabel = new Date(viewDate.year, viewDate.month, 1)
    .toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const firstOfMonth = new Date(viewDate.year, viewDate.month, 1);
  const leadingOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInViewMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
  const calendarCells = [];
  for (let i = 0; i < leadingOffset; i++) calendarCells.push(null);
  for (let day = 1; day <= daysInViewMonth; day++) {
    const dow = new Date(viewDate.year, viewDate.month, day).getDay();
    calendarCells.push({ day, isWeekend: dow === 0 || dow === 6, iso: toISODate(viewDate.year, viewDate.month, day) });
  }
  const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  if (session === undefined) {
    return (
      <div className="mt-app" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "Karla, sans-serif", color: "#6B6357" }}>Lädt …</p>
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <div className="mt-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600&family=Karla:wght@400;500;700&display=swap');
        .mt-app {
          font-family: 'Karla', -apple-system, sans-serif;
          background: #F3EFE6;
          color: #2B2620;
          min-height: 100%;
          padding: 0;
        }
        .mt-shell { max-width: 880px; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }
        .mt-title { font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 2rem; margin: 0 0 0.25rem; letter-spacing: -0.01em; }
        .mt-subtitle { font-size: 0.95rem; color: #6B6357; margin: 0 0 2rem; }
        .mt-nav { display: flex; gap: 0; border-bottom: 1px solid #DAD3C4; margin-bottom: 2rem; }
        .mt-nav-item { font-family: 'Karla', sans-serif; font-size: 0.95rem; padding: 0.75rem 0; margin-right: 2rem; background: none; border: none; border-bottom: 2px solid transparent; color: #8A8272; cursor: pointer; }
        .mt-nav-item.active { color: #2B2620; border-bottom-color: #4E6B5C; font-weight: 500; }
        .mt-card { background: #FBF9F4; border: 1px solid #E4DECF; border-radius: 6px; padding: 1.5rem; margin-bottom: 1.25rem; }
        .mt-field-label { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.4rem; }
        .mt-field-label span:last-child { font-weight: 500; }
        .mt-slider-row { margin-bottom: 1.4rem; }
        .mt-slider-row input[type=range] { width: 100%; accent-color: var(--fcolor, #4E6B5C); }
        .mt-textarea, .mt-text-input { width: 100%; font-family: 'Karla', sans-serif; font-size: 0.95rem; padding: 0.6rem 0.7rem; border: 1px solid #DAD3C4; border-radius: 4px; background: #fff; box-sizing: border-box; color: #2B2620; }
        .mt-textarea { min-height: 70px; resize: vertical; }
        .mt-label-block { display: block; font-size: 0.9rem; margin: 1rem 0 0.35rem; color: #6B6357; }
        .mt-btn { font-family: 'Karla', sans-serif; font-size: 0.9rem; padding: 0.65rem 1.4rem; border-radius: 4px; border: 1px solid #4E6B5C; background: #4E6B5C; color: #fff; cursor: pointer; }
        .mt-btn:hover { background: #3E5A4C; }
        .mt-btn-secondary { background: transparent; color: #2B2620; border: 1px solid #DAD3C4; }
        .mt-btn-secondary:hover { background: #F0ECE2; }
        .mt-status { font-size: 0.85rem; color: #4E6B5C; margin-top: 0.75rem; }
        .mt-section-heading { font-family: 'Fraunces', Georgia, serif; font-size: 1.15rem; margin: 0 0 1rem; }
        .mt-entry-item { border-bottom: 1px solid #E4DECF; padding: 0.9rem 1.5rem; margin: 0 -1.5rem; cursor: pointer; }
        .mt-entry-item:last-child { border-bottom: none; }
        .mt-entry-item:nth-of-type(odd) { background: #F1EFEA; }
        .mt-entry-item:hover { filter: brightness(0.97); }
        .mt-entry-top { display: flex; justify-content: space-between; align-items: center; }
        .mt-icon-btn { background: none; border: none; color: #A65B4E; cursor: pointer; padding: 4px; display: flex; align-items: center; border-radius: 4px; }
        .mt-icon-btn:hover { background: rgba(166, 91, 78, 0.12); }
        .mt-entry-date { font-weight: 500; font-size: 0.9rem; }
        .mt-entry-values { font-size: 0.82rem; color: #6B6357; margin-top: 0.25rem; }
        .mt-entry-note { font-size: 0.88rem; margin-top: 0.4rem; }
        .mt-empty { color: #8A8272; font-size: 0.9rem; padding: 1rem 0; }
        .mt-toggle-row { display: flex; justify-content: space-between; align-items: center; padding: 0.7rem 0; border-bottom: 1px solid #E4DECF; }
        .mt-toggle-row:last-child { border-bottom: none; }
        .mt-note-text { font-size: 0.88rem; line-height: 1.6; color: #4A4438; }
        .mt-corr { font-size: 0.88rem; color: #4A4438; margin-top: 0.5rem; }
        .mt-checkblock { margin-top: 1.75rem; padding-top: 1.25rem; border-top: 1px solid #E4DECF; }
        .mt-check-heading { font-family: 'Fraunces', Georgia, serif; font-size: 1rem; font-weight: 500; margin: 0 0 0.75rem; }
        .mt-check-sub { font-family: 'Karla', sans-serif; font-size: 0.78rem; font-weight: 400; color: #8A8272; margin-left: 0.5rem; }
        .mt-segmented { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.4rem; }
        .mt-segment { font-family: 'Karla', sans-serif; font-size: 0.85rem; padding: 0.45rem 0.9rem; border: 1px solid #DAD3C4; border-radius: 4px; background: #fff; color: #6B6357; cursor: pointer; }
        .mt-segment:hover { border-color: #B9B097; }
        .mt-segment.active { background: #4E6B5C; border-color: #4E6B5C; color: #fff; }
        .mt-datepicker { position: relative; display: inline-block; margin-bottom: 1.5rem; }
        .mt-date-trigger { font-family: 'Karla', sans-serif; font-size: 0.9rem; padding: 0.55rem 0.75rem; border: 1px solid #DAD3C4; border-radius: 4px; background: #fff; cursor: pointer; color: #2B2620; width: auto; text-align: left; }
        .mt-date-trigger:hover { border-color: #B9B097; }
        .mt-date-popover { position: absolute; top: calc(100% + 6px); left: 0; z-index: 10; background: #FBF9F4; border: 1px solid #DAD3C4; border-radius: 6px; padding: 0.9rem; box-shadow: 0 4px 16px rgba(43,38,32,0.14); width: 260px; }
        .mt-date-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; font-size: 0.85rem; font-weight: 500; }
        .mt-date-header button { background: none; border: none; font-size: 1rem; cursor: pointer; color: #6B6357; padding: 0.2rem 0.5rem; }
        .mt-date-header button:hover { color: #2B2620; }
        .mt-date-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); font-size: 0.72rem; color: #8A8272; text-align: center; margin-bottom: 0.3rem; }
        .mt-date-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
        .mt-date-cell { position: relative; font-family: 'Karla', sans-serif; font-size: 0.82rem; text-align: center; padding: 0.4rem 0; border: none; background: none; border-radius: 4px; cursor: pointer; color: #2B2620; }
        .mt-date-cell:hover:not(:disabled) { background: #EFE9DA; }
        .mt-date-cell.selected { background: #4E6B5C; color: #fff; }
        .mt-date-cell.weekend { color: #C9C2B2; cursor: not-allowed; }
        .mt-date-cell.empty { visibility: hidden; }
        .mt-date-cell.has-entry::after { content: ""; position: absolute; bottom: 3px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; border-radius: 50%; background: #4E6B5C; }
        .mt-date-cell.selected.has-entry::after { background: #fff; }
      `}</style>

      <div className="mt-shell">
        <h1 className="mt-title">MoodTracker</h1>
        <p className="mt-subtitle">Deine Stimmung und die Faktoren dahinter, im Blick.</p>

        <nav className="mt-nav">
          {NAV.map((n) => (
            <button
              key={n.key}
              className={`mt-nav-item ${view === n.key ? "active" : ""}`}
              onClick={() => setView(n.key)}
            >
              {n.label}
            </button>
          ))}
        </nav>

        {loading ? (
          <p className="mt-empty">Daten werden geladen …</p>
        ) : (
          <>
            {view === "tage" && (
              <>
              <div className="mt-card">
                <label className="mt-label-block" style={{ marginTop: 0 }}>Datum</label>
                <div className="mt-datepicker" ref={pickerRef}>
                  <button
                    type="button"
                    className="mt-date-trigger"
                    onClick={() => setPickerOpen((o) => !o)}
                  >
                    {formatDateWithWeekday(form.date)}
                  </button>
                  {pickerOpen && (
                    <div className="mt-date-popover">
                      <div className="mt-date-header">
                        <button type="button" onClick={prevMonth} aria-label="Vorheriger Monat">‹</button>
                        <span>{monthLabel}</span>
                        <button type="button" onClick={nextMonth} aria-label="Nächster Monat">›</button>
                      </div>
                      <div className="mt-date-weekdays">
                        {WEEKDAY_LABELS.map((l) => <span key={l}>{l}</span>)}
                      </div>
                      <div className="mt-date-grid">
                        {calendarCells.map((cell, i) => cell ? (
                          <button
                            type="button"
                            key={cell.iso}
                            disabled={cell.isWeekend}
                            className={`mt-date-cell ${cell.isWeekend ? "weekend" : ""} ${cell.iso === form.date ? "selected" : ""} ${entries.some((e) => e.date === cell.iso) ? "has-entry" : ""}`}
                            onClick={() => { loadFormForDate(cell.iso); setPickerOpen(false); }}
                          >
                            {cell.day}
                          </button>
                        ) : <span key={`empty-${i}`} className="mt-date-cell empty" />)}
                      </div>
                    </div>
                  )}
                </div>

                {entries.some((e) => e.date === form.date) || dayFormForceOpen ? (
                  <>
                {activeSupportFactors(settings).length > 0 && (
                  <div style={{ marginTop: "1.5rem" }}>
                    {activeSupportFactors(settings).map((f) => (
                      <div className="mt-slider-row" key={f.key} style={{ "--fcolor": f.color }}>
                        <div className="mt-field-label">
                          <span>{f.label}</span>
                          <span style={{ color: f.color }}>{form[f.key]}</span>
                        </div>
                        <input
                          type="range" min="1" max="10" step="1"
                          value={form[f.key]}
                          onChange={(e) => updateForm(f.key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <label className="mt-label-block">Notiz</label>
                <textarea
                  className="mt-textarea"
                  placeholder="Was ist heute passiert?"
                  value={form.notiz}
                  onChange={(e) => updateForm("notiz", e.target.value)}
                />

                <div className="mt-checkblock">
                  <h3 className="mt-check-heading">Check-In <span className="mt-check-sub">Arbeitsbeginn</span></h3>

                  {CHECK_METRICS.map((m) => (
                    <div className="mt-slider-row" key={m.inField} style={{ "--fcolor": m.color }}>
                      <div className="mt-field-label">
                        <span>{m.label}</span>
                        <span style={{ color: m.color }}>{form[m.inField]}</span>
                      </div>
                      <input
                        type="range" min="1" max="10" step="1"
                        value={form[m.inField]}
                        onChange={(e) => updateForm(m.inField, e.target.value)}
                      />
                    </div>
                  ))}

                  <div className="mt-field-label" style={{ marginBottom: "0.4rem" }}>
                    <span>Tagesform</span>
                  </div>
                  <div className="mt-segmented">
                    {TAGESFORM_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        className={`mt-segment ${form.checkinTagesform === opt ? "active" : ""}`}
                        onClick={() => updateForm("checkinTagesform", opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  <div className="mt-field-label" style={{ marginBottom: "0.4rem" }}>
                    <span>Tagesgestaltung</span>
                  </div>
                  <div className="mt-segmented">
                    {TAGESGESTALTUNG_OPTIONS.map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        className={`mt-segment ${form.checkinTagesgestaltung === opt ? "active" : ""}`}
                        onClick={() => updateForm("checkinTagesgestaltung", opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-checkblock">
                  <h3 className="mt-check-heading">Check-Out <span className="mt-check-sub">Arbeitsende</span></h3>
                  {CHECK_METRICS.map((m) => (
                    <div className="mt-slider-row" key={m.outField} style={{ "--fcolor": m.color }}>
                      <div className="mt-field-label">
                        <span>{m.label}</span>
                        <span style={{ color: m.color }}>{form[m.outField]}</span>
                      </div>
                      <input
                        type="range" min="1" max="10" step="1"
                        value={form[m.outField]}
                        onChange={(e) => updateForm(m.outField, e.target.value)}
                      />
                    </div>
                  ))}

                  <label className="mt-label-block">Arbeitsstunden</label>
                  <input
                    type="number"
                    className="mt-text-input"
                    style={{ maxWidth: "160px" }}
                    min="0" max="24" step="0.25"
                    placeholder="z.B. 7.5"
                    value={form.checkoutArbeitsstunden}
                    onChange={(e) => updateForm("checkoutArbeitsstunden", e.target.value)}
                  />

                  <label className="mt-label-block">Arbeitsstunden inkl. Pausen</label>
                  <input
                    type="number"
                    className="mt-text-input"
                    style={{ maxWidth: "160px" }}
                    min="0" max="24" step="0.25"
                    placeholder="z.B. 8.5"
                    value={form.checkoutArbeitsstundenInklPausen}
                    onChange={(e) => updateForm("checkoutArbeitsstundenInklPausen", e.target.value)}
                  />

                  <label className="mt-label-block">Notiz</label>
                  <textarea
                    className="mt-textarea"
                    placeholder="Wie war der Arbeitstag? Highlight? Learning?"
                    value={form.checkoutNotiz}
                    onChange={(e) => updateForm("checkoutNotiz", e.target.value)}
                  />
                </div>

                <div style={{ marginTop: "1.5rem" }}>
                  <button className="mt-btn" onClick={handleSave}>
                    {entries.some((e) => e.date === form.date) ? "Eintrag aktualisieren" : "Eintrag speichern"}
                  </button>
                  {saveStatus && <div className="mt-status">{saveStatus}</div>}
                </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                    <button className="mt-btn" onClick={() => setDayFormForceOpen(true)}>Eintrag erfassen</button>
                  </div>
                )}
              </div>

                {entries.length > 0 && (
                  <div className="mt-card">
                    <h2 className="mt-section-heading">Einträge</h2>
                    {entries.map((e) => (
                      <div className="mt-entry-item" key={e.id} onClick={() => loadFormForDate(e.date)}>
                        <div className="mt-entry-top">
                          <span className="mt-entry-date">{formatDate(e.date)}</span>
                          <button
                            className="mt-icon-btn"
                            aria-label="Eintrag löschen"
                            onClick={(ev) => { ev.stopPropagation(); handleDelete(e.id); }}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {view === "woche" && (
              <>
                <div className="mt-card">
                    <div className="mt-date-header" style={{ marginBottom: "1.5rem" }}>
                      <button type="button" onClick={prevReviewWeek} aria-label="Vorherige Woche">‹</button>
                      <span>Woche vom {weekRangeLabel(weekForm.weekStart)}</span>
                      <button type="button" onClick={nextReviewWeek} aria-label="Nächste Woche">›</button>
                    </div>

                    {weeklyReviews.some((r) => r.weekStart === weekForm.weekStart) || weekFormForceOpen ? (
                      <>
                    <h3 className="mt-check-heading">Wochenaufgabe</h3>
                    <div className="mt-field-label" style={{ marginBottom: "0.4rem" }}><span>Machbar</span></div>
                    <div className="mt-segmented">
                      {JANEIN_OPTIONS.map((opt) => (
                        <button type="button" key={opt} className={`mt-segment ${weekForm.machbar === opt ? "active" : ""}`} onClick={() => updateWeekForm("machbar", opt)}>{opt}</button>
                      ))}
                    </div>
                    <div className="mt-field-label" style={{ marginBottom: "0.4rem" }}><span>Attraktiv</span></div>
                    <div className="mt-segmented">
                      {JANEIN_OPTIONS.map((opt) => (
                        <button type="button" key={opt} className={`mt-segment ${weekForm.attraktiv === opt ? "active" : ""}`} onClick={() => updateWeekForm("attraktiv", opt)}>{opt}</button>
                      ))}
                    </div>
                    <div className="mt-field-label" style={{ marginBottom: "0.4rem" }}><span>Verständlich</span></div>
                    <div className="mt-segmented">
                      {JANEIN_OPTIONS.map((opt) => (
                        <button type="button" key={opt} className={`mt-segment ${weekForm.verstaendlich === opt ? "active" : ""}`} onClick={() => updateWeekForm("verstaendlich", opt)}>{opt}</button>
                      ))}
                    </div>

                    <div className="mt-checkblock">
                      <h3 className="mt-check-heading">Skills</h3>
                      <div className="mt-field-label" style={{ marginBottom: "0.4rem" }}><span>Dauer der Konzentration</span></div>
                      <div className="mt-segmented">
                        {KONZENTRATION_OPTIONS.map((opt) => (
                          <button type="button" key={opt} className={`mt-segment ${weekForm.konzentration === opt ? "active" : ""}`} onClick={() => updateWeekForm("konzentration", opt)}>{opt}</button>
                        ))}
                      </div>
                      <div className="mt-field-label" style={{ marginBottom: "0.4rem" }}><span>Umgang mit Fokusänderung</span></div>
                      <div className="mt-segmented">
                        {UMGANG_OPTIONS.map((opt) => (
                          <button type="button" key={opt} className={`mt-segment ${weekForm.fokusaenderung === opt ? "active" : ""}`} onClick={() => updateWeekForm("fokusaenderung", opt)}>{opt}</button>
                        ))}
                      </div>
                      <div className="mt-field-label" style={{ marginBottom: "0.4rem" }}><span>Umgang mit unerwarteter Aufgabe</span></div>
                      <div className="mt-segmented">
                        {UMGANG_OPTIONS.map((opt) => (
                          <button type="button" key={opt} className={`mt-segment ${weekForm.unerwarteteAufgabe === opt ? "active" : ""}`} onClick={() => updateWeekForm("unerwarteteAufgabe", opt)}>{opt}</button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginTop: "1.5rem" }}>
                      <button className="mt-btn" onClick={handleSaveWeekly}>
                        {weeklyReviews.some((r) => r.weekStart === weekForm.weekStart) ? "Wochenrückblick aktualisieren" : "Wochenrückblick speichern"}
                      </button>
                      {weeklyStatus && <div className="mt-status">{weeklyStatus}</div>}
                    </div>
                      </>
                    ) : (
                      <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                        <button className="mt-btn" onClick={() => setWeekFormForceOpen(true)}>Eintrag erfassen</button>
                      </div>
                    )}
                  </div>

                {weeklyReviews.length > 0 && (
                  <div className="mt-card">
                    <h2 className="mt-section-heading">Frühere Wochenrückblicke</h2>
                    {weeklyReviews.map((r) => (
                      <div className="mt-entry-item" key={r.id} onClick={() => loadWeekForm(r.weekStart)}>
                        <div className="mt-entry-top">
                          <span className="mt-entry-date">Woche vom {weekRangeLabel(r.weekStart)}</span>
                          <button
                            className="mt-icon-btn"
                            aria-label="Wochenrückblick löschen"
                            onClick={(ev) => { ev.stopPropagation(); handleDeleteWeekly(r.id); }}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {view === "auswertung" && (
              <>
                <div className="mt-card">
                  <h2 className="mt-section-heading">Verlauf (letzte 30 Einträge)</h2>
                  {chartData.length === 0 ? (
                    <p className="mt-empty">Noch keine Einträge vorhanden. Trage zuerst ein paar Tage ein.</p>
                  ) : (
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <LineChart data={chartData}>
                          <CartesianGrid stroke="#E4DECF" strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8A8272" }} />
                          <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "#8A8272" }} />
                          <Tooltip contentStyle={{ fontFamily: "Karla", fontSize: 12 }} />
                          <Legend
                            onClick={(e) => toggleSeries(e.dataKey)}
                            wrapperStyle={{ fontSize: 12, cursor: "pointer" }}
                            formatter={(value, entry) => (
                              <span style={{
                                color: hiddenSeries.has(entry.dataKey) ? "#B9B097" : "#2B2620",
                                textDecoration: hiddenSeries.has(entry.dataKey) ? "line-through" : "none",
                              }}>
                                {value}
                              </span>
                            )}
                          />
                          <Line type="monotone" dataKey="stimmungEin" name="Stimmung (Check-In)" stroke="#4E6B5C" strokeWidth={2} dot={false} hide={hiddenSeries.has("stimmungEin")} />
                          <Line type="monotone" dataKey="stimmungAus" name="Stimmung (Check-Out)" stroke="#4E6B5C" strokeWidth={2} strokeDasharray="5 3" dot={false} hide={hiddenSeries.has("stimmungAus")} />
                          <Line type="monotone" dataKey="energieEin" name="Energie (Check-In)" stroke="#C08A4E" strokeWidth={2} dot={false} hide={hiddenSeries.has("energieEin")} />
                          <Line type="monotone" dataKey="energieAus" name="Energie (Check-Out)" stroke="#C08A4E" strokeWidth={2} strokeDasharray="5 3" dot={false} hide={hiddenSeries.has("energieAus")} />
                          {activeSupportFactors(settings).map((f) => (
                            <Line key={f.key} type="monotone" dataKey={f.key} name={f.label} stroke={f.color} strokeWidth={2} dot={false} hide={hiddenSeries.has(f.key)} />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {settings.schlaf && (
                    <p className="mt-corr">
                      {sleepMoodCorr === null
                        ? "Zusammenhang Schlaf/Stimmung: noch nicht genug Daten (mindestens 5 Einträge nötig)."
                        : `Zusammenhang Schlaf/Stimmung: ${sleepMoodCorr > 0.3 ? "positiver Zusammenhang" : sleepMoodCorr < -0.3 ? "negativer Zusammenhang" : "kein deutlicher Zusammenhang"} (r = ${sleepMoodCorr.toFixed(2)}).`}
                    </p>
                  )}
                </div>
              </>
            )}

            {view === "diverses" && (
              <>
                <div className="mt-card">
                  <h2 className="mt-section-heading">Einstellungen</h2>
                  <p className="mt-note-text" style={{ marginBottom: "0.5rem" }}>
                    Stimmung und Energie werden immer erfasst. Diese zusätzlichen Faktoren kannst du an- oder abschalten.
                  </p>
                  {SUPPORT_FACTORS.map((f) => (
                    <div className="mt-toggle-row" key={f.key}>
                      <span>{f.label}</span>
                      <input
                        type="checkbox"
                        checked={!!settings[f.key]}
                        onChange={(e) => persistSettings({ ...settings, [f.key]: e.target.checked })}
                      />
                    </div>
                  ))}
                  <label className="mt-label-block">Dein Ziel (optional)</label>
                  <input
                    className="mt-text-input"
                    placeholder="z.B. Regelmäßiger schlafen"
                    value={settings.ziel}
                    onChange={(e) => persistSettings({ ...settings, ziel: e.target.value })}
                  />
                </div>

                <div className="mt-card">
                  <h2 className="mt-section-heading">Export</h2>
                  <p className="mt-note-text" style={{ marginBottom: "1rem" }}>
                    Lade alle deine Einträge als CSV-Datei herunter, z.B. für eine eigene Auswertung.
                  </p>
                  <button className="mt-btn mt-btn-secondary" onClick={exportCSV} disabled={entries.length === 0}>
                    Als CSV exportieren
                  </button>
                </div>

                <div className="mt-card">
                  <h2 className="mt-section-heading">Über MoodTracker</h2>
                  <p className="mt-note-text">
                    Deine Einträge sind an dein Konto ({session.user.email}) gebunden und stehen dir
                    geräteübergreifend zur Verfügung. {entries.length} {entries.length === 1 ? "Eintrag" : "Einträge"} bisher erfasst.
                  </p>
                  <button className="mt-btn mt-btn-secondary" style={{ marginTop: "1rem" }} onClick={handleSignOut}>
                    Abmelden
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
