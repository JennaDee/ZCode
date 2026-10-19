export function readAuthConfig(urlValue?: string, keyValue?: string) {
  const url = urlValue?.trim();
  const key = keyValue?.trim();
  if (!url || !key)
    throw new Error(
      "Authentication is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local, then restart Vite.",
    );
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("VITE_SUPABASE_URL must be a valid Supabase project URL.");
  }
  if (
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash ||
    (parsed.pathname !== "/" && parsed.pathname !== "") ||
    (parsed.protocol !== "https:" &&
      !(
        parsed.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(parsed.hostname)
      ))
  ) {
    throw new Error(
      "VITE_SUPABASE_URL must be an HTTPS project origin (HTTP is allowed only for local development).",
    );
  }
  if (!key.startsWith("sb_publishable_"))
    throw new Error(
      "Use a Supabase publishable key in VITE_SUPABASE_PUBLISHABLE_KEY. Secret and service-role keys must never be used in this frontend.",
    );
  return { url: parsed.origin, key };
}
