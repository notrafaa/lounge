import { NextResponse } from "next/server";
import { ensureApiSession } from "@/lib/apiAuth";
import { botApi } from "@/lib/botApi";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await ensureApiSession();
  if (denied) return denied;
  const params = await context.params;
  const supabase = supabaseServer();
  const { data, error } = await supabase.from("lounges").select("*").eq("id", params.id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await ensureApiSession();
  if (denied) return denied;
  const params = await context.params;
  const body = await request.json();
  if (body.action === "repair") return NextResponse.json(await botApi(`/lounges/${params.id}/repair`, { method: "POST", body: "{}" }));
  if (body.action === "delete") return NextResponse.json(await botApi(`/lounges/${params.id}/delete`, { method: "POST", body: "{}" }));
  if (body.action === "visibility") {
    return NextResponse.json(
      await botApi(`/lounges/${params.id}/set-visibility`, { method: "POST", body: JSON.stringify({ visibility: body.visibility }) })
    );
  }
  if (body.action === "notify") {
    return NextResponse.json(await botApi(`/lounges/${params.id}/notify`, { method: "POST", body: JSON.stringify({ message: body.message }) }));
  }
  return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
}
