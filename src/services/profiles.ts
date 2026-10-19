import type { SupabaseClient } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  display_name: string;
  created_at: string;
  updated_at: string;
};
export async function readProfile(
  client: SupabaseClient,
  userId: string,
  signal?: AbortSignal,
): Promise<Profile | null> {
  let query = client
    .from("profiles")
    .select("id, display_name, created_at, updated_at")
    .eq("id", userId);
  if (signal) query = query.abortSignal(signal);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}
