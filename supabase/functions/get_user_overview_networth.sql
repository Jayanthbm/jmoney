create or replace function private.get_user_overview_networth(uid uuid)
returns table (
  user_id uuid,
  amount numeric
)
security definer
as $$
begin
  return query
  select
    uid as user_id,
    coalesce((
      select sum(case when transactions.type = 'Income' then transactions.amount else 0 end) -
             sum(case when transactions.type = 'Expense' then transactions.amount else 0 end)
      from transactions
      where transactions.user_id = uid
    ), 0) as amount;
end;
$$ language plpgsql;
