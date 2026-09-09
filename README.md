# MoodTracker

Eine React-App zum Erfassen von Stimmung, Energie und Arbeitstag-Reflexion,
mit geräteübergreifender Speicherung über Supabase (kostenloser Tier).

## 1. Supabase-Projekt einrichten

1. Auf [supabase.com](https://supabase.com) kostenlos registrieren und ein neues Projekt anlegen.
2. Im Dashboard unter **SQL Editor** die Datei `supabase-schema.sql` (aus diesem Ordner) einfügen und ausführen.
   Das legt die Tabellen `entries`, `weekly_reviews` und `settings` an – inklusive Row-Level-Security,
   damit jede Person nur ihre eigenen Daten sieht.
3. Unter **Project Settings → API** findest du:
   - die **Project URL**
   - den **anon public key**

## 2. Projekt lokal einrichten

```bash
npm install
cp .env.example .env
```

In der `.env`-Datei die beiden Werte aus Schritt 1 eintragen:

```
VITE_SUPABASE_URL=https://dein-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-key
```

Lokal starten:

```bash
npm run dev
```

## 3. Konto anlegen

Beim ersten Start siehst du einen Login-Bildschirm. Über "Registrieren" ein Konto mit
E-Mail und Passwort anlegen. Falls in Supabase die E-Mail-Bestätigung aktiviert ist
(Standard), muss die Bestätigungsmail erst angeklickt werden, bevor die Anmeldung
funktioniert. Das lässt sich unter **Authentication → Providers → Email** in Supabase
abschalten, falls du das nicht möchtest.

## 4. Kostenlos deployen

Die App ist ein reines Frontend (kein eigener Server nötig) und läuft z.B. kostenlos auf:

- **Vercel** (vercel.com) – Projekt-Repository verbinden, Framework "Vite" erkennt es automatisch.
- **Netlify** (netlify.com) – Build-Command `npm run build`, Publish-Verzeichnis `dist`.
- **Cloudflare Pages** (pages.cloudflare.com) – ebenfalls Build-Command `npm run build`, Output `dist`.

Wichtig: Bei allen drei Anbietern müssen die zwei Umgebungsvariablen
`VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` in den Projekteinstellungen
("Environment Variables") hinterlegt werden – genau wie in der lokalen `.env`.

Der anon key ist bewusst öffentlich nutzbar (er landet im Frontend-Code) – die
Sicherheit kommt über die Row-Level-Security-Policies in der Datenbank, nicht über
Geheimhaltung dieses Keys.

## 5. Kosten

Supabase Free Tier: 500 MB Datenbank, 50.000 monatliche aktive Nutzer, unbegrenzte
API-Requests innerhalb fairer Nutzung – für eine persönliche App wie diese reicht das
mit sehr großem Abstand aus. Vercel/Netlify/Cloudflare Pages sind für dieses
Nutzungsprofil ebenfalls kostenlos.
