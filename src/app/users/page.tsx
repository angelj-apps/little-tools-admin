import Image from "next/image";
import { AdminShell } from "@/components/AdminShell";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export default async function UsersPage() {
  const { email } = await requireSuperadmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("updated_at", { ascending: false });

  const profiles = (data ?? []) as Profile[];

  return (
    <AdminShell email={email}>
      <div className="hero-line">
        <div>
          <h1>Users</h1>
          <p>Read-only directory of learner profiles from the shared database.</p>
        </div>
        <span className="pill">{profiles.length} profiles</span>
      </div>

      {error ? <p className="form-error">{error.message}</p> : null}

      {profiles.length === 0 ? (
        <p className="empty">No profiles found.</p>
      ) : (
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Name</th>
                <th>Favorite drink</th>
                <th>Role</th>
                <th>Updated</th>
                <th>Id</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => {
                const name =
                  [profile.first_name, profile.last_name]
                    .filter(Boolean)
                    .join(" ") || "—";
                return (
                  <tr key={profile.id}>
                    <td>
                      {profile.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt=""
                          width={32}
                          height={32}
                          className="avatar"
                          unoptimized
                        />
                      ) : (
                        <div className="avatar" />
                      )}
                    </td>
                    <td>{name}</td>
                    <td>{profile.favorite_drink || "—"}</td>
                    <td>
                      {profile.is_superadmin ? (
                        <span className="pill pill-admin">superadmin</span>
                      ) : (
                        <span className="pill">learner</span>
                      )}
                    </td>
                    <td className="mono" style={{ fontSize: "0.78rem" }}>
                      {new Date(profile.updated_at).toLocaleString()}
                    </td>
                    <td className="mono" style={{ fontSize: "0.72rem" }}>
                      {profile.id}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
