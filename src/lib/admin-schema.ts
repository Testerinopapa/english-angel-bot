import { z } from "zod";

export const settingsUpdateSchema = z.object({
  bot_enabled: z.boolean().optional(),
  store_message_content: z.boolean().optional(),
  system_prompt: z.string().min(20).max(8000).optional(),
});

export type SettingsUpdate = z.infer<typeof settingsUpdateSchema>;
