"use client";

import { useActionState } from "react";
import type { CrudState } from "@/app/actions/crud";

const initial: CrudState = {};

export function CrudForm({
  action,
  children,
  submitLabel = "Save",
}: {
  action: (prev: CrudState, formData: FormData) => Promise<CrudState>;
  children: React.ReactNode;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="media-form">
      {children}
      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.success ? <p className="form-ok">{state.success}</p> : null}
      <div className="form-actions">
        <button
          type="submit"
          className="admin-btn admin-btn-primary"
          disabled={pending}
        >
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
