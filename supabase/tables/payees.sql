create table public.payees (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  name text not null,
  logo text null,
  constraint payees_pkey primary key (id),
  constraint payees_user_name_unique unique (user_id, name),
  constraint payees_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint payees_logo_length check ((char_length(logo) <= 255)),
  constraint payees_name_not_empty check ((char_length(name) > 0))
) TABLESPACE pg_default;