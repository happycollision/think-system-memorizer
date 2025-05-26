<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="p-4">
	<svelte:boundary>{@render children()}</svelte:boundary>
</div>
