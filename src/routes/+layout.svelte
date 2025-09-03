<script lang="ts">
	import { checkForNewerAppVersionEffect } from '$lib/version';
	import '../app.css';

	let { children } = $props();

	$effect(checkForNewerAppVersionEffect);
</script>

<svelte:boundary>{@render children()}</svelte:boundary>
