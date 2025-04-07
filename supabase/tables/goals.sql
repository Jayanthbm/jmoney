create table public.goals (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  name text not null,
  goal_amount numeric not null,
  current_amount numeric null default 0,
  created_at timestamp without time zone null default now(),
  logo text null,
  constraint goals_pkey primary key (id),
  constraint goals_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint goals_current_amount_check check ((current_amount >= (0)::numeric)),
  constraint goals_goal_amount_check check ((goal_amount > (0)::numeric)),
  constraint goals_logo_length check ((char_length(logo) <= 255))
) TABLESPACE pg_default;