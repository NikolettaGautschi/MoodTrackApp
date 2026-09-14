import { SUPPORT_FACTORS } from "../constants";

export function SettingsCard({ settings, persistSettings, entries, session, exportCSV }) {
  return (
    <>
      <div className="mt-card">
        <h2 className="mt-section-heading">Einstellungen</h2>
        <p className="mt-note-text mt-mb-0-5">
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
        <p className="mt-note-text mt-mb-1">
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
      </div>
    </>
  );
}
