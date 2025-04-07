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
as $$
declare
  start_of_month date := date_trunc('month', now());
  today date := current_date;
  end_of_month date := (date_trunc('month', now() + interval '1 month') - interval '1 day')::date;
  remaining_days integer := (end_of_month - today + 1);
  income_total numeric;
  expenses_till_yesterday numeric;
  today_expense numeric;
  daily numeric;
begin
  select coalesce(sum(amount), 0)
  into income_total
  from transactions
  where transactions.user_id = uid
    and transactions.type = 'Income'
    and transactions.transaction_timestamp >= start_of_month
    and transactions.transaction_timestamp < end_of_month + interval '1 day';

  select coalesce(sum(amount), 0)
  into expenses_till_yesterday
  from transactions
  where transactions.user_id = uid
    and transactions.type = 'Expense'
    and transactions.transaction_timestamp >= start_of_month
    and transactions.transaction_timestamp < today;

  select coalesce(sum(amount), 0)
  into today_expense
  from transactions
  where transactions.user_id = uid
    and transactions.type = 'Expense'
    and transactions.transaction_timestamp >= today
    and transactions.transaction_timestamp < (today + interval '1 day');

  daily := case when remaining_days > 0
    then (income_total - expenses_till_yesterday) / remaining_days
    else 0 end;

  return query
  select
    uid as user_id,
    round(daily, 2) as daily_limit,
    round(today_expense, 2) as spent,
    round(daily - today_expense, 2) as remaining,
    case
      when daily = 0 then 0
      else round(((daily - today_expense) / daily) * 100, 2)
    end as remaining_percentage;
end;
$$;
