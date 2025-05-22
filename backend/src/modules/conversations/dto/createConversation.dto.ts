import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateConversationDto {
	@ApiProperty({
		example: "Conversation Title",
		required: true,
		type: "string",
	})
	@IsNotEmpty({ message: "Le titre de la conversation ne doit pas être vide" })
	public title!: string;

	@ApiProperty({
		example: ["johndoe@exemple", "janedoe@exemple"],
		required: true,
		type: () => [String],
	})
	@IsNotEmpty({ message: "La liste des participants ne doit pas être vide" })
	public participants!: string[];
}

export class EndPointCreateConversationDto {
	@ApiProperty({
		type: "number",
	})
	public id!: number;

	@ApiProperty({
		type: "string",
	})
	public title!: string;

	@ApiProperty({
		type: "string",
	})
	public createdAt!: Date;

	@ApiProperty({
		type: "string",
	})
	public updatedAt!: Date;

	@ApiProperty({
		type: "number",
	})
	public userId!: number;
}
