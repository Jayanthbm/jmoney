create or replace function public.get_user_overview_top_categories(uid uuid)
returns table (
  user_id uuid,
  name text,
  amount numeric,
  percentage numeric,
  period text
)
security definer
as $$
declare
  start_of_month date := date_trunc('month', now());
  end_of_month date := date_trunc('month', now() + interval '1 month') - interval '1 day';
  total_expense numeric := 0;
begin
  -- Calculate total expenses for the month
  select coalesce(sum(t.amount), 0) into total_expense
  from transactions t
  where t.user_id = uid
    and t.type = 'Expense'
    and t.transaction_timestamp >= start_of_month
    and t.transaction_timestamp < start_of_month + interval '1 month';

  -- Return top 2 categories + grouped "Other"
  return query
  with ranked_categories as (
    select
      t.user_id,
      c.name as category_name,
      sum(t.amount) as total_amount
    from transactions t
    join categories c on c.id = t.category_id
    where t.user_id = uid
      and t.type = 'Expense'
      and t.transaction_timestamp >= start_of_month
      and t.transaction_timestamp < start_of_month + interval '1 month'
    group by t.user_id, c.name
    order by total_amount desc
  ),
  top_two as (
    select * from ranked_categories limit 2
  ),
  others as (
    select
      rc.user_id,
      'Other' as category_name,
      sum(rc.total_amount) as total_amount
    from ranked_categories rc
    where rc.category_name not in (select category_name from top_two)
    group by rc.user_id
  ),
  combined as (
    select * from top_two
    union all
    select * from others
  )
  select
    uid as user_id,
    c.category_name as name,
    c.total_amount as amount,
    round((c.total_amount / nullif(total_expense, 0)) * 100, 2) as percentage,
    to_char(start_of_month, 'DD/MM/YY') || ' - ' || to_char(end_of_month, 'DD/MM/YY') as period
  from combined c;
end;
$$ language plpgsql;
