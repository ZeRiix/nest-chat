import { Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import * as bcrypt from "bcrypt";
import { prismaClient } from "@/providers/prisma";
import { JwtPayload } from "@/common/interfaces/jwt-payload.interface";

const saltHashRounds = 10;

@Injectable()
export class AuthService {
	public constructor(
		@Inject(JwtService) private readonly jwtService: JwtService,
	) {}

	public async register(registerDto: RegisterDto) {
		const hashedPassword = await bcrypt.hash(registerDto.password, saltHashRounds);

		const user = await prismaClient.user.create({
			data: {
				email: registerDto.email,
				password: hashedPassword,
			},
		});

		return {
			id: user.id,
			email: user.email,
		};
	}

	public async emailIsAlreadyUsed(email: string) {
		return prismaClient.user.findUnique({
			where: { email },
		});
	}

	public async login(loginDto: LoginDto) {
		const user = await prismaClient.user.findUnique({
			where: { email: loginDto.email },
		});

		if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
			return null;
		}

		const payload = {
			email: user.email,
			userId: user.id,
		};

		const accessToken = this.jwtService.sign(payload);
		return { accessToken };
	}

	public async validateUserByJwt(payload: JwtPayload) {
		return prismaClient.user.findUnique({
			where: { email: payload.email },
		});
	}

	public async getUserById(id: number) {
		return prismaClient.user.findUnique({
			where: { id },
		});
	}
}
