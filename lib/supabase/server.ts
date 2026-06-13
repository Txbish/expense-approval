import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Supabase client for Server Components, Route Handlers, and Server
 * Actions. Reads/writes the session from httpOnly cookies. Still bound to the
 * anon key + the user's session — it runs under RLS as the signed-in user, NOT
 * as a privileged role. (The service role key never appears in app code.)
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // In Server Components cookie writes throw; middleware refreshes the
          // session instead, so this is safe to ignore there.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* called from a Server Component — handled by middleware */
          }
        },
      },
    },
  );
}
