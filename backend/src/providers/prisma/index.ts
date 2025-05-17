import { envs } from "@/envs";
import { PrismaClient } from "@prisma/output";

export const prismaClient = new PrismaClient();

if (envs.DB_CONNECTION) {
	await prismaClient.$connect();
}
