create table public.transaction_groups (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  name text not null,
  description text null,
  created_at timestamp without time zone null default now(),
  constraint transaction_groups_pkey primary key (id),
  constraint transaction_groups_user_name_unique unique (user_id, name),
  constraint transaction_groups_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade,
  constraint transaction_groups_name_not_empty check ((char_length(name) > 0))
) tablespace pg_default;
