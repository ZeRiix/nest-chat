import { z as zod } from "zod";
import { Controller, Get, Post, Body, Param, Delete, UseGuards, Inject, Res, HttpStatus, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { EndPointFindMessageDto } from "./dto/findMessage.dto";
import { CreateMessageDto, EndPointCreateMessageDto } from "./dto/createMessage.dto";
import { GetUser, User } from "@/common/decorators/http/getUser.decorator";
import { MessagesService } from "./messages.service";
import { JwtAuthGuard } from "../auth/guards/jwtAuth.guard";
import { SetConversationIdSource, UserIsParticipantOfConversationGuard } from "../conversations/guards/userIsParticipantOfConversation.guard";

@ApiTags("Messages")
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class MessagesController {
	public constructor(@Inject(MessagesService) private readonly messagesService: MessagesService) {}

	@ApiOperation({ summary: "Envoyer un message" })
	@ApiResponse({
		status: 201,
		description: "Message envoyé avec succès",
		type: () => EndPointCreateMessageDto,
	})
	@ApiBody({ type: () => CreateMessageDto })
	@SetConversationIdSource("body.conversationId")
	@UseGuards(UserIsParticipantOfConversationGuard)
	@Post("messages")
	public async create(
		@GetUser() user: User,
		@Body() createMessageDto: CreateMessageDto,
		@Res() res: Response,
	) {
		const message = await this.messagesService.create({
			senderId: user.id,
			conversationId: createMessageDto.conversationId,
			content: createMessageDto.content,
		});

		return res
			.status(HttpStatus.CREATED)
			.json(message);
	}

	@ApiOperation({ summary: "Récupérer tous les messages d'une conversation par page" })
	@ApiResponse({
		status: 200,
		description: "Messages récupérés avec succès",
		type: () => EndPointFindMessageDto,
		isArray: true,
	})
	@ApiResponse({
		status: 404,
		description: "Conversation non trouvée",
	})
	@ApiParam({
		type: "string",
		name: "conversationId",
		required: true,
	})
	@ApiQuery({
		default: "1",
		type: "string",
		name: "page",
	})
	@SetConversationIdSource("params.conversationId")
	@UseGuards(UserIsParticipantOfConversationGuard)
	@Get("conversations/:conversationId/messages")
	public async findPerPage(
		@Param("conversationId") conversationId: string,
		@Query("page") page: string,
		@Res() res: Response,
	) {
		const parsedPage = zod.coerce.number().positive().safeParse(page);

		if (!parsedPage.success) {
			return res
				.status(HttpStatus.BAD_REQUEST)
				.json({ message: "Le paramètre de page doit être un nombre positif" });
		}

		const messages = await this.messagesService.findPerPage(
			Number(conversationId),
			parsedPage.data,
		);

		return res
			.status(HttpStatus.OK)
			.json(messages);
	}

	@ApiOperation({ summary: "Supprimer un message" })
	@ApiResponse({
		status: 200,
		description: "Message supprimé avec succès",
	})
	@ApiResponse({
		status: 404,
		description: "Message non trouvé",
	})
	@ApiParam({
		type: "string",
		name: "id",
		required: true,
	})
	@Delete("messages/:id")
	public async remove(
		@GetUser() user: User,
		@Param("id") id: string,
		@Res() res: Response,
	) {
		const userIsAuthor = await this.messagesService.isUserIsAuthorOfMessage(user.id, Number(id));

		if (!userIsAuthor) {
			return res
				.status(HttpStatus.FORBIDDEN)
				.send();
		}

		await this.messagesService.remove(Number(id));

		return res
			.status(HttpStatus.OK)
			.send();
	}
}
