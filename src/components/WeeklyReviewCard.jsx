import TrashIcon from "../helpers/TrashIcon.jsx";
import { JANEIN_OPTIONS, KONZENTRATION_OPTIONS, UMGANG_OPTIONS, weekRangeLabel } from "../constants.js";

export function WeeklyReviewCard({
  weekForm,
  weeklyReviews,
  updateWeekForm,
  handleSaveWeekly,
  weeklyStatus,
  loadWeekForm,
  handleDeleteWeekly,
  weekFormForceOpen,
  setWeekFormForceOpen,
  prevReviewWeek,
  nextReviewWeek,
}) {
  const currentReview = weeklyReviews.some((r) => r.weekStart === weekForm.weekStart);

  return (
    <div className="mt-card">
      <div className="mt-date-header mt-mb-1-5">
        <button type="button" onClick={prevReviewWeek} aria-label="Vorherige Woche">‹</button>
        <span>Woche vom {weekRangeLabel(weekForm.weekStart)}</span>
        <button type="button" onClick={nextReviewWeek} aria-label="Nächste Woche">›</button>
      </div>

      {currentReview || weekFormForceOpen ? (
        <>
          <h3 className="mt-check-heading">Wochenaufgabe</h3>
          <div className="mt-field-label mt-mb-0-4"><span>Machbar</span></div>
          <div className="mt-segmented">
            {JANEIN_OPTIONS.map((opt) => (
              <button type="button" key={opt} className={`mt-segment ${weekForm.machbar === opt ? "active" : ""}`} onClick={() => updateWeekForm("machbar", opt)}>{opt}</button>
            ))}
          </div>
          <div className="mt-field-label mt-mb-0-4"><span>Attraktiv</span></div>
          <div className="mt-segmented">
            {JANEIN_OPTIONS.map((opt) => (
              <button type="button" key={opt} className={`mt-segment ${weekForm.attraktiv === opt ? "active" : ""}`} onClick={() => updateWeekForm("attraktiv", opt)}>{opt}</button>
            ))}
          </div>
          <div className="mt-field-label mt-mb-0-4"><span>Verständlich</span></div>
          <div className="mt-segmented">
            {JANEIN_OPTIONS.map((opt) => (
              <button type="button" key={opt} className={`mt-segment ${weekForm.verstaendlich === opt ? "active" : ""}`} onClick={() => updateWeekForm("verstaendlich", opt)}>{opt}</button>
            ))}
          </div>

          <div className="mt-checkblock">
            <h3 className="mt-check-heading">Skills</h3>
            <div className="mt-field-label mt-mb-0-4"><span>Dauer der Konzentration</span></div>
            <div className="mt-segmented">
              {KONZENTRATION_OPTIONS.map((opt) => (
                <button type="button" key={opt} className={`mt-segment ${weekForm.konzentration === opt ? "active" : ""}`} onClick={() => updateWeekForm("konzentration", opt)}>{opt}</button>
              ))}
            </div>
            <div className="mt-field-label mt-mb-0-4"><span>Umgang mit Fokusänderung</span></div>
            <div className="mt-segmented">
              {UMGANG_OPTIONS.map((opt) => (
                <button type="button" key={opt} className={`mt-segment ${weekForm.fokusaenderung === opt ? "active" : ""}`} onClick={() => updateWeekForm("fokusaenderung", opt)}>{opt}</button>
              ))}
            </div>
            <div className="mt-field-label mt-mb-0-4"><span>Umgang mit unerwarteter Aufgabe</span></div>
            <div className="mt-segmented">
              {UMGANG_OPTIONS.map((opt) => (
                <button type="button" key={opt} className={`mt-segment ${weekForm.unerwarteteAufgabe === opt ? "active" : ""}`} onClick={() => updateWeekForm("unerwarteteAufgabe", opt)}>{opt}</button>
              ))}
            </div>
          </div>

          <div className="mt-mt-1-5">
            <button className="mt-btn" onClick={handleSaveWeekly}>
              {currentReview ? "Wochenrückblick aktualisieren" : "Wochenrückblick speichern"}
            </button>
            {weeklyStatus && <div className="mt-status">{weeklyStatus}</div>}
          </div>
        </>
      ) : (
        <div className="mt-centered-padding">
          <button className="mt-btn" onClick={() => setWeekFormForceOpen(true)}>Eintrag erfassen</button>
        </div>
      )}

      {weeklyReviews.length > 0 && (
        <div className="mt-entry-list mt-mt-1-5">
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
    </div>
  );
}
