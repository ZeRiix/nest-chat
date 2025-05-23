import { Injectable } from "@nestjs/common";
import { prismaClient } from "@/providers/prisma";

interface CreateInput {
	content: string;
	senderId: number;
	conversationId: number;
}

const messagePerPage = 10;
const messagePage = 1;

@Injectable()
export class MessagesService {
	public async create(input: CreateInput) {
		return prismaClient.message.create({
			data: input,
		});
	}

	public async findPerPage(conversationId: number, page: number) {
		return prismaClient.message.findMany({
			where: { conversationId },
			take: messagePerPage,
			skip: (page - messagePage) * messagePerPage,
			orderBy: {
				createdAt: "asc",
			},
		});
	}

	public async findOne(id: number) {
		return prismaClient.message.findUnique({
			where: { id },
		});
	}

	public async remove(id: number) {
		return prismaClient.message.delete({
			where: { id },
		});
	}

	public async isUserIsAuthorOfMessage(userId: number, messageId: number) {
		const message = await this.findOne(messageId);

		if (!message) {
			return false;
		}

		return message.senderId === userId;
	}
}
