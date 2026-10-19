"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type MediaFormState = {
  error?: string;
  success?: string;
};

function parseTags(raw: string): string[] {
  return raw
    .split(/[,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function readFields(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    goal: String(formData.get("goal") ?? "").trim(),
    what_it_does: String(formData.get("what_it_does") ?? "").trim(),
    code: String(formData.get("code") ?? "").trim(),
    example_input: String(formData.get("example_input") ?? "").trim(),
    example_output: String(formData.get("example_output") ?? "").trim(),
    explanation: String(formData.get("explanation") ?? "").trim(),
    when_to_use: String(formData.get("when_to_use") ?? "").trim(),
    try_changing: String(formData.get("try_changing") ?? "").trim(),
    tags: parseTags(String(formData.get("tags") ?? "")),
    difficulty: String(formData.get("difficulty") ?? "beginner").trim() || "beginner",
    prompt: String(formData.get("prompt") ?? "").trim() || "admin",
    system_prompt:
      String(formData.get("system_prompt") ?? "").trim() || "admin",
  };
}

function validate(fields: ReturnType<typeof readFields>): string | null {
  if (!fields.title) return "Title is required.";
  if (!fields.goal) return "Goal is required.";
  if (!fields.code) return "Code is required.";
  if (!fields.what_it_does) return "What it does is required.";
  return null;
}

export async function createMedia(
  _prev: MediaFormState,
  formData: FormData,
): Promise<MediaFormState> {
  const { userId } = await requireSuperadmin();
  const fields = readFields(formData);
  const error = validate(fields);
  if (error) return { error };

  const supabase = await createClient();
  const { data, error: insertError } = await supabase
    .from("tool_cards")
    .insert({
      ...fields,
      user_id: userId,
      score: 0,
    })
    .select("id")
    .single();

  if (insertError || !data) {
    return { error: insertError?.message ?? "Could not create media." };
  }

  revalidatePath("/media");
  revalidatePath("/");
  redirect(`/media/${data.id}`);
}

export async function updateMedia(
  id: string,
  _prev: MediaFormState,
  formData: FormData,
): Promise<MediaFormState> {
  await requireSuperadmin();
  const fields = readFields(formData);
  const error = validate(fields);
  if (error) return { error };

  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from("tool_cards")
    .update(fields)
    .eq("id", id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/media");
  revalidatePath(`/media/${id}`);
  revalidatePath("/");
  return { success: "Saved." };
}

export async function deleteMedia(id: string): Promise<MediaFormState> {
  await requireSuperadmin();
  const supabase = await createClient();
  const { error } = await supabase.from("tool_cards").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/media");
  revalidatePath("/");
  redirect("/media");
}
