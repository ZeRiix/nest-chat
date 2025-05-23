import { zod } from "../zod";

export const envs = zod
	.object({
		VITE_BFF_ENTRYPOINT_BASE_URL: zod.string().url(),
	})
	.parse(import.meta.env);
