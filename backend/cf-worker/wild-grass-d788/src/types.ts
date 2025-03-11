import { DateTime, Str } from "chanfana";
import { z } from "zod";

export const Task = z.object({
	name: Str({ example: "lorem" }),
	slug: Str(),
	description: Str({ required: false }),
	completed: z.boolean().default(false),
	due_date: DateTime(),
});

// Sử dụng định nghĩa từ Cloudflare Workers Types
export interface Env {
  MEDIA_BUCKET: R2Bucket;
}
