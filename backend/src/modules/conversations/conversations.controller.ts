import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Inject, Res, HttpStatus } from "@nestjs/common";
import { ConversationsService } from "./conversations.service";
import { CreateConversationDto, EndPointCreateConversationDto } from "./dto/createConversation.dto";
import { UpdateConversationDto } from "./dto/updateConversation.dto";
import { JwtAuthGuard } from "@/modules/auth/guards/jwtAuth.guard";
import { GetUser, User } from "@/common/decorators/http/getUser.decorator";
import { Response } from "express";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { EndPointFindConversationDto } from "./dto/findConversationDto";

@Controller("conversations")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ConversationsController {
	public constructor(@Inject(ConversationsService) private readonly conversationsService: ConversationsService) {}

	@ApiOperation({ summary: "Créer une conversation" })
	@ApiResponse({
		status: 201,
		description: "Conversation créée avec succès",
		type: () => EndPointCreateConversationDto,
	})
	@ApiBody({ type: () => CreateConversationDto })
	@Post()
	public async create(
		@GetUser() user: User,
		@Body() createConversationDto: CreateConversationDto,
		@Res() res: Response,
	) {
		const conversation = await this.conversationsService.create({
			userId: user.id,
			title: createConversationDto.title,
			participants: createConversationDto.participants,
		});

		return res.status(HttpStatus.CREATED).json(conversation);
	}

	@ApiOperation({ summary: "Récupérer toutes les conversations" })
	@ApiResponse({
		status: 200,
		description: "Conversations récupérées avec succès",
		type: () => EndPointFindConversationDto,
		isArray: true,
	})
	@Get()
	public async findAll(
		@GetUser() user: User,
		@Res() res: Response,
	) {
		const conversations = await this.conversationsService.findAll(user.id);

		return res
			.status(HttpStatus.OK)
			.json(conversations);
	}

	@ApiOperation({ summary: "Récupérer une conversation" })
	@ApiResponse({
		status: 200,
		description: "Conversation récupérée avec succès",
		type: () => EndPointFindConversationDto,
	})
	@ApiResponse({
		status: 401,
		description: "Utilisateur non autorisé",
	})
	@ApiResponse({
		status: 404,
		description: "Conversation non trouvée",
	})
	@ApiParam({
		type: "string",
		name: "id",
	})
	@Get(":id")
	public async findOne(
		@GetUser() user: User,
		@Param("id") id: string,
		@Res() res: Response,
	) {
		const userIsInConversation = await this.conversationsService.isUserInConversation(
			user.id,
			Number(id),
		);

		if (!userIsInConversation) {
			return res
				.status(HttpStatus.UNAUTHORIZED)
				.send();
		}

		const conversation = await this.conversationsService.findOne(
			Number(id),
		);

		if (!conversation) {
			return res
				.status(HttpStatus.NOT_FOUND)
				.send();
		}

		return res
			.status(HttpStatus.OK)
			.json(conversation);
	}

	@ApiOperation({ summary: "Mettre à jour une conversation" })
	@ApiResponse({
		status: 200,
		description: "Mise à jour réussie",
		type: () => EndPointFindConversationDto,
	})
	@ApiResponse({
		status: 401,
		description: "Utilisateur non autorisé",
	})
	@ApiParam({
		type: "string",
		name: "id",
	})
	@ApiBody({ type: () => UpdateConversationDto })
	@Patch(":id")
	public async update(
		@GetUser() user: User,
		@Param("id") id: string,
		@Body() updateConversationDto: UpdateConversationDto,
		@Res() res: Response,
	) {
		const userIsCreator = await this.conversationsService.isUserCreator(
			user.id,
			Number(id),
		);

		if (!userIsCreator) {
			return res
				.status(HttpStatus.UNAUTHORIZED)
				.send();
		}

		const conversation = await this.conversationsService.update({
			id: Number(id),
			title: updateConversationDto.title,
			participants: updateConversationDto.participants,
		});

		return res
			.status(HttpStatus.OK)
			.json(conversation);
	}

	@ApiOperation({ summary: "Supprimer une conversation" })
	@ApiResponse({
		status: 200,
		description: "Conversation supprimée avec succès",
	})
	@ApiResponse({
		status: 401,
		description: "Utilisateur non autorisé",
	})
	@ApiParam({
		type: "string",
		name: "id",
	})
	@Delete(":id")
	public async remove(
		@GetUser() user: User,
		@Param("id") id: string,
		@Res() res: Response,
	) {
		const userIsCreator = this.conversationsService.isUserCreator(
			user.id,
			Number(id),
		);

		if (!userIsCreator) {
			return res
				.status(HttpStatus.UNAUTHORIZED)
				.send();
		}

		await this.conversationsService.remove(Number(id));

		return res
			.status(HttpStatus.OK)
			.send();
	}

	@ApiOperation({ summary: "Quitter une conversation" })
	@ApiResponse({
		status: 200,
		description: "Utilisateur quitté la conversation avec succès",
	})
	@ApiResponse({
		status: 404,
		description: "Conversation non trouvée",
	})
	@ApiParam({
		type: "string",
		name: "id",
	})
	@Post(":id/leave")
	public async leaveConversation(
		@GetUser() user: User,
		@Param("id") id: string,
		@Res() res: Response,
	) {
		const userIsParticipant = await this.conversationsService.isUserParticipant(
			user.id,
			Number(id),
		);

		if (!userIsParticipant) {
			return res
				.status(HttpStatus.NOT_FOUND)
				.send();
		}

		await this.conversationsService.leaveConversation(
			user.id,
			Number(id),
		);
		return res
			.status(HttpStatus.OK)
			.send();
	}

	@ApiOperation({ summary: "Récupere la liste des participants" })
	@ApiResponse({
		status: 200,
		description: "Liste des participants",
	})
	@ApiResponse({
		status: 404,
		description: "Conversation non trouvée",
	})
	@ApiParam({
		type: "string",
		name: "id",
	})
	@Get("/:id/participants")
	public async getParticipants(
		@Param("id") id: string,
		@Res() res: Response,
	) {
		const conversation = await this.conversationsService.findOne(
			Number(id),
		);
		if (!conversation) {
			return res
				.status(HttpStatus.NOT_FOUND)
				.send();
		}

		const participants = await this.conversationsService.getParticipants(
			Number(id),
		);

		return res
			.status(HttpStatus.OK)
			.json(participants);
	}
}
