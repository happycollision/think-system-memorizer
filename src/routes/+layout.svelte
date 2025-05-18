<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="p-4">
	<svelte:boundary>
		{#snippet pending()}
			loading...
		{/snippet}
		{@render children()}
	</svelte:boundary>
</div>
