create or replace function public.get_user_overview_current_year(uid uuid)
returns table (
  user_id uuid,
  income numeric,
  expense numeric,
  spent_percentage numeric,
  period text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  start_of_year date := date_trunc('year', now());
  end_of_year date := start_of_year + interval '1 year';
begin
  return query
  select
    uid as user_id,

    -- Total Income
    coalesce((
      select sum(amount)
      from transactions
      where transactions.user_id = uid
        and transactions.type = 'Income'
        and transactions.transaction_timestamp >= start_of_year
        and transactions.transaction_timestamp < end_of_year
    ), 0) as income,

    -- Total Expense
    coalesce((
      select sum(amount)
      from transactions
      where transactions.user_id = uid
        and transactions.type = 'Expense'
        and transactions.transaction_timestamp >= start_of_year
        and transactions.transaction_timestamp < end_of_year
    ), 0) as expense,

    -- Spent Percentage
    round(
      coalesce((
        select sum(amount)
        from transactions
        where transactions.user_id = uid
          and transactions.type = 'Expense'
          and transactions.transaction_timestamp >= start_of_year
          and transactions.transaction_timestamp < end_of_year
      ), 0)
      / nullif(
        coalesce((
          select sum(amount)
          from transactions
          where transactions.user_id = uid
            and transactions.type = 'Income'
            and transactions.transaction_timestamp >= start_of_year
            and transactions.transaction_timestamp < end_of_year
        ), 0), 0
      ) * 100, 2
    ) as spent_percentage,

    -- Period
    to_char(start_of_year, 'YYYY') as period;
end;
$$;
