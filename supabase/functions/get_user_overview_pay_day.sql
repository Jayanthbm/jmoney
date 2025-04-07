create or replace function public.get_user_overview_pay_day(uid uuid)
returns table (
  user_id uuid,
  date text,
  remaining_days integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  pay_day date := date_trunc('month', now() + interval '1 month');
  today date := current_date;
begin
  return query
  select
    uid as user_id,
    to_char(pay_day, 'FMMonth DD') as date,
    (pay_day - today) as remaining_days;
end;
$$;
