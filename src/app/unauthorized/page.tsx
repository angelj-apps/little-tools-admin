import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { createClient } from "@/lib/supabase/server";

export default async function UnauthorizedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="login-stage">
      <div className="login-card">
        <div className="admin-mark">
          lt<span>ops</span>
        </div>
        <h1>Not authorized</h1>
        <p>
          {user?.email
            ? `Signed in as ${user.email}, but this account is not a superadmin.`
            : "You need a superadmin profile to use this admin area."}
        </p>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          Bootstrap yourself in the Supabase SQL editor after signing in once —
          see the README.
        </p>
        <div className="form-actions">
          <SignOutButton />
          <Link href="/login" className="admin-btn admin-btn-ghost">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
