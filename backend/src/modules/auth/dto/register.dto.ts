import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MinLength, MaxLength } from "class-validator";

const passwordMinLength = 8;
const passwordMaxLength = 20;

export class RegisterDto {
	@ApiProperty({
		example: "johndoe@example.com",
		required: true,
		type: "string",
	})
	@IsEmail({}, { message: "L'adresse email n'est pas valide" })
	@IsNotEmpty({ message: "L'email est requis" })
	public email!: string;

	@ApiProperty({
		example: "MotDePasse123!",
		required: true,
		type: "string",
	})
	@IsNotEmpty({ message: "Le mot de passe est requis" })
	@MinLength(passwordMinLength, { message: "Le mot de passe doit contenir au moins 8 caractères" })
	@MaxLength(passwordMaxLength, { message: "Le mot de passe ne peut pas dépasser 50 caractères" })
	public password!: string;
}

export class EndPointRegisterDto {
	@ApiProperty({
		example: 1,
		type: "number",
	})
	public id!: string;

	@ApiProperty({
		example: "johndoe@example.com",
		type: "string",
	})
	public email!: string;
}
