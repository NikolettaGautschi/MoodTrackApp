import { useState } from "react";
import { supabase } from "../supabaseClient.js";

export function AuthScreen() {
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
      <div className="mt-auth-shell">
        <h1 className="mt-title">MoodTracker</h1>
        <p className="mt-subtitle">
          {mode === "signin" ? "Melde dich an, um auf deine Daten zuzugreifen." : "Erstelle ein Konto, um loszulegen."}
        </p>
        <form onSubmit={handleSubmit}>
          <label className="mt-label-block mt-no-mt">E-Mail</label>
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
