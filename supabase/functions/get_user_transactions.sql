create or replace function public.get_user_transactions(
  uid uuid,
  search_term text default '',
  limit_count integer default 20,
  offset_count integer default 0,
  filter_date date default null,
  filter_start_date date default null,
  filter_end_date date default null,
  filter_month int default null,
  filter_year int default null,
  filter_category_id uuid default null,
  filter_payee_id uuid default null
)
returns table (
  date date,
  id uuid,
  amount numeric,
  transaction_timestamp timestamp,
  description text,
  category_name text,
  category_icon text,
  payee_name text,
  payee_logo text,
  type text
)
language sql
as $$
  select
    date(t.transaction_timestamp) as date,
    t.id,
    t.amount,
    t.transaction_timestamp,
    t.description,
    c.name as category_name,
    c.icon as category_icon,
    p.name as payee_name,
    p.logo as payee_logo,
    t.type
  from transactions t
  left join categories c on c.id = t.category_id
  left join payees p on p.id = t.payee_id
  where t.user_id = uid
    and (
      search_term = '' or
      t.description ilike '%' || search_term || '%' or
      c.name ilike '%' || search_term || '%' or
      p.name ilike '%' || search_term || '%'
    )
    and (filter_date is null or date(t.transaction_timestamp) = filter_date)
    and (filter_start_date is null or t.transaction_timestamp >= filter_start_date)
    and (filter_end_date is null or t.transaction_timestamp <= filter_end_date)
    and (filter_month is null or extract(month from t.transaction_timestamp) = filter_month)
    and (filter_year is null or extract(year from t.transaction_timestamp) = filter_year)
    and (filter_category_id is null or t.category_id = filter_category_id)
    and (filter_payee_id is null or t.payee_id = filter_payee_id)
  order by t.transaction_timestamp desc
  limit limit_count offset offset_count;
$$;
