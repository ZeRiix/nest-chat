import { Injectable, CanActivate, ExecutionContext, Inject } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { AuthService } from "@/modules/auth/auth.service";
import { Socket } from "socket.io";
import { User } from "@prisma/output";
import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { envs } from "@/envs";

export interface AuthenticatedSocket extends Socket {
	user: User;
}

const paylaodPartOfTokenNumber = 1;

@Injectable()
export class WsAuthGuard implements CanActivate {
	public constructor(
		@Inject(AuthService) private readonly authService: AuthService,
		@Inject(JwtService) private readonly jwtService: JwtService,
	) {}

	public async canActivate(context: ExecutionContext) {
		const client = context.switchToWs().getClient<AuthenticatedSocket>();
		const token = client.handshake?.headers?.authorization;

		if (!token) {
			throw new WsException("Unauthorized");
		}

		const payload = this.jwtService.verify<JwtPayload>(
			token.split(" ")[paylaodPartOfTokenNumber],
			{
				ignoreExpiration: false,
				secret: envs.JWT_KEY,
			},
		);

		const user = await this.authService.validateUserByJwt(payload);

		if (user === null) {
			throw new WsException("Unauthorized");
		}

		client.user = user;

		return true;
	}
}
