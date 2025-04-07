create table public.transactions (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  amount numeric not null,
  transaction_timestamp timestamp without time zone not null,
  description text null,
  created_at timestamp without time zone null default now(),
  category_id uuid null,
  payee_id uuid null,
  type text not null default 'Expense'::text,
  constraint transactions_pkey primary key (id),
  constraint transactions_category_id_fkey foreign KEY (category_id) references categories (id) on delete CASCADE,
  constraint transactions_payee_id_fkey foreign KEY (payee_id) references payees (id) on delete CASCADE,
  constraint transactions_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_transactions_date on public.transactions using btree (transaction_timestamp) TABLESPACE pg_default;

create index IF not exists idx_transactions_category on public.transactions using btree (category_id) TABLESPACE pg_default;

create index IF not exists idx_transactions_payee on public.transactions using btree (payee_id) TABLESPACE pg_default;