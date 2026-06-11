import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** False when the build is missing Supabase env vars — auth is disabled. */
export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  console.error(
    'Supabase is not configured. Set the VITE_SUPABASE_URL and ' +
      'VITE_SUPABASE_ANON_KEY environment variables at build time. ' +
      'The app will render but authentication is disabled.',
  )
}

// Placeholder values keep createClient from throwing at module load when
// env vars are missing, which would otherwise blank the entire app.
// Auth calls are short-circuited in the auth store via isSupabaseConfigured.
export const supabase: SupabaseClient = createClient(
  url || 'https://unconfigured.supabase.co',
  anonKey || 'unconfigured',
)
