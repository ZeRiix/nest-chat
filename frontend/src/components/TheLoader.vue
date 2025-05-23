<script setup lang="ts">
const { loaderIsEnabled } = useLoader();
</script>

<template>
	<div
		v-if="loaderIsEnabled"
		class="fixed z-50 inset-0 flex flex-col items-center justify-center bg-white opacity-75"
	>
		<TheLogo />

		<p class="mt-4 text-carbon">
			Loading
		</p>
	</div>
</template>
