import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "@/common/interfaces/jwt-payload.interface";
import { AuthService } from "../auth.service";
import { envs } from "@/envs";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	public constructor(@Inject(AuthService) private authService: AuthService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: envs.JWT_KEY,
		});
	}

	public validate(payload: JwtPayload) {
		return this.authService.validateUserByJwt(payload);
	}
}
