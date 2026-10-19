"use client";

import { useState, useTransition } from "react";
import { deleteMedia } from "@/app/actions/media";

export function DeleteMediaButton({ id, title }: { id: string; title: string }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <button
        type="button"
        className="admin-btn admin-btn-danger"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) {
            return;
          }
          setError("");
          startTransition(async () => {
            const result = await deleteMedia(id);
            if (result?.error) setError(result.error);
          });
        }}
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
