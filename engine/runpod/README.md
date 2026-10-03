# YKI Engine GPU deployment

YKI Engine is designed to run as a private GPU worker. The web application never talks to Replicate.

Recommended first worker: NVIDIA RTX 4090 / 24GB.
Wan2.2 TI2V-5B officially supports 720P@24fps and can run on a 24GB GPU with model offload. citeturn0search0

## Required runtime secrets

YKI_ENGINE_API_KEY
YKI_SUPABASE_URL
YKI_SUPABASE_SERVICE_ROLE_KEY
WAN_MODEL_PATH

## Worker lifecycle

1. Worker starts.
2. Health check succeeds.
3. Web app submits a generation.
4. Worker executes the local Wan model.
5. Worker uploads MP4 to YKI Storage.
6. Worker calls system_complete_generation.
7. On any generation failure worker calls system_fail_generation, returning reserved credits.
8. Worker can scale to zero when idle.

Do not put the Supabase service role key in the browser.
