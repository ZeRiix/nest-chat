import { Controller, Post, Body, Res, HttpStatus, Inject, Get, Param } from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { EndPointRegisterDto, RegisterDto } from "./dto/register.dto";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Authentification")
@Controller()
export class AuthController {
	public constructor(@Inject(AuthService) private readonly authService: AuthService) {}

	@ApiOperation({ summary: "Inscription utilisateur" })
	@ApiResponse({
		status: 201,
		description: "Inscription réussie",
		type: () => EndPointRegisterDto,
	})
	@ApiResponse({
		status: 400,
		description: "Données invalides",
	})
	@ApiBody({ type: () => RegisterDto })
	@Post("register")
	public async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
		const userExists = await this.authService.emailIsAlreadyUsed(registerDto.email);
		if (userExists) {
			return res
				.status(HttpStatus.BAD_REQUEST)
				.send();
		}

		const { id, email } = await this.authService.register(registerDto);

		return res
			.status(HttpStatus.CREATED)
			.json({
				id,
				email,
			})
			.send();
	}

	@ApiOperation({ summary: "Connexion utilisateur" })
	@ApiResponse({
		status: 200,
		description: "Connecté avec succès",
		type: () => EndPointRegisterDto,
	})
	@ApiResponse({
		status: 401,
		description: "Identifiants invalides",
	})
	@ApiBody({ type: () => LoginDto })
	@Post("login")
	public async login(@Body() loginDto: LoginDto, @Res() res: Response) {
		const token = await this.authService.login(loginDto);

		if (!token) {
			return res
				.status(HttpStatus.UNAUTHORIZED)
				.send();
		}

		return res
			.status(HttpStatus.OK)
			.json({
				accessToken: token.accessToken,
			})
			.send();
	}

	@Get("users/:id")
	public async getUserById(@Param() params: { id: string }, @Res() res: Response) {
		const user = await this.authService.getUserById(parseInt(params.id));

		if (!user) {
			return res
				.status(HttpStatus.NOT_FOUND)
				.send();
		}

		return res
			.status(HttpStatus.OK)
			.json({
				id: user.id,
				email: user.email,
			});
	}
}
