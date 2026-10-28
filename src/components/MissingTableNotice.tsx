export function MissingTableNotice({
  table,
  sqlFile = "supabase/admin-entities.sql",
}: {
  table: string;
  sqlFile?: string;
}) {
  return (
    <p className="empty">
      Table <code>{table}</code> is missing or not readable. Run{" "}
      <code>{sqlFile}</code> in the Supabase SQL editor (after{" "}
      <code>supabase/admin.sql</code>), then refresh.
    </p>
  );
}
