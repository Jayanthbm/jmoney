create or replace function public.get_user_overview_remaining(uid uuid)
returns table (
  user_id uuid,
  period text,
  total_income numeric,
  remaining numeric,
  spent_percentage numeric,
  remaining_percentage numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    uid as user_id,
    to_char(date_trunc('month', now()), 'DD/MM/YY') || ' - ' ||
      to_char((date_trunc('month', now() + interval '1 month') - interval '1 day'), 'DD/MM/YY') as period,

    -- Total Income
    coalesce((
      select sum(amount)
      from transactions
      where transactions.user_id = uid
        and transactions.type = 'Income'
        and transactions.transaction_timestamp >= date_trunc('month', now())
        and transactions.transaction_timestamp < date_trunc('month', now() + interval '1 month')
    ), 0) as total_income,

    -- Remaining = Income - Expense
    coalesce((
      select sum(amount)
      from transactions
      where transactions.user_id = uid
        and transactions.type = 'Income'
        and transactions.transaction_timestamp >= date_trunc('month', now())
        and transactions.transaction_timestamp < date_trunc('month', now() + interval '1 month')
    ), 0)
    -
    coalesce((
      select sum(amount)
      from transactions
      where transactions.user_id = uid
        and transactions.type = 'Expense'
        and transactions.transaction_timestamp >= date_trunc('month', now())
        and transactions.transaction_timestamp < date_trunc('month', now() + interval '1 month')
    ), 0) as remaining,

    -- Spent Percentage
    round(
      case
        when coalesce((
          select sum(amount)
          from transactions
          where transactions.user_id = uid
            and transactions.type = 'Income'
            and transactions.transaction_timestamp >= date_trunc('month', now())
            and transactions.transaction_timestamp < date_trunc('month', now() + interval '1 month')
        ), 0) = 0 then 0
        else (
          coalesce((
            select sum(amount)
            from transactions
            where transactions.user_id = uid
              and transactions.type = 'Expense'
              and transactions.transaction_timestamp >= date_trunc('month', now())
              and transactions.transaction_timestamp < date_trunc('month', now() + interval '1 month')
          ), 0)
          /
          coalesce((
            select sum(amount)
            from transactions
            where transactions.user_id = uid
              and transactions.type = 'Income'
              and transactions.transaction_timestamp >= date_trunc('month', now())
              and transactions.transaction_timestamp < date_trunc('month', now() + interval '1 month')
          ), 0) * 100
        )
      end
    ) as spent_percentage,

    -- Remaining Percentage
    round(
      case
        when coalesce((
          select sum(amount)
          from transactions
          where transactions.user_id = uid
            and transactions.type = 'Income'
            and transactions.transaction_timestamp >= date_trunc('month', now())
            and transactions.transaction_timestamp < date_trunc('month', now() + interval '1 month')
        ), 0) = 0 then 0
        else (
          (
            coalesce((
              select sum(amount)
              from transactions
              where transactions.user_id = uid
                and transactions.type = 'Income'
                and transactions.transaction_timestamp >= date_trunc('month', now())
                and transactions.transaction_timestamp < date_trunc('month', now() + interval '1 month')
            ), 0)
            -
            coalesce((
              select sum(amount)
              from transactions
              where transactions.user_id = uid
                and transactions.type = 'Expense'
                and transactions.transaction_timestamp >= date_trunc('month', now())
                and transactions.transaction_timestamp < date_trunc('month', now() + interval '1 month')
            ), 0)
          )
          /
          coalesce((
            select sum(amount)
            from transactions
            where transactions.user_id = uid
              and transactions.type = 'Income'
              and transactions.transaction_timestamp >= date_trunc('month', now())
              and transactions.transaction_timestamp < date_trunc('month', now() + interval '1 month')
          ), 0) * 100
        )
      end
    ) as remaining_percentage;
end;
$$;
