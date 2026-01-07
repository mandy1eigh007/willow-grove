import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function ProfilesPage() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Profiles</h1>
      <p>Signed-in email: {user.email}</p>
      <p>Next: create profiles table + UI.</p>
    </div>
  );
}