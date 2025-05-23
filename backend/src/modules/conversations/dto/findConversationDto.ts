import { ApiProperty } from "@nestjs/swagger";

export class EndPointFindConversationDto {
	@ApiProperty({
		example: 1,
		type: "number",
	})
	public id!: number;

	@ApiProperty({
		example: "Conversation Title",
		type: "string",
	})
	public title!: string;

	@ApiProperty({
		example: "Conversation Description",
		type: "string",
	})
	public createdAt!: Date;

	@ApiProperty({
		example: "Conversation Description",
		type: "string",
	})
	public updatedAt!: Date;
}
