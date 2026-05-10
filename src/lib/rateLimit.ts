const buckets = new Map<string, number>();

export function rateLimit(key: string, windowMs: number): boolean {
  const until = buckets.get(key) ?? 0;
  if (until > Date.now()) return false;
  buckets.set(key, Date.now() + windowMs);
  return true;
}

