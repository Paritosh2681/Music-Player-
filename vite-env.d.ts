// Manually defined to avoid "Cannot find type definition file for 'vite/client'" error
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env?: ImportMetaEnv;
}
