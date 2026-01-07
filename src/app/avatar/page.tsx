import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import AvatarClient from "./AvatarClient";

export default async function AvatarPage() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <AvatarClient />;
}
