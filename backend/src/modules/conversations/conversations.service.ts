import { Injectable } from "@nestjs/common";
import { prismaClient } from "@/providers/prisma";

interface CreateInput {
	userId: number;
	title: string;
	participants: string[];
}

interface UpdateInput {
	id: number;
	title: string;
	participants: string[];
}

@Injectable()
export class ConversationsService {
	public async create(input: CreateInput) {
		const participantsWithIds = await Promise.all(
			input.participants.map(async(email) => {
				const user = await prismaClient.user.findUnique({
					where: {
						email: email,
					},
					select: {
						id: true,
					},
				});

				return user ? user.id : null;
			}),
		);

		const validParticipantIds = participantsWithIds.filter((id) => id !== null) as number[];

		return prismaClient.conversation.create({
			data: {
				title: input.title,
				creatorId: input.userId,
				members: {
					create: validParticipantIds.map((userId) => ({
						userId: userId,
					})),
				},
			},
			include: {
				members: true,
			},
		});
	}

	public async findAll(userId: number) {
		return prismaClient.conversation.findMany({
			where: {
				OR: [
					{
						members: {
							some: {
								userId: userId,
							},
						},
					},
					{
						creatorId: userId,
					},
				],
			},
		});
	}

	public async isUserInConversation(userId: number, conversationId: number) {
		const conversation = await prismaClient.conversation.findFirst({
			where: {
				id: conversationId,
				OR: [
					{
						members: {
							some: {
								userId: userId,
							},
						},
					},
					{
						creatorId: userId,
					},
				],
			},
		});

		return !!conversation;
	}

	public async findOne(id: number) {
		return prismaClient.conversation.findUnique({
			where: {
				id,
			},
		});
	}

	public async update(input: UpdateInput) {
		const participantsWithIds = await Promise.all(
			input.participants.map(async(email) => {
				const user = await prismaClient.user.findUnique({
					where: {
						email: email,
					},
					select: {
						id: true,
					},
				});

				return user ? user.id : null;
			}),
		);

		const validParticipantIds = participantsWithIds.filter((id) => id !== null) as number[];

		return prismaClient.conversation.update({
			where: { id: input.id },
			data: {
				title: input.title,
				members: {
					connect: validParticipantIds.map(
						(id) => ({
							// eslint-disable-next-line camelcase
							userId_conversationId: {
								userId: id,
								conversationId: input.id,
							},
						}),
					),
				},
			},
		});
	}

	public async remove(id: number) {
		return prismaClient.conversation.delete({
			where: { id },
		});
	}

	public async leaveConversation(userId: number, conversationId: number) {
		return prismaClient.conversation.update({
			where: { id: conversationId },
			data: {
				members: {
					disconnect: {
						// eslint-disable-next-line camelcase
						userId_conversationId: {
							userId,
							conversationId,
						},
					},
				},
			},
		});
	}

	public async isUserCreator(userId: number, conversationId: number) {
		const converation = await prismaClient.conversation.findFirst({
			where: {
				id: conversationId,
				creatorId: userId,
			},
		});

		return !!converation;
	}

	public async isUserParticipant(
		userId: number,
		conversationId: number,
	) {
		const conversation = await prismaClient.conversation.findFirst({
			where: {
				id: conversationId,
				members: {
					some: {
						userId: userId,
					},
				},
			},
		});
		return !!conversation;
	}

	public async getParticipants(conversationId: number) {
		const members = await prismaClient.conversationMember.findMany({
			where: {
				conversationId,
			},
			select: {
				user: {
					select: {
						id: true,
						email: true,
					},
				},
			},
		});

		return members.map((member) => member.user);
	}
}
