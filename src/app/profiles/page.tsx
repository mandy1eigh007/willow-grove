import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import ProfilesClient from "./ProfilesClient";

type Profile = {
  id: string;
  user_id: string;
  display_name: string;
  age_mode: string;
  created_at: string;
};

type User = {
  id: string;
  email?: string;
};

export default async function ProfilesPage() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profiles } = await supabase.from('profiles').select('*').eq('user_id', user.id);

  return <ProfilesClient profiles={profiles || []} user={user} />;
}