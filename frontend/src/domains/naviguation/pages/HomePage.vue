<script setup lang="ts">

const router = useRouter();

onMounted(async() => {
	await router.push({
		name: "loginOrRegister",
	});
});

</script>

<template>
	<h1>hey</h1>
</template>
