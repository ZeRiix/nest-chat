<script setup lang="ts">
import { ref } from "vue";
import TheSkeleton from "./ui/skeleton/TheSkeleton.vue";

interface Props {
	alt: string;
	src: string;
}

defineProps<Props>();

const isLoading = ref(true);
</script>

<template>
	<div :class="$attrs.class">
		<TheSkeleton
			v-if="isLoading"
			class="w-full h-full"
		/>

		<img
			v-show="!isLoading"
			:src="src"
			:alt="alt"
			class="w-full h-full object-cover"
			@load="isLoading = false"
		>
	</div>
</template>
