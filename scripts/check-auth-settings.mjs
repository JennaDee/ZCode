import { loadEnv } from "vite";
const env = loadEnv("development", process.cwd(), "VITE_SUPABASE_");
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key || !key.startsWith("sb_publishable_")) {
  console.error(
    "A Supabase URL and publishable key are required. No credentials were printed.",
  );
  process.exit(1);
}
try {
  const response = await fetch(`${url.replace(/\/$/, "")}/auth/v1/settings`, {
    headers: { apikey: key },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    console.error(`Settings request failed (HTTP ${response.status}).`);
    process.exit(1);
  }
  const settings = await response.json();
  console.log(
    JSON.stringify(
      {
        emailEnabled: settings.external?.email,
        emailConfirmationRequired: settings.mailer_autoconfirm === false,
        signupsDisabled: settings.disable_signup,
        passwordPolicy:
          "Not exposed by the public settings endpoint; verify in Supabase dashboard.",
      },
      null,
      2,
    ),
  );
} catch {
  console.error(
    "Could not reach Supabase settings. No credentials were printed.",
  );
  process.exit(1);
}
