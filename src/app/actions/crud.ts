"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type CrudState = {
  error?: string;
  success?: string;
};

function str(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function bool(formData: FormData, key: string) {
  const v = formData.get(key);
  return v === "on" || v === "true" || v === "1";
}

function num(formData: FormData, key: string) {
  const raw = str(formData, key);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

async function revalidate(paths: string[]) {
  for (const path of paths) revalidatePath(path);
}

export async function deleteRow(
  table: string,
  id: string,
  returnTo: string,
): Promise<CrudState> {
  await requireSuperadmin();
  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return { error: error.message };
  await revalidate([returnTo]);
  redirect(returnTo);
}

export async function upsertProvider(
  id: string | null,
  _prev: CrudState,
  formData: FormData,
): Promise<CrudState> {
  await requireSuperadmin();
  const row = {
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    base_url: str(formData, "base_url") || null,
    notes: str(formData, "notes") || null,
    is_active: bool(formData, "is_active"),
    updated_at: new Date().toISOString(),
  };
  if (!row.name || !row.slug) return { error: "Name and slug are required." };

  const supabase = await createClient();
  const q = id
    ? supabase.from("llm_providers").update(row).eq("id", id)
    : supabase.from("llm_providers").insert(row);
  const { error } = await q;
  if (error) return { error: error.message };
  await revalidate(["/llm-providers"]);
  redirect("/llm-providers");
}

export async function upsertModel(
  id: string | null,
  _prev: CrudState,
  formData: FormData,
): Promise<CrudState> {
  await requireSuperadmin();
  const row = {
    name: str(formData, "name"),
    slug: str(formData, "slug"),
    provider_id: str(formData, "provider_id") || null,
    max_tokens: num(formData, "max_tokens"),
    is_active: bool(formData, "is_active"),
    updated_at: new Date().toISOString(),
  };
  if (!row.name || !row.slug) return { error: "Name and slug are required." };

  const supabase = await createClient();
  const q = id
    ? supabase.from("llm_models").update(row).eq("id", id)
    : supabase.from("llm_models").insert(row);
  const { error } = await q;
  if (error) return { error: error.message };
  await revalidate(["/llm-models"]);
  redirect("/llm-models");
}

export async function upsertTerm(
  id: string | null,
  _prev: CrudState,
  formData: FormData,
): Promise<CrudState> {
  await requireSuperadmin();
  const row = {
    slug: str(formData, "slug"),
    title: str(formData, "title"),
    body: str(formData, "body"),
    version: num(formData, "version") ?? 1,
    is_published: bool(formData, "is_published"),
    updated_at: new Date().toISOString(),
  };
  if (!row.slug || !row.title) return { error: "Slug and title are required." };

  const supabase = await createClient();
  const q = id
    ? supabase.from("terms").update(row).eq("id", id)
    : supabase.from("terms").insert(row);
  const { error } = await q;
  if (error) return { error: error.message };
  await revalidate(["/terms"]);
  redirect("/terms");
}

export async function upsertExample(
  id: string | null,
  _prev: CrudState,
  formData: FormData,
): Promise<CrudState> {
  await requireSuperadmin();
  const row = {
    title: str(formData, "title"),
    input_text: str(formData, "input_text"),
    output_text: str(formData, "output_text"),
    prompt_chain_id: str(formData, "prompt_chain_id") || null,
    notes: str(formData, "notes") || null,
    updated_at: new Date().toISOString(),
  };
  if (!row.title) return { error: "Title is required." };

  const supabase = await createClient();
  const q = id
    ? supabase.from("ai_generation_examples").update(row).eq("id", id)
    : supabase.from("ai_generation_examples").insert(row);
  const { error } = await q;
  if (error) return { error: error.message };
  await revalidate(["/examples"]);
  redirect("/examples");
}

export async function upsertDomain(
  id: string | null,
  _prev: CrudState,
  formData: FormData,
): Promise<CrudState> {
  await requireSuperadmin();
  const domain = str(formData, "domain").toLowerCase().replace(/^@/, "");
  const notes = str(formData, "notes") || null;
  if (!domain) return { error: "Domain is required." };

  const supabase = await createClient();
  const q = id
    ? supabase
        .from("allowed_signup_domains")
        .update({ domain, notes })
        .eq("id", id)
    : supabase.from("allowed_signup_domains").insert({ domain, notes });
  const { error } = await q;
  if (error) return { error: error.message };
  await revalidate(["/signup-domains"]);
  redirect("/signup-domains");
}

export async function upsertWhitelistEmail(
  id: string | null,
  _prev: CrudState,
  formData: FormData,
): Promise<CrudState> {
  await requireSuperadmin();
  const email = str(formData, "email").toLowerCase();
  const notes = str(formData, "notes") || null;
  if (!email.includes("@")) return { error: "Valid email required." };

  const supabase = await createClient();
  const q = id
    ? supabase.from("whitelisted_emails").update({ email, notes }).eq("id", id)
    : supabase.from("whitelisted_emails").insert({ email, notes });
  const { error } = await q;
  if (error) return { error: error.message };
  await revalidate(["/whitelist"]);
  redirect("/whitelist");
}

export async function updateMixWeights(
  _prev: CrudState,
  formData: FormData,
): Promise<CrudState> {
  await requireSuperadmin();
  const supabase = await createClient();
  const ids = formData.getAll("id").map(String);
  const weights = formData.getAll("weight").map(String);
  const labels = formData.getAll("label").map(String);

  for (let i = 0; i < ids.length; i += 1) {
    const weight = Number(weights[i]);
    if (!Number.isFinite(weight) || weight < 0) {
      return { error: `Invalid weight for row ${i + 1}.` };
    }
    const { error } = await supabase
      .from("prompt_chain_mix")
      .update({
        weight,
        label: labels[i]?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ids[i]);
    if (error) return { error: error.message };
  }

  await revalidate(["/prompt-chains/mix"]);
  return { success: "Mix updated." };
}

export async function ensureMixRow(promptChainId: string) {
  await requireSuperadmin();
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("prompt_chain_mix")
    .select("id")
    .eq("prompt_chain_id", promptChainId)
    .maybeSingle();
  if (existing) return;
  await supabase.from("prompt_chain_mix").insert({
    prompt_chain_id: promptChainId,
    weight: 0,
  });
  revalidatePath("/prompt-chains/mix");
}

export async function uploadImage(
  _prev: CrudState,
  formData: FormData,
): Promise<CrudState> {
  const { userId } = await requireSuperadmin();
  const file = formData.get("file");
  const alt = str(formData, "alt_text") || null;

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image file." };
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop() || "bin";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("admin-images")
    .upload(path, file, { upsert: false, contentType: file.type || undefined });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("admin-images").getPublicUrl(path);

  const { error } = await supabase.from("images").insert({
    path,
    public_url: publicUrl,
    alt_text: alt,
    created_by: userId,
  });

  if (error) return { error: error.message };
  await revalidate(["/images"]);
  redirect("/images");
}

export async function updateImageMeta(
  id: string,
  _prev: CrudState,
  formData: FormData,
): Promise<CrudState> {
  await requireSuperadmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("images")
    .update({
      alt_text: str(formData, "alt_text") || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  await revalidate(["/images", `/images/${id}`]);
  return { success: "Saved." };
}

export async function deleteImage(id: string, path: string): Promise<CrudState> {
  await requireSuperadmin();
  const supabase = await createClient();
  await supabase.storage.from("admin-images").remove([path]);
  const { error } = await supabase.from("images").delete().eq("id", id);
  if (error) return { error: error.message };
  await revalidate(["/images"]);
  redirect("/images");
}
