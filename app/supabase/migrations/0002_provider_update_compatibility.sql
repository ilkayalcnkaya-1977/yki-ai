-- Compatibility settlement API for the Replicate-backed video workflow.
-- The function is intentionally service-role only; clients cannot settle provider jobs.

create or replace function public.system_apply_provider_update(
  p_provider_job_id text,
  p_status text,
  p_output_url text default null,
  p_error_code text default null,
  p_metadata jsonb default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $function$
declare
  g public.generations%rowtype;
  updated_count integer;
  v_duration numeric;
begin
  select * into g
  from public.generations
  where provider_job_id = p_provider_job_id
  for update;

  if g.id is null then
    return false;
  end if;

  if g.status in ('completed','refunded') then
    return true;
  end if;

  if p_status in ('succeeded','completed') and nullif(p_output_url, '') is not null then
    v_duration := coalesce(g.duration_seconds, 8);

    insert into public.media_assets(
      workspace_id, generation_id, kind, storage_path, mime_type, byte_size, duration_seconds
    )
    values (
      (select p.workspace_id from public.projects p where p.id = g.project_id),
      g.id, 'output_video', p_output_url, 'video/mp4', null, v_duration
    )
    on conflict (storage_path) do nothing;

    insert into public.provider_usage(
      id, generation_id, provider, model, seconds, cost_usd
    )
    values (
      gen_random_uuid(), g.id, coalesce(g.provider, 'replicate'),
      coalesce(g.model, 'google/veo-3.1-fast'), v_duration, 0
    )
    on conflict do nothing;

    update public.generations
    set status = 'completed',
        output_url = p_output_url,
        actual_duration_seconds = v_duration,
        provider_cost_usd = 0,
        credits_charged = credits_reserved,
        completed_at = now()
    where id = g.id
      and status not in ('completed','refunded');

    get diagnostics updated_count = row_count;
    return updated_count = 1;
  end if;

  if p_status in ('failed','canceled','cancelled','error') then
    return public.system_fail_generation(g.id, coalesce(nullif(p_error_code,''), 'PROVIDER_FAILED'));
  end if;

  update public.generations
  set status = case
    when p_status in ('starting','processing','queued') then p_status
    else status
  end
  where id = g.id
    and status not in ('completed','refunded');

  get diagnostics updated_count = row_count;
  return updated_count = 1;
end;
$function$;

revoke all on function public.system_apply_provider_update(text,text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.system_apply_provider_update(text,text,text,text,jsonb) to service_role;
