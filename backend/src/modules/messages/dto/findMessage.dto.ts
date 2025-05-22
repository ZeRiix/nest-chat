import { ApiProperty } from "@nestjs/swagger";

export class EndPointFindMessageDto {
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
