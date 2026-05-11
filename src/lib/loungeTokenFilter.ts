const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function safeLoungeToken(value: string): string | null {
  const token = value.replace(/[^a-zA-Z0-9-]/g, "");
  return token && token === value ? token : null;
}

export function loungeTokenFilter(token: string): string {
  return uuidPattern.test(token) ? `studio_token.eq.${token},id.eq.${token}` : `studio_token.eq.${token}`;
}
