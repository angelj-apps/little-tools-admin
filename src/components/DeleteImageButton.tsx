"use client";

import { useState, useTransition } from "react";
import { deleteImage } from "@/app/actions/crud";

export function DeleteImageButton({ id, path }: { id: string; path: string }) {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  return (
    <div>
      <button
        type="button"
        className="admin-btn admin-btn-danger"
        disabled={pending}
        onClick={() => {
          if (!window.confirm("Delete this image from storage and the database?")) {
            return;
          }
          setError("");
          start(async () => {
            const result = await deleteImage(id, path);
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
