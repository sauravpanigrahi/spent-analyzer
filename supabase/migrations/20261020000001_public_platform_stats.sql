create or replace function public.get_public_platform_stats()
returns table (
  registered_users bigint,
  transactions_tracked bigint,
  money_managed numeric
)
language sql
stable
security definer
set search_path = ''
as $function$
  select
    (select count(*) from auth.users)::bigint,
    count(*)::bigint,
    coalesce(sum(transactions.amount), 0)::numeric
  from public.transactions as transactions;
$function$;

revoke all on function public.get_public_platform_stats()
  from public, anon, authenticated;
grant execute on function public.get_public_platform_stats()
  to anon, authenticated;
