import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateMessageDto {
	@ApiProperty({
		example: "Hello, how are you?",
		required: true,
		type: "string",
	})
	@IsNotEmpty()
	public content!: string;

	@ApiProperty({
		required: true,
		type: "number",
	})
	@IsNotEmpty()
	public conversationId!: number;
}

export class EndPointCreateMessageDto {
	@ApiProperty({
		type: "number",
	})
	public id!: number;

	@ApiProperty({
		type: "string",
	})
	public content!: string;

	@ApiProperty({
		type: "number",
	})
	public conversationId!: number;

	@ApiProperty({
		type: "number",
	})
	public senderId!: number;

	@ApiProperty({
		type: "string",
	})
	public createdAt!: Date;

	@ApiProperty({
		type: "string",
	})
	public updatedAt!: Date;
}
