<script setup lang="ts">

</script>

<template>
	<section
		class="flex flex-col items-center justify-center h-[calc(100vh-6rem-2rem)] gap-4"
	>
		<TheImage
			src="/images/404.svg"
			alt="404"
			class="w-[286px] h-[320px]"
		/>

		<TheButton as-child>
			<RouterLink :to="homePage.createTo()">
				Retour à l'accueil
			</RouterLink>
		</TheButton>
	</section>
</template>
