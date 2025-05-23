import { Module } from "@nestjs/common";
import { ConversationsController } from "./conversations.controller";
import { ConversationsService } from "./conversations.service";
import { UserIsParticipantOfConversationGuard } from "./guards/userIsParticipantOfConversation.guard";

@Module({
	controllers: [ConversationsController],
	providers: [
		ConversationsService,
		UserIsParticipantOfConversationGuard,
	],
	exports: [
		ConversationsService,
		UserIsParticipantOfConversationGuard,
	],
})
export class ConversationsModule {}
