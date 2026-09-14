import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";
import { activeSupportFactors } from "../constants.js";

export function AnalyticsCard({ chartData, hiddenSeries, toggleSeries, settings, sleepMoodCorr }) {
  return (
    <div className="mt-card">
      <h2 className="mt-section-heading">Verlauf (letzte 30 Einträge)</h2>
      {chartData.length === 0 ? (
        <p className="mt-empty">Noch keine Einträge vorhanden. Trage zuerst ein paar Tage ein.</p>
      ) : (
        <div className="mt-chart-frame">
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
  );
}
