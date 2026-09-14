import { formatDateWithWeekday, toISODate } from "../constants.js";

export function DatePicker({
  viewDate,
  entries,
  formDate,
  pickerRef,
  pickerOpen,
  setPickerOpen,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}) {
  const monthLabel = new Date(viewDate.year, viewDate.month, 1)
    .toLocaleDateString("de-DE", { month: "long", year: "numeric" });
  const firstOfMonth = new Date(viewDate.year, viewDate.month, 1);
  const leadingOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInViewMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate();
  const calendarCells = [];
  const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  for (let i = 0; i < leadingOffset; i++) calendarCells.push(null);
  for (let day = 1; day <= daysInViewMonth; day++) {
    const dow = new Date(viewDate.year, viewDate.month, day).getDay();
    calendarCells.push({ day, isWeekend: dow === 0 || dow === 6, iso: toISODate(viewDate.year, viewDate.month, day) });
  }

  return (
    <div className="mt-datepicker" ref={pickerRef}>
      <button type="button" className="mt-date-trigger" onClick={() => setPickerOpen((o) => !o)}>
        {formatDateWithWeekday(formDate)}
      </button>
      {pickerOpen && (
        <div className="mt-date-popover">
          <div className="mt-date-header">
            <button type="button" onClick={onPrevMonth} aria-label="Vorheriger Monat">‹</button>
            <span>{monthLabel}</span>
            <button type="button" onClick={onNextMonth} aria-label="Nächster Monat">›</button>
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
                className={`mt-date-cell ${cell.isWeekend ? "weekend" : ""} ${cell.iso === formDate ? "selected" : ""} ${entries.some((e) => e.date === cell.iso) ? "has-entry" : ""}`}
                onClick={() => { onSelectDate(cell.iso); setPickerOpen(false); }}
              >
                {cell.day}
              </button>
            ) : <span key={`empty-${i}`} className="mt-date-cell empty" />)}
          </div>
        </div>
      )}
    </div>
  );
}
