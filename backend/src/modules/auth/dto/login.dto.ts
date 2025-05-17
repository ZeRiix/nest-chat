import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MinLength, MaxLength } from "class-validator";

const minLength = 8;
const maxLength = 20;

export class LoginDto {
	@ApiProperty({
		example: "johndoe@example.com",
		required: true,
		type: "string",
	})
	@IsEmail({}, { message: "L'adresse email doit être valide" })
	@IsNotEmpty({ message: "L'adresse email ne doit pas être vide" })
	public email!: string;

	@ApiProperty({
		example: "MotDePasse123!",
		required: true,
		format: "password",
		type: "string",
	})
	@MinLength(minLength, { message: "Le mot de passe doit contenir au moins 8 caractères" })
	@MaxLength(maxLength, { message: "Le mot de passe ne doit pas dépasser 20 caractères" })
	@IsNotEmpty({ message: "Le mot de passe ne doit pas être vide" })
	public password!: string;
}

export class EndPointLoginDto {
	@ApiProperty({
		example: "oioizurere",
		type: "string",
	})
	public accessToken!: string;
}
