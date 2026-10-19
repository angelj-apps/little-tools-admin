export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  favorite_drink: string | null;
  is_superadmin?: boolean;
  updated_at: string;
};

export type ToolCard = {
  id: string;
  user_id: string | null;
  goal: string;
  title: string;
  what_it_does: string;
  code: string;
  example_input: string;
  example_output: string;
  explanation: string;
  when_to_use: string;
  try_changing: string;
  tags: string[];
  difficulty: string;
  prompt: string;
  system_prompt: string;
  score: number;
  created_at: string;
  concept_id?: string | null;
  learner_attempt?: string | null;
};

export type ToolVote = {
  id: string;
  user_id: string;
  tool_card_id: string;
  value: number;
  created_at: string;
};
