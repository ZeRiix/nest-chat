<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const router = useRouter();
const activeTab = ref("login");
const API_URL = "http://localhost:1506/";

const loginForm = reactive({
	email: "",
	password: "",
	error: "",
	isLoading: false,
});

const registerForm = reactive({
	email: "",
	password: "",
	error: "",
	success: "",
	isLoading: false,
});

async function handleLogin() {
	loginForm.error = "";

	if (!loginForm.email || !loginForm.password) {
		loginForm.error = "Veuillez remplir tous les champs";
		return;
	}

	try {
		loginForm.isLoading = true;

		const response = await fetch(`${API_URL}login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: loginForm.email,
				password: loginForm.password,
			}),
		});

		if (!response.ok) {
			throw new Error("Identifiants incorrects");
		}

		const data = await response.json();

		localStorage.setItem("miniwhatapptoken", data.accessToken);

		await router.push("/chat");
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		loginForm.error = error.message || "Erreur de connexion";
	} finally {
		loginForm.isLoading = false;
	}
}

async function handleRegister() {
	registerForm.error = "";
	registerForm.success = "";

	if (!registerForm.email || !registerForm.password) {
		registerForm.error = "Veuillez remplir tous les champs";
		return;
	}

	try {
		registerForm.isLoading = true;

		const response = await fetch(`${API_URL}register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: registerForm.email,
				password: registerForm.password,
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Erreur lors de l'inscription");
		}

		registerForm.success = "Inscription réussie ! Vous pouvez maintenant vous connecter.";

		registerForm.email = "";
		registerForm.password = "";

		setTimeout(() => {
			activeTab.value = "login";
		// eslint-disable-next-line @typescript-eslint/no-magic-numbers
		}, 2000);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		registerForm.error = error.message || "Erreur lors de l'inscription";
	} finally {
		registerForm.isLoading = false;
	}
}

// Fonction pour changer d'onglet manuellement
function switchTab(tab: string) {
	activeTab.value = tab;
}
</script>

<template>
	<div class="flex justify-center items-center min-h-screen">
		<Card class="w-[400px] max-w-[90%]">
			<CardHeader>
				<CardTitle class="text-center text-primary">
					Mini WhatsApp
				</CardTitle>

				<CardDescription class="text-center">
					Connectez-vous ou inscrivez-vous pour commencer à discuter
				</CardDescription>
			</CardHeader>

			<CardContent>
				<!-- Solution alternative avec des onglets personnalisés -->
				<div class="w-full">
					<div class="grid w-full grid-cols-2 border-b mb-4">
						<button
							class="py-2 text-center"
							:class="activeTab === 'login' ? 'border-b-2 border-primary font-semibold' : ''"
							@click="switchTab('login')"
						>
							Connexion
						</button>

						<button
							class="py-2 text-center"
							:class="activeTab === 'register' ? 'border-b-2 border-primary font-semibold' : ''"
							@click="switchTab('register')"
						>
							Inscription
						</button>
					</div>

					<!-- Formulaire de connexion -->
					<div
						v-if="activeTab === 'login'"
						class="space-y-4"
					>
						<div class="space-y-2">
							<Label for="login-email">Email</Label>

							<Input
								id="login-email"
								v-model="loginForm.email"
								type="email"
								placeholder="Entrez votre email"
								required
							/>
						</div>

						<div class="space-y-2">
							<Label for="login-password">Mot de passe</Label>

							<Input
								id="login-password"
								v-model="loginForm.password"
								type="password"
								placeholder="Entrez votre mot de passe"
								required
							/>
						</div>

						<Button
							type="button"
							class="w-full"
							:disabled="loginForm.isLoading"
							@click="handleLogin"
						>
							{{ loginForm.isLoading ? 'Connexion en cours...' : 'Se connecter' }}
						</Button>

						<Alert
							variant="destructive"
							v-if="loginForm.error"
							class="mt-4"
						>
							<AlertDescription>{{ loginForm.error }}</AlertDescription>
						</Alert>
					</div>

					<!-- Formulaire d'inscription -->
					<div
						v-if="activeTab === 'register'"
						class="space-y-4"
					>
						<div class="space-y-2">
							<Label for="register-email">Email</Label>

							<Input
								id="register-email"
								v-model="registerForm.email"
								type="email"
								placeholder="Entrez votre email"
								required
							/>
						</div>

						<div class="space-y-2">
							<Label for="register-password">Mot de passe</Label>

							<Input
								id="register-password"
								v-model="registerForm.password"
								type="password"
								placeholder="Choisissez un mot de passe"
								required
							/>
						</div>

						<Button
							type="button"
							class="w-full"
							:disabled="registerForm.isLoading"
							@click="handleRegister"
						>
							{{ registerForm.isLoading ? 'Inscription en cours...' : 'S\'inscrire' }}
						</Button>

						<Alert
							variant="destructive"
							v-if="registerForm.error"
							class="mt-4"
						>
							<AlertDescription>{{ registerForm.error }}</AlertDescription>
						</Alert>

						<Alert
							v-if="registerForm.success"
							class="mt-4 bg-green-50 border-green-200 text-green-800"
						>
							<AlertDescription>{{ registerForm.success }}</AlertDescription>
						</Alert>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>
</template>
