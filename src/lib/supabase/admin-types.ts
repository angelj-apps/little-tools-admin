export type LlmProvider = {
  id: string;
  name: string;
  slug: string;
  base_url: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type LlmModel = {
  id: string;
  provider_id: string | null;
  name: string;
  slug: string;
  max_tokens: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PromptChain = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PromptChainStep = {
  id: string;
  prompt_chain_id: string;
  position: number;
  name: string;
  prompt_template: string;
  model_id: string | null;
  created_at: string;
};

export type PromptChainMix = {
  id: string;
  prompt_chain_id: string;
  weight: number;
  label: string | null;
  updated_at: string;
};

export type Term = {
  id: string;
  slug: string;
  title: string;
  body: string;
  version: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type GenerationRequest = {
  id: string;
  user_id: string | null;
  prompt_chain_id: string | null;
  input_text: string;
  status: string;
  created_at: string;
};

export type AiGenerationExample = {
  id: string;
  title: string;
  input_text: string;
  output_text: string;
  prompt_chain_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type LlmResponse = {
  id: string;
  generation_request_id: string | null;
  model_id: string | null;
  prompt: string;
  response_text: string;
  latency_ms: number | null;
  created_at: string;
};

export type AllowedSignupDomain = {
  id: string;
  domain: string;
  notes: string | null;
  created_at: string;
};

export type WhitelistedEmail = {
  id: string;
  email: string;
  notes: string | null;
  created_at: string;
};

export type AdminImage = {
  id: string;
  path: string;
  public_url: string;
  alt_text: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
