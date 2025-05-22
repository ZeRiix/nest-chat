import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	public getRequest(context: ExecutionContext) {
		const ctx = context.switchToHttp();
		return ctx.getRequest();
	}
}
