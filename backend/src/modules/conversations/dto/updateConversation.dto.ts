import { ApiProperty } from "@nestjs/swagger";

export class UpdateConversationDto {
	@ApiProperty({
		example: "Conversation Title",
		required: false,
		type: "string",
	})
	public title!: string;

	@ApiProperty({
		example: ["johndoe@exemple", "janedoe@exemple"],
		required: false,
		type: () => [String],
	})
	public participants!: string[];
}

export class EndPointUpdateConversationDto {}
