import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { type Socket as SocketIO } from "socket.io";

const Socket = createParamDecorator(
	(__: unknown, ctx: ExecutionContext) => ctx.switchToWs().getClient(),
);

export {
	Socket,
	type SocketIO,
};
