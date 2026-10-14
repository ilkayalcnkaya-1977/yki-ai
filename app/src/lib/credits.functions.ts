import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getCreditsState = createServerFn({ method: "POST" })
  .validator(z.object({ accessToken: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { requireSupabaseUser, supabaseUserFetch } = await import("./supabase-rest.server");
    await requireSupabaseUser(data.accessToken);
    const response = await supabaseUserFetch(
      "/rest/v1/credit_accounts?select=balance&limit=1",
      data.accessToken,
    );
    if (!response.ok) throw new Error("Your credits could not be loaded.");
    const accounts = (await response.json()) as Array<{ balance: number }>;
    return { credits: accounts[0]?.balance ?? 0 };
  });
