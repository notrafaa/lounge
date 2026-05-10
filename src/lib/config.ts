export const appConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Lounge Dashboard",
  guildId: process.env.NEXT_PUBLIC_DISCORD_GUILD_ID ?? process.env.DISCORD_GUILD_ID ?? "",
  botApiBaseUrl: process.env.BOT_API_BASE_URL ?? "http://localhost:4000",
  botApiSecret: process.env.BOT_API_SECRET ?? "",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
};

