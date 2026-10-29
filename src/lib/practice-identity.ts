import { configured, database } from "./supabase";
// Only the server chooses a private namespace. Never trust the cached Writing identity.
export async function practiceIdentity() {
  if (!configured()) return { local: true, owner: "guest" };
  try {
    const { data, error } = await (await database()).auth.getUser();
    return { local: false, owner: error ? null : (data.user?.id ?? null) };
  } catch {
    return { local: false, owner: null };
  }
}
