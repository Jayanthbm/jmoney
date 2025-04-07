create table public.categories (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  name text not null,
  type text not null,
  icon text null,
  constraint categories_pkey primary key (id),
  constraint categories_user_name_type_key unique (user_id, name, type),
  constraint categories_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint categories_type_check check (
    (
      type = any (array['Income'::text, 'Expense'::text])
    )
  )
) TABLESPACE pg_default;