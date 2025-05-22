import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

export const MessagePayload = createParamDecorator(
	(data: string, ctx: ExecutionContext) => {
		const payload = ctx.switchToWs().getData();
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		return data ? payload[data] : payload;
	},
);
