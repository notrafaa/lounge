import { createClient } from "@supabase/supabase-js";
import { appConfig } from "./config";

export function supabaseServer() {
  if (!appConfig.supabaseUrl || !appConfig.supabaseServiceRoleKey) {
    throw new Error("Variables Supabase serveur manquantes.");
  }

  return createClient(appConfig.supabaseUrl, appConfig.supabaseServiceRoleKey, {
    auth: { persistSession: false }
  });
}

