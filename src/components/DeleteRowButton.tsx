"use client";

import { useState, useTransition } from "react";
import { deleteRow } from "@/app/actions/crud";

export function DeleteRowButton({
  table,
  id,
  returnTo,
  label = "Delete",
}: {
  table: string;
  id: string;
  returnTo: string;
  label?: string;
}) {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return (
    <div>
      <button
        type="button"
        className="admin-btn admin-btn-danger"
        disabled={pending}
        onClick={() => {
          if (!window.confirm("Delete this row permanently?")) return;
          setError("");
          start(async () => {
            const result = await deleteRow(table, id, returnTo);
            if (result?.error) setError(result.error);
          });
        }}
      >
        {pending ? "Deleting…" : label}
      </button>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
