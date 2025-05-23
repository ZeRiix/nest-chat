import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { MessagesService } from "@/modules/messages/messages.service";
import { AuthModule } from "@/modules/auth/auth.module";
import { JwtModule } from "@nestjs/jwt";
import { envs } from "@/envs";
import { WsAuthGuard } from "@/common/guards/wsAuth.guard";

@Module({
	imports: [
		AuthModule,
		JwtModule.register({
			secret: envs.JWT_KEY,
			signOptions: { expiresIn: envs.JWT_TIME },
		}),
	],
	providers: [ChatGateway, MessagesService, WsAuthGuard],
})
export class ChatModule {}
