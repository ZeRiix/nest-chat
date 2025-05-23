<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import {
	Plus,
	MessageSquare,
	CalendarClock,
	X,
} from "lucide-vue-next";

interface Conversation {
	id: number;
	title: string;
	createdAt: Date;
	updatedAt: Date;
	active?: boolean;
}

const emit = defineEmits(["select-conversation"]);
const conversations = ref<Conversation[]>([]);
const isLoading = ref(false);
const error = ref("");
const newConversationTitle = ref("");
const newConversationParticipants = ref("");
const isSubmitting = ref(false);
const isPopoverOpen = ref(false);
const createError = ref("");

// URL de l'API
const API_URL = "http://localhost:1506";

// Fonction pour formater la date
function formatDate(dateString: string | Date): string {
	const date = new Date(dateString);
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	if (date.toDateString() === today.toDateString()) {
		return "Aujourd'hui";
	} else if (date.toDateString() === yesterday.toDateString()) {
		return "Hier";
	} else {
		return date.toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "short",
		});
	}
}

// Récupération des conversations
async function fetchConversations() {
	isLoading.value = true;
	error.value = "";

	try {
		const token = localStorage.getItem("miniwhatapptoken");
		if (!token) {
			throw new Error("Token d'authentification manquant");
		}

		const response = await axios.get(`${API_URL}/conversations`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		// Transformation des données reçues
		conversations.value = response.data.map((conv: Conversation) => ({
			...conv,
			active: false,
		}));
	} catch (err: any) {
		console.error("Erreur lors de la récupération des conversations:", err);
		error.value = err.message || "Erreur lors de la récupération des conversations";
	} finally {
		isLoading.value = false;
	}
}

function selectConversation(id: number) {
	// Définir la conversation active
	conversations.value = conversations.value.map((conv) => ({
		...conv,
		active: conv.id === id,
	}));

	// Émettre un événement pour charger la conversation sélectionnée
	emit("select-conversation", id);
}

async function createNewConversation() {
	isSubmitting.value = true;
	createError.value = "";

	try {
		const token = localStorage.getItem("miniwhatapptoken");
		if (!token) {
			throw new Error("Token d'authentification manquant");
		}

		// Convertir la chaîne de participants en tableau (séparés par des virgules)
		const participantsArray = newConversationParticipants.value
			.split(",")
			.map((email) => email.trim())
			.filter((email) => email !== "");

		const response = await axios.post(`${API_URL}/conversations`, {
			title: newConversationTitle.value,
			participants: participantsArray,
		}, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		// Ajouter la nouvelle conversation à la liste
		const newConv = response.data;
		conversations.value = [
			{
				...newConv,
				active: true,
			},
			...conversations.value.map((conv) => ({
				...conv,
				active: false,
			})),
		];

		// Émettre l'événement pour charger la nouvelle conversation
		emit("select-conversation", newConv.id);

		// Réinitialiser le formulaire et fermer le popover
		newConversationTitle.value = "";
		newConversationParticipants.value = "";
		isPopoverOpen.value = false;
	} catch (err: any) {
		console.error("Erreur lors de la création de la conversation:", err);
		createError.value = err.response?.data?.message || "Erreur lors de la création de la conversation";
	} finally {
		isSubmitting.value = false;
	}
}

onMounted(async() => {
	await fetchConversations();
});
</script>

<template>
	<aside class="w-80 border-r bg-card flex flex-col h-full">
		<!-- Header -->
		<div class="p-4 border-b flex items-center justify-between">
			<h2 class="font-semibold text-lg">
				Conversations
			</h2>

			<!-- Remplacer le bouton par un Popover -->
			<div class="relative">
				<!-- Bouton d'ouverture du Popover -->
				<button
					@click="isPopoverOpen = !isPopoverOpen"
					class="p-2 hover:bg-accent rounded-full transition-colors"
					title="Nouvelle conversation"
				>
					<Plus class="w-5 h-5" />
				</button>

				<!-- Popover pour créer une conversation -->
				<div
					v-if="isPopoverOpen"
					class="absolute right-0 mt-2 w-72 bg-popover rounded-md shadow-lg z-10 border p-4"
				>
					<div class="flex justify-between items-center mb-4">
						<h3 class="text-sm font-medium">
							Nouvelle conversation
						</h3>

						<button
							@click="isPopoverOpen = false"
							class="text-muted-foreground hover:text-foreground"
						>
							<X class="w-4 h-4" />
						</button>
					</div>

					<form @submit.prevent="createNewConversation">
						<!-- Champ pour le titre -->
						<div class="mb-3">
							<label class="block text-xs font-medium mb-1">
								Titre de la conversation
							</label>

							<input
								v-model="newConversationTitle"
								type="text"
								required
								placeholder="ex: Projet Web"
								class="w-full p-2 bg-background border rounded-md text-sm"
							>
						</div>

						<!-- Champ pour les participants -->
						<div class="mb-4">
							<label class="block text-xs font-medium mb-1">
								Participants (emails séparés par virgule)
							</label>

							<textarea
								v-model="newConversationParticipants"
								required
								placeholder="ex: user1@example.com, user2@example.com"
								class="w-full p-2 bg-background border rounded-md text-sm"
								rows="3"
							/>
						</div>

						<!-- Message d'erreur -->
						<div
							v-if="createError"
							class="mb-3 text-xs text-destructive"
						>
							{{ createError }}
						</div>

						<!-- Bouton de soumission -->
						<button
							type="submit"
							class="w-full py-2 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md text-sm font-medium"
							:disabled="isSubmitting"
						>
							<span v-if="isSubmitting">Création en cours...</span>

							<span v-else>Créer la conversation</span>
						</button>
					</form>
				</div>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto">
			<!-- État de chargement -->
			<div
				v-if="isLoading"
				class="p-4 text-center text-muted-foreground"
			>
				Chargement des conversations...
			</div>

			<!-- Message d'erreur -->
			<div
				v-else-if="error"
				class="p-4 text-center text-destructive"
			>
				{{ error }}
			</div>

			<!-- Aucune conversation -->
			<div
				v-else-if="conversations.length === 0"
				class="p-4 text-center text-muted-foreground"
			>
				Aucune conversation. Créez-en une nouvelle !
			</div>

			<!-- Liste des conversations -->
			<div v-else>
				<button
					v-for="conversation in conversations"
					:key="conversation.id"
					@click="selectConversation(conversation.id)"
					class="w-full p-3 flex items-start gap-3 hover:bg-accent/50 transition-colors text-left"
					:class="{ 'bg-accent': conversation.active }"
				>
					<div class="bg-primary/10 rounded-full p-2 mt-1">
						<MessageSquare class="w-4 h-4 text-primary" />
					</div>

					<div class="flex-1 min-w-0">
						<div class="flex justify-between items-start">
							<h3 class="font-medium truncate">
								{{ conversation.title }}
							</h3>

							<span class="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
								<CalendarClock class="w-3 h-3" />
								{{ formatDate(conversation.updatedAt) }}
							</span>
						</div>
					</div>
				</button>
			</div>
		</div>
	</aside>
</template>
