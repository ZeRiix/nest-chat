import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject, SetMetadata } from "@nestjs/common";
import { ConversationsService } from "../conversations.service";
import { Request } from "express";
import { Reflector } from "@nestjs/core";
import { z as zod } from "zod";
import { match } from "ts-pattern";

const _conversationIdSourceSchema = zod.enum([
	"params.conversationId",
	"params.id",
	"query.conversationId",
	"body.conversationId",
]);

export type ConversationIdSource = zod.infer<typeof _conversationIdSourceSchema>;

export function SetConversationIdSource(source: ConversationIdSource) {
	return SetMetadata("conversationIdSource", source);
}

@Injectable()
export class UserIsParticipantOfConversationGuard implements CanActivate {
	public constructor(
		@Inject(ConversationsService) private readonly conversationsService: ConversationsService,
		@Inject(Reflector) private reflector: Reflector,
	) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const user = request.user as { id: number };

		const idSource = this.reflector.get<ConversationIdSource>("conversationIdSource", context.getHandler()) || "params.id";

		const conversationId = match({ idSource })
			.with(
				{ idSource: "params.id" },
				() => zod.object({
					params: zod.object({
						id: zod.string().transform((val) => Number(val)),
					}),
				}).parse(request).params.id,
			)
			.with(
				{ idSource: "params.conversationId" },
				() => zod.object({
					params: zod.object({
						conversationId: zod.string().transform((val) => Number(val)),
					}),
				}).parse(request).params.conversationId,
			)
			.with(
				{ idSource: "query.conversationId" },
				() => zod.object({
					query: zod.object({
						conversationId: zod.string().transform((val) => Number(val)),
					}),
				}).parse(request).query.conversationId,
			)
			.with(
				{ idSource: "body.conversationId" },
				() => zod.object({
					body: zod.object({
						conversationId: zod.coerce.number(),
					}),
				}).parse(request).body.conversationId,
			)
			.exhaustive();

		if (!user || isNaN(conversationId)) {
			throw new UnauthorizedException("Utilisateur ou conversation invalide");
		}

		const isParticipant = await this.conversationsService.isUserInConversation(
			user.id,
			conversationId,
		);

		if (!isParticipant) {
			throw new UnauthorizedException("Vous n'êtes pas participant de cette conversation");
		}

		return true;
	}
}
