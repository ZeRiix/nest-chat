import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { type User } from "@prisma/output";

const GetUser = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		return (request as { user: User }).user;
	},
);

export {
	GetUser,
	type User,
};
