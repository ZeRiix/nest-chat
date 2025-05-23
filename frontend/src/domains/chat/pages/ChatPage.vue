<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, watch } from "vue";
import { io, type Socket } from "socket.io-client";
import axios from "axios";
import {
	Send as SendIcon,
	Bot,
	Copy,
	User,
} from "lucide-vue-next";
import ConversationSidebar from "../components/ConversationSidebar.vue";

interface Conversation {
	id: number;
	title: string;
	createdAt: Date;
	updatedAt: Date;
}

interface Message {
	id: number;
	content: string;
	conversationId: number;
	senderId: number | null;
	createdAt: Date;
	updatedAt: Date;
}

const router = useRouter();

axios.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response && error.response.status === 401) {
			console.error("Session expirée ou token invalide");
			localStorage.removeItem("miniwhatapptoken");

			void router.push("/login");
		}

		return Promise.reject(error);
	},
);

const WEBSOCKET_URL = "http://localhost:1506/chat";
const API_URL = "http://localhost:1506";
const DEFAULT_PAGE = 1;

const messages = ref<Message[]>([]);
const newMessage = ref("");
const messagesContainer = ref(null);
const showSidebar = ref(true);
const isConnected = ref(false);
const connectionStatus = ref("Déconnecté");
const conversationId = ref<number | null>(null);
const currentConversation = ref<Conversation | null>(null);
const isLoadingMessages = ref(false);
const currentPage = ref(DEFAULT_PAGE);
const hasMoreMessages = ref(true);
let socket = null as unknown as Socket;

async function scrollToBottom() {
	await nextTick();
	if (messagesContainer.value) {
		// @ts-expect-error flemme
		messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
	}
}

async function fetchConversationDetails(id: number) {
	try {
		const token = localStorage.getItem("miniwhatapptoken");
		if (!token) {
			throw new Error("Token d'authentification manquant");
		}

		const response = await axios.get(`${API_URL}/conversations/${id}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		currentConversation.value = response.data;
		return response.data;
	} catch (err) {
		console.error(`Erreur lors de la récupération de la conversation ${id}:`, err);
		return null;
	}
}

async function fetchConversationMessages(id: number, page = DEFAULT_PAGE) {
	if (!id) {
		return;
	}

	isLoadingMessages.value = true;

	try {
		const token = localStorage.getItem("miniwhatapptoken");
		if (!token) {
			throw new Error("Token d'authentification manquant");
		}

		const response = await axios.get(`${API_URL}/conversations/${id}/messages`, {
			params: { page },
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		const receivedMessages = response.data;

		if (page === DEFAULT_PAGE) {
			messages.value = receivedMessages;
		} else {
			messages.value = [...receivedMessages, ...messages.value];
		}

		hasMoreMessages.value = receivedMessages.length === 10;
		currentPage.value = page;

		if (page === DEFAULT_PAGE) {
			await scrollToBottom();
		}
	} catch (err) {
		console.error(`Erreur lors de la récupération des messages pour la conversation ${id}:`, err);
	} finally {
		isLoadingMessages.value = false;
	}
}

function loadMoreMessages() {
	if (hasMoreMessages.value && !isLoadingMessages.value && conversationId.value) {
		fetchConversationMessages(conversationId.value, currentPage.value + 1);
	}
}

function handleScrollToTop() {
	if (messagesContainer.value && messagesContainer.value.scrollTop < 50 && hasMoreMessages.value && !isLoadingMessages.value) {
		loadMoreMessages();
	}
}

function connectToWebSocket() {
	// Remplacer par votre logique d'authentification pour récupérer le token
	const token = localStorage.getItem("miniwhatapptoken");

	if (!token) {
		console.error("Token d'authentification manquant");
		connectionStatus.value = "Erreur: token manquant";
		return;
	}

	connectionStatus.value = "Connexion en cours...";

	try {
		socket = io(WEBSOCKET_URL, {
			extraHeaders: {
				Authorization: `Bearer ${token}`,
			},
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			timeout: 20000,
		});

		socket.on("connect", () => {
			console.log("Connecté au serveur WebSocket");
			isConnected.value = true;
			connectionStatus.value = "Connecté";

			// Si nous avons un ID de conversation, rejoindre automatiquement
			if (conversationId.value) {
				joinConversation(conversationId.value);
			}
		});

		socket.on("connect_error", (err) => {
			console.error("Erreur de connexion WebSocket:", err.message);
			connectionStatus.value = `Erreur: ${err.message}`;
			isConnected.value = false;
		});

		socket.on("disconnect", (reason) => {
			console.log("Déconnecté du serveur WebSocket:", reason);
			connectionStatus.value = `Déconnecté: ${reason}`;
			isConnected.value = false;
		});

		socket.on("error", (err) => {
			console.error("Erreur WebSocket:", err);
		});

		// Écouter les messages entrants
		socket.on("message", (message) => {
			console.log("Message reçu:", message);

			// Ajouter le message reçu à la liste des messages
			messages.value.push(message);
			scrollToBottom();
		});
	} catch (err) {
		console.error("Exception lors de la connexion WebSocket:", err.message);
		connectionStatus.value = `Exception: ${err.message}`;
		isConnected.value = false;
	}
}

async function joinConversation(id: number) {
	if (!socket || !isConnected.value) {
		console.error("Impossible de rejoindre la conversation: non connecté");
		return;
	}

	socket.emit("joinConversation", id);
	conversationId.value = id;
	console.log(`Demande de rejoindre la conversation ${id}`);

	// Réinitialiser les données de pagination
	currentPage.value = 1;
	hasMoreMessages.value = true;
	messages.value = [];

	// Charger les messages et les détails de la conversation
	await fetchConversationMessages(id);
	await fetchConversationDetails(id);
}

function leaveConversation() {
	if (!socket || !isConnected.value || !conversationId.value) {
		return;
	}

	socket.emit("leaveConversation", conversationId.value);
	console.log(`Demande de quitter la conversation ${conversationId.value}`);
	conversationId.value = null;
	messages.value = [];
}

function getUserInfoFromToken() {
	const token = localStorage.getItem("miniwhatapptoken");
	if (!token) {
		return null;
	}
	// eslint-disable-next-line @typescript-eslint/prefer-destructuring, @typescript-eslint/no-magic-numbers
	const base64Url = token.split(".")[1];
	const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
	const jsonPayload = decodeURIComponent(
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
		atob(base64).split("").map((cur) => `%${(`00${cur.charCodeAt(0).toString(16)}`).slice(-2)}`)
			.join(""),
	);

	const payload = JSON.parse(jsonPayload);

	return payload as { userId: number };
}

async function sendMessage() {
	if (newMessage.value.trim() && isConnected.value) {
		if (!conversationId.value) {
			return;
		}

		const payload = {
			message: newMessage.value,
			conversationId: conversationId.value,
		};

		socket.emit("sendMessage", payload);

		newMessage.value = "";
		await scrollToBottom();
	}
}

async function copyMessage(content: string) {
	await navigator.clipboard.writeText(content);
}

async function setActiveConversation(id: number) {
	if (conversationId.value !== id) {
		if (conversationId.value) {
			leaveConversation();
		}
		await joinConversation(id);
	}
}

function toggleSidebar() {
	showSidebar.value = !showSidebar.value;
}

function getSenderType(message: Message) {
	const userId = getUserInfoFromToken()?.userId;
	if (userId && userId === message.senderId) {
		return "user";
	}
	return "ai";
}

async function leaveConversationHttp() {
	if (!conversationId.value) {
		return;
	}

	try {
		const token = localStorage.getItem("miniwhatapptoken");
		if (!token) {
			throw new Error("Token d'authentification manquant");
		}

		await axios.post(`${API_URL}/conversations/${conversationId.value}/leave`, {}, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		// Quitter également la conversation via WebSocket
		leaveConversation();

		// Rediriger ou faire d'autres actions après avoir quitté
		conversationId.value = null;
		currentConversation.value = null;
	} catch (err) {
		console.error("Erreur lors de la tentative de quitter la conversation:", err);
	}
}

const userCache = ref<Record<number, {
	id: number;
	email: string;
} | null>>({});

async function getUserInformationByid(userId: number) {
	if (userCache.value[userId] !== undefined) {
		return userCache.value[userId];
	}

	try {
		const token = localStorage.getItem("miniwhatapptoken");
		if (!token) {
			throw new Error("Token d'authentification manquant");
		}

		const response = await axios.get(`${API_URL}/users/${userId}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (response.status === 200) {
			// Stocker dans le cache
			userCache.value[userId] = response.data;
			return response.data as {
				id: number;
				email: string;
			};
		} else {
			console.error(`Erreur lors de la récupération de l'utilisateur ${userId}:`, response.statusText);
			userCache.value[userId] = null;
			return null;
		}
	} catch (err) {
		console.error(`Erreur lors de la récupération de l'utilisateur ${userId}:`, err);
		userCache.value[userId] = null;
		return null;
	}
}

function getUserFromCache(userId: number | null) {
	if (!userId) {
		return "Système";
	}
	return userCache.value[userId]?.email || "Utilisateur inconnu";
}

function getAvatarColorClass(senderId: number | null) {
	if (!senderId) {
		return "bg-muted";
	}

	const colorIndex = senderId % 6;

	const colors = [
		"bg-blue-500",
		"bg-green-500",
		"bg-purple-500",
		"bg-amber-500",
		"bg-rose-500",
		"bg-emerald-500",
	];

	return colors[colorIndex];
}

watch(messages, async(newMessages) => {
	for (const message of newMessages) {
		if (message.senderId && userCache.value[message.senderId] === undefined) {
			await getUserInformationByid(message.senderId);
		}
	}
}, { immediate: true });

watch(conversationId, async(newId) => {
	if (newId) {
		await fetchConversationDetails(newId);
	} else {
		currentConversation.value = null;
	}
});

onMounted(() => {
	connectToWebSocket();
});

onUnmounted(() => {
	if (socket) {
		leaveConversation();
		socket.disconnect();
	}
});

</script>

<template>
	<div class="flex h-screen bg-background">
		<!-- Sidebar -->
		<ConversationSidebar
			v-if="showSidebar"
			@select-conversation="setActiveConversation"
		/>

		<!-- Chat Area -->
		<div class="flex flex-col flex-1 h-screen overflow-hidden">
			<!-- Chat header -->
			<header class="px-4 py-3 bg-card border-b flex items-center justify-between">
				<div>
					<h1 class="text-lg font-semibold text-foreground">
						{{ currentConversation ? currentConversation.title : '' }}
					</h1>

					<div class="text-xs text-muted-foreground">
						{{ currentConversation ? connectionStatus : '' }}
					</div>
				</div>

				<div class="flex items-center gap-2">
					<!-- Bouton pour quitter la conversation -->
					<button
						v-if="conversationId"
						@click="leaveConversationHttp"
						class="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
						title="Quitter la conversation"
					>
						Quitter
					</button>

					<!-- Bouton existant pour basculer la barre latérale -->
					<button
						@click="toggleSidebar"
						class="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
					>
						<span v-if="showSidebar">◀</span>

						<span v-else>▶</span>
					</button>
				</div>
			</header>

			<!-- Chat messages -->
			<div
				class="flex-1 overflow-y-auto p-4 space-y-6"
				ref="messagesContainer"
				@scroll="handleScrollToTop"
			>
				<!-- Indicateur de chargement -->
				<div
					v-if="isLoadingMessages"
					class="flex justify-center py-2"
				>
					<div class="animate-spin h-5 w-5 border-2 border-primary rounded-full border-t-transparent" />
				</div>

				<!-- Bouton pour charger plus de messages -->
				<div
					v-if="hasMoreMessages && !isLoadingMessages && messages.length > 0"
					class="flex justify-center mb-4"
				>
					<button
						@click="loadMoreMessages"
						class="px-3 py-1 text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md"
					>
						Charger plus de messages
					</button>
				</div>

				<TransitionGroup name="fade">
					<div
						v-for="message in messages"
						:key="message.id"
						:class="[
							'flex gap-3',
							getSenderType(message) === 'user' ? 'flex-row-reverse' : 'flex-row'
						]"
					>
						<!-- Avatar -->
						<div class="flex-shrink-0">
							<div
								v-if="getSenderType(message) === 'ai'"
								:class="['w-8 h-8 rounded-lg flex items-center justify-center mt-5', getAvatarColorClass(message.senderId)]"
							>
								<Bot class="w-5 h-5 text-white" />
							</div>

							<div
								v-else
								:class="['w-8 h-8 rounded-lg flex items-center justify-center', getAvatarColorClass(message.senderId)]"
							>
								<User class="w-5 h-5 text-white" />
							</div>
						</div>

						<!-- Message content -->
						<div class="flex flex-col gap-2 max-w-[80%]">
							<label
								v-if="getSenderType(message) === 'ai'"
								class="text-xs text-gray-400"
							>
								{{ getUserFromCache(message.senderId) }}
							</label>

							<div
								:class="[
									'px-4 py-2.5 rounded-2xl',
									getSenderType(message) === 'user'
										? 'bg-primary text-primary-foreground'
										: 'bg-card text-card-foreground border'
								]"
							>
								{{ message.content }}
							</div>

							<!-- Message actions -->
							<div class="flex gap-2">
								<button
									class="p-1 text-muted-foreground hover:text-foreground transition-colors"
									@click="copyMessage(message.content)"
								>
									<Copy class="w-4 h-4" />
								</button>

								<span class="text-xs text-muted-foreground">
									{{ new Date(message.createdAt).toLocaleTimeString() }}
								</span>
							</div>
						</div>
					</div>
				</TransitionGroup>
			</div>

			<!-- Input area -->
			<div class="p-4 bg-card border-t">
				<form
					@submit.prevent="sendMessage"
					class="flex items-center gap-2"
				>
					<input
						v-model="newMessage"
						type="text"
						placeholder="Écrivez votre message ici..."
						class="flex-1 px-4 py-2 rounded-xl bg-background text-foreground border focus:outline-none focus:ring-2 focus:ring-ring placeholder-muted-foreground"
						:disabled="!isConnected || !conversationId"
					>

					<button
						type="submit"
						class="px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
						:disabled="!isConnected || !conversationId"
					>
						<SendIcon class="w-5 h-5" />
					</button>
				</form>
			</div>
		</div>
	</div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Typing animation */
.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
</style>
