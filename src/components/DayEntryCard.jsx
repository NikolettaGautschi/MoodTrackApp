import TrashIcon from "../helpers/TrashIcon.jsx";
import {
  CHECK_METRICS,
  TAGESFORM_OPTIONS,
  TAGESGESTALTUNG_OPTIONS,
  formatDate,
  activeSupportFactors,
} from "../constants.js";

export function DayEntryCard({
  form,
  entries,
  settings,
  updateForm,
  handleSave,
  saveStatus,
  loadFormForDate,
  handleDelete,
  dayFormForceOpen,
  setDayFormForceOpen,
}) {
  const currentEntry = entries.some((e) => e.date === form.date);

  return (
    <div className="mt-card">
      {currentEntry || dayFormForceOpen ? (
        <>
          {activeSupportFactors(settings).length > 0 && (
            <div className="mt-mt-1-5">
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

            <div className="mt-field-label mt-mb-0-4"><span>Tagesform</span></div>
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

            <div className="mt-field-label mt-mb-0-4"><span>Tagesgestaltung</span></div>
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
              className="mt-text-input mt-maxw-160"
              min="0" max="24" step="0.25"
              placeholder="z.B. 7.5"
              value={form.checkoutArbeitsstunden}
              onChange={(e) => updateForm("checkoutArbeitsstunden", e.target.value)}
            />

            <label className="mt-label-block">Arbeitsstunden inkl. Pausen</label>
            <input
              type="number"
              className="mt-text-input mt-maxw-160"
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

          <div className="mt-mt-1-5">
            <button className="mt-btn" onClick={handleSave}>
              {currentEntry ? "Eintrag aktualisieren" : "Eintrag speichern"}
            </button>
            {saveStatus && <div className="mt-status">{saveStatus}</div>}
          </div>
        </>
      ) : (
        <div className="mt-centered-padding">
          <button className="mt-btn" onClick={() => setDayFormForceOpen(true)}>Eintrag erfassen</button>
        </div>
      )}

      {entries.length > 0 && (
        <div className="mt-entry-list mt-mt-1-5">
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
    </div>
  );
}
