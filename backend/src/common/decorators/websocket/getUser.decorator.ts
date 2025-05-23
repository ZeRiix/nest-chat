import { type AuthenticatedSocket } from "@/common/guards/wsAuth.guard";
import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { type User } from "@prisma/output";

const GetUser = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		const client = ctx.switchToWs().getClient<AuthenticatedSocket>();
		return client.user;
	},
);

export {
	GetUser,
	type User,
};
