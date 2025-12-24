import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Minimal no-op client to avoid runtime crashes when SUPABASE env vars are missing/invalid
type MinimalQueryResult = Promise<{ data: unknown; error: Error }>
type MinimalFrom = {
  select: () => MinimalQueryResult
  insert: () => MinimalQueryResult
  update: () => MinimalQueryResult
  delete: () => MinimalQueryResult
  upsert: () => MinimalQueryResult
}
type MinimalSupabaseClient = {
  from: (_table: string) => MinimalFrom
  auth: {
    getSession: () => MinimalQueryResult
    getUser: () => MinimalQueryResult
  }
}

function createNoopClient(): MinimalSupabaseClient {
  const err = new Error(
    "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
  return {
    from() {
      return {
        select: async () => ({ data: null, error: err }),
        insert: async () => ({ data: null, error: err }),
        update: async () => ({ data: null, error: err }),
        delete: async () => ({ data: null, error: err }),
        upsert: async () => ({ data: null, error: err }),
      } as MinimalFrom;
    },
    auth: {
      getSession: async () => ({ data: null, error: err }),
      getUser: async () => ({ data: null, error: err }),
    },
  } as MinimalSupabaseClient;
}

export const createClient = async (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "Supabase env vars missing. Using no-op client. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
    }
    return createNoopClient();
  }

  try {
    // Validate URL at runtime to prevent "Invalid URL" crash
    // eslint-disable-next-line no-new
    new URL(supabaseUrl);
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `Invalid NEXT_PUBLIC_SUPABASE_URL: "${supabaseUrl}". Using no-op client.`
      );
    }
    return createNoopClient();
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as CookieOptions)
            );
          } catch {
            // Called from a Server Component; safe to ignore with middleware session refresh.
          }
        },
      },
    }
  );
};
