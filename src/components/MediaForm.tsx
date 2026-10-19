"use client";

import { useActionState } from "react";
import {
  createMedia,
  updateMedia,
  type MediaFormState,
} from "@/app/actions/media";
import type { ToolCard } from "@/lib/supabase/types";

const initial: MediaFormState = {};

export function MediaForm({ card }: { card?: ToolCard }) {
  const action = card
    ? updateMedia.bind(null, card.id)
    : createMedia;

  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="media-form">
      <div className="form-grid">
        <label>
          Title
          <input name="title" required defaultValue={card?.title ?? ""} />
        </label>
        <label>
          Difficulty
          <select name="difficulty" defaultValue={card?.difficulty ?? "beginner"}>
            <option value="beginner">beginner</option>
            <option value="intermediate">intermediate</option>
            <option value="advanced">advanced</option>
          </select>
        </label>
        <label className="span-2">
          Goal
          <input name="goal" required defaultValue={card?.goal ?? ""} />
        </label>
        <label className="span-2">
          What it does
          <textarea
            name="what_it_does"
            rows={2}
            required
            defaultValue={card?.what_it_does ?? ""}
          />
        </label>
        <label className="span-2">
          Code
          <textarea
            name="code"
            rows={8}
            required
            className="mono"
            defaultValue={card?.code ?? ""}
          />
        </label>
        <label>
          Example input
          <textarea
            name="example_input"
            rows={3}
            defaultValue={card?.example_input ?? ""}
          />
        </label>
        <label>
          Example output
          <textarea
            name="example_output"
            rows={3}
            defaultValue={card?.example_output ?? ""}
          />
        </label>
        <label className="span-2">
          Explanation
          <textarea
            name="explanation"
            rows={3}
            defaultValue={card?.explanation ?? ""}
          />
        </label>
        <label>
          When to use
          <textarea
            name="when_to_use"
            rows={2}
            defaultValue={card?.when_to_use ?? ""}
          />
        </label>
        <label>
          Try changing
          <textarea
            name="try_changing"
            rows={2}
            defaultValue={card?.try_changing ?? ""}
          />
        </label>
        <label>
          Tags (comma-separated)
          <input
            name="tags"
            defaultValue={(card?.tags ?? []).join(", ")}
            placeholder="lists, loops"
          />
        </label>
        <label>
          Prompt label
          <input name="prompt" defaultValue={card?.prompt ?? "admin"} />
        </label>
        <label className="span-2">
          System prompt
          <textarea
            name="system_prompt"
            rows={2}
            defaultValue={card?.system_prompt ?? "admin"}
          />
        </label>
      </div>

      {state.error ? <p className="form-error">{state.error}</p> : null}
      {state.success ? <p className="form-ok">{state.success}</p> : null}

      <div className="form-actions">
        <button type="submit" className="admin-btn admin-btn-primary" disabled={pending}>
          {pending ? "Saving…" : card ? "Update media" : "Create media"}
        </button>
      </div>
    </form>
  );
}
