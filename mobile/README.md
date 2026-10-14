# YKIA AI iOS app

Native iOS client foundation for the existing YKIA AI platform.

## Integration principles

- Keep the existing web application and video engine unchanged.
- The mobile app must call the existing authenticated backend; it must never call the GPU worker directly.
- Supabase remains the source of truth for users, generation jobs, and credit balances.
- Never ship Supabase service-role keys, engine credentials, or provider API keys in the mobile bundle.
- Verify authentication, generation status, and credit transactions against the existing backend before enabling production features.
- For digital credit packs/subscriptions sold in the iOS app, implement Apple's applicable In-App Purchase rules and server-side receipt/transaction validation.

## Initial milestones

1. Inspect current auth, Supabase schema/RLS policies, generation endpoints, and deployment URLs.
2. Create the Expo / React Native client and configure environment-based public API settings.
3. Implement sign-in and session handling using the existing auth provider.
4. Add generation creation/status/history screens using the existing backend contracts.
5. Add secure credit display and purchase flow only after backend verification.
6. Test on a physical iPhone and TestFlight before App Store submission.

## Security and cost safeguards

- Do not commit .env files or secrets.
- Do not allow the client to set its own credit balance.
- Do not deduct credits solely on the device.
- Do not report a generation as successful until the server confirms its final status.
