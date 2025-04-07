create table public.budgets (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  name text not null,
  amount numeric not null,
  interval text not null,
  start_date date not null,
  categories text[] null,
  created_at timestamp without time zone null default now(),
  logo text null,
  constraint budgets_pkey primary key (id),
  constraint budgets_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint budgets_amount_check check ((amount > (0)::numeric)),
  constraint budgets_categories_check check ((array_length(categories, 1) is not null)),
  constraint budgets_interval_check check (
    (
      "interval" = any (
        array[
          'Once'::text,
          'Day'::text,
          'Week'::text,
          'Month'::text,
          'Year'::text
        ]
      )
    )
  ),
  constraint budgets_logo_length check ((char_length(logo) <= 255))
) TABLESPACE pg_default;