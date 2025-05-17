import { z as zod } from "zod";
import { config as importEnvFile } from "dotenv";
import { expand as expandEnv } from "dotenv-expand";

for (const pathEnv of [".env.local", ".env"]) {
	expandEnv(
		importEnvFile({ path: pathEnv }),
	);
}

const minLenghtJWTKey = 10;

export const envs = zod
	.object({
		PORT: zod.coerce.number(),
		HOST: zod.enum(["0.0.0.0"]),
		JWT_KEY: zod.string().min(minLenghtJWTKey),
		JWT_TIME: zod.string(),
		DB_CONNECTION: zod.enum(["true", "false"]).transform((value) => value === "true"),
	})
	.parse(process.env);
