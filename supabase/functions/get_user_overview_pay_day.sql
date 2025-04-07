create or replace function public.get_user_overview_pay_day(uid uuid)
returns table (
  user_id uuid,
  date text,
  remaining_days integer,
  today integer,
  days_in_month integer,
  remaining_days_percentage integer
)
language plpgsql
as $$
declare
  pay_day date := date_trunc('month', now() + interval '1 month');
  today_date date := current_date;
  current_day integer := extract(day from current_date);
  total_days integer := extract(day from (date_trunc('month', current_date) + interval '1 month - 1 day'));
begin
  return query
  select
    uid as user_id,
    to_char(pay_day, 'FMMonth DD') as date,
    (pay_day - today_date) as remaining_days,
    current_day as today,
    total_days as days_in_month,
    round(((pay_day - today_date) * 100.0) / total_days)::integer as remaining_days_percentage
end;
$$;
