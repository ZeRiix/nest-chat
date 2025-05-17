import { Module } from "@nestjs/common";
import { AuthModule } from "@/modules/auth/auth.module";
import { ConversationsModule } from "./modules/conversations/conversations.module";
import { MessagesModule } from "./modules/messages/messages.module";
import { ChatModule } from "./websockets/chat.module";
import { WebsocketTesterModule } from "./modules/websocketTester/websocketTester.module";

@Module({
	imports: [
		AuthModule,
		ConversationsModule,
		MessagesModule,
		ChatModule,
		WebsocketTesterModule,
	],
})
export class AppModule {}
