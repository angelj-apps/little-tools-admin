import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export async function requireSuperadmin(): Promise<{
  userId: string;
  email: string | undefined;
  profile: Profile;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_superadmin) {
    redirect("/unauthorized");
  }

  return {
    userId: user.id,
    email: user.email,
    profile: profile as Profile,
  };
}
