import Link from "next/link";
import { AdminShell } from "@/components/AdminShell";
import { DeleteRowButton } from "@/components/DeleteRowButton";
import { MissingTableNotice } from "@/components/MissingTableNotice";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AiGenerationExample } from "@/lib/supabase/admin-types";

export default async function ExamplesPage() {
  const { email } = await requireSuperadmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_generation_examples")
    .select("*")
    .order("updated_at", { ascending: false });
  const rows = (data ?? []) as AiGenerationExample[];

  return (
    <AdminShell email={email}>
      <div className="toolbar">
        <div>
          <h1>AI generation examples</h1>
          <p style={{ color: "var(--muted)", margin: "0.35rem 0 0" }}>
            Curated input/output pairs for prompting and QA.
          </p>
        </div>
        <Link href="/examples/new" className="admin-btn admin-btn-primary">
          New example
        </Link>
      </div>
      {error ? <MissingTableNotice table="ai_generation_examples" /> : null}
      {!error && rows.length === 0 ? <p className="empty">No examples yet.</p> : null}
      {!error && rows.length > 0 ? (
        <div className="panel" style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Input</th>
                <th>Output</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.title}</strong>
                  </td>
                  <td>{row.input_text.slice(0, 80)}</td>
                  <td>{row.output_text.slice(0, 80)}</td>
                  <td style={{ display: "flex", gap: "0.4rem" }}>
                    <Link href={`/examples/${row.id}`} className="admin-btn admin-btn-ghost">
                      Edit
                    </Link>
                    <DeleteRowButton
                      table="ai_generation_examples"
                      id={row.id}
                      returnTo="/examples"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </AdminShell>
  );
}
