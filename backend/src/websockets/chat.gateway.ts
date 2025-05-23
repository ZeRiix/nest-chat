/* eslint-disable no-console */
import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from "@nestjs/websockets";
import { Inject, UseGuards } from "@nestjs/common";
import { Server } from "socket.io";
import { MessagesService } from "../modules/messages/messages.service";
import { GetUser, User } from "../common/decorators/websocket/getUser.decorator";
import { WsAuthGuard } from "../common/guards/wsAuth.guard";
import { Socket, SocketIO } from "@/common/decorators/websocket/socket.decorator";
import { MessagePayload } from "@/common/decorators/websocket/payloadMessage.decorator";

@WebSocketGateway({
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
		credentials: true,
	},
	namespace: "/chat",
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
	@WebSocketServer() public server!: Server;

	public afterInit(server: Server) {
		console.log("Chat WebSocket Gateway initialisé");

		server.on("error", (err) => {
			console.error("Erreur Socket.IO:", err);
		});

		server.on("connect_error", (err) => {
			console.error("Erreur de connexion Socket.IO:", err);
		});
	}

	public constructor(@Inject(MessagesService) private readonly messageService: MessagesService) {}

	public handleConnection(client: SocketIO) {
		console.log(`Client connected: ${client.id}`);
	}

	public handleDisconnect(client: SocketIO) {
		console.log(`Client disconnected: ${client.id}`);
	}

	@UseGuards(WsAuthGuard)
	@SubscribeMessage("sendMessage")
	public async handleMessage(
		@GetUser() user: User,
		@Socket() client: SocketIO,
		@MessagePayload() payload: {
			message: string;
			conversationId: number;
		},
	) {
		const message = await this.messageService.create({
			content: payload.message,
			conversationId: payload.conversationId,
			senderId: user.id,
		});
		this.server.to(payload.conversationId.toString()).emit("message", {
			...message,
			senderEmail: user.email,
		});
	}

	//@UseGuards(WsAuthGuard)
	@SubscribeMessage("joinConversation")
	public async handleJoinConversation(client: SocketIO, conversationId: number) {
		await client.join(conversationId.toString());
		console.log(`Client ${client.id} joined conversation ${conversationId}`);
	}

	@SubscribeMessage("leaveConversation")
	public async handleLeaveConversation(client: SocketIO, conversationId: number) {
		await client.leave(conversationId.toString());
		console.log(`Client ${client.id} left conversation ${conversationId}`);
	}
}
