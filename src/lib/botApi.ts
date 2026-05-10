import { appConfig } from "./config";

export async function botApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${appConfig.botApiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${appConfig.botApiSecret}`,
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? `Bot API HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getBotStatus() {
  return botApi<{ online: boolean; guildCount: number; uptime: number; bot: string }>("/health").catch(() => ({
    online: false,
    guildCount: 0,
    uptime: 0,
    bot: "Louna"
  }));
}

