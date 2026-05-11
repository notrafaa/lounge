import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OWNER_SESSION_COOKIE, SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(OWNER_SESSION_COOKIE);
  redirect("/login");
}
