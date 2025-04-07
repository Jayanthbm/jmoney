create or replace function get_user_overview_networth(uid uuid)
returns table (
  user_id uuid,
  amount numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    uid as user_id,
    coalesce((
      select
        sum(case when t.type = 'Income' then t.amount else 0 end) -
        sum(case when t.type = 'Expense' then t.amount else 0 end)
      from public.transactions t
      where t.user_id = uid
    ), 0) as amount;
end;
$$;
