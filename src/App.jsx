import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";
import { AuthScreen } from "./components/AuthScreen";
import { DatePicker } from "./helpers/DatePicker";
import { DayEntryCard } from "./components/DayEntryCard";
import { WeeklyReviewCard } from "./components/WeeklyReviewCard";
import { AnalyticsCard } from "./components/AnalyticsCard";
import { SettingsCard } from "./components/SettingsCard";
import {
  DEFAULT_SETTINGS,
  JANEIN_OPTIONS,
  KONZENTRATION_OPTIONS,
  TAGESFORM_OPTIONS,
  TAGESGESTALTUNG_OPTIONS,
  UMGANG_OPTIONS,
  SUPPORT_FACTORS,
  activeSupportFactors,
  addDays,
  defaultWeekday,
  entryToRow,
  formatDate,
  mondayOfCurrentWeek,
  pearson,
  reviewToRow,
  rowToEntry,
  rowToReview,
  uid,
} from "./constants";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [dataTab, setDataTab] = useState("tage");

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

  if (session === undefined) {
    return (
      <div className="mt-app mt-center-screen">
        <p className="mt-loader-text">Lädt …</p>
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <div className="mt-app">
      <div className="mt-shell">
        <div className="mt-shell-header">
          <div>
            <h1 className="mt-title">MoodTracker</h1>
            <p className="mt-subtitle">Deine Stimmung und die Faktoren dahinter, im Blick.</p>
          </div>
          <div className="mt-hamburger-wrap">
            <button className="mt-hamburger" aria-label="Menü" onClick={() => setMenuOpen((s) => !s)}>
              <span></span>
              <span></span>
              <span></span>
            </button>
            {menuOpen && (
              <div className="mt-hamburger-menu">
                <button className="mt-hamburger-item" onClick={() => { setView("datenerfassung"); setMenuOpen(false); }}>Datenerfassung</button>
                <button className="mt-hamburger-item" onClick={() => { setView("auswertung"); setMenuOpen(false); }}>Auswertungen</button>
                <button className="mt-hamburger-item" onClick={() => { setView("diverses"); setMenuOpen(false); }}>Diverses</button>
                <button className="mt-hamburger-item" onClick={() => { setMenuOpen(false); handleSignOut(); }}>Abmelden</button>
              </div>
            )}
          </div>
        </div>

        <nav className="mt-nav" aria-hidden="true" />

        {view === "datenerfassung" && (
          <div className="mt-data-tabs">
            <button type="button" className={`mt-data-tab ${dataTab === "tage" ? "active" : ""}`} onClick={() => setDataTab("tage")}>Tagesüberblick</button>
            <button type="button" className={`mt-data-tab ${dataTab === "woche" ? "active" : ""}`} onClick={() => setDataTab("woche")}>Wochenrückblick</button>
          </div>
        )}

        {loading ? (
          <p className="mt-empty">Daten werden geladen …</p>
        ) : (
          <>
            {(view === "tage" || (view === "datenerfassung" && dataTab === "tage")) && (
              <>
                <div className="mt-card">
                  <label className="mt-label-block mt-no-mt">Datum</label>
                  <DatePicker
                    viewDate={viewDate}
                    entries={entries}
                    formDate={form.date}
                    pickerRef={pickerRef}
                    pickerOpen={pickerOpen}
                    setPickerOpen={setPickerOpen}
                    onPrevMonth={prevMonth}
                    onNextMonth={nextMonth}
                    onSelectDate={(iso) => loadFormForDate(iso)}
                  />
                </div>

                <DayEntryCard
                  form={form}
                  entries={entries}
                  settings={settings}
                  updateForm={updateForm}
                  handleSave={handleSave}
                  saveStatus={saveStatus}
                  loadFormForDate={loadFormForDate}
                  handleDelete={handleDelete}
                  dayFormForceOpen={dayFormForceOpen}
                  setDayFormForceOpen={setDayFormForceOpen}
                />
              </>
            )}

            {(view === "woche" || (view === "datenerfassung" && dataTab === "woche")) && (
              <WeeklyReviewCard
                weekForm={weekForm}
                weeklyReviews={weeklyReviews}
                updateWeekForm={updateWeekForm}
                handleSaveWeekly={handleSaveWeekly}
                weeklyStatus={weeklyStatus}
                loadWeekForm={loadWeekForm}
                handleDeleteWeekly={handleDeleteWeekly}
                weekFormForceOpen={weekFormForceOpen}
                setWeekFormForceOpen={setWeekFormForceOpen}
                prevReviewWeek={prevReviewWeek}
                nextReviewWeek={nextReviewWeek}
              />
            )}

            {view === "auswertung" && (
              <AnalyticsCard
                chartData={chartData}
                hiddenSeries={hiddenSeries}
                toggleSeries={toggleSeries}
                settings={settings}
                sleepMoodCorr={sleepMoodCorr}
              />
            )}

            {view === "diverses" && (
              <SettingsCard
                settings={settings}
                persistSettings={persistSettings}
                entries={entries}
                session={session}
                exportCSV={exportCSV}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
