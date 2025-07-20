<script lang="ts">
	import { base } from '$app/paths';
	import type { Snippet } from 'svelte';

	type Props = {
		title: Snippet;
		location?: Snippet;
		children?: Snippet;
	};

	const { title, location, children }: Props = $props();
</script>

<div class="flex justify-between gap-2 p-2">
	<a class="btn" href="{base}/librettos/">
		<span>Back <span class="sr-only sm:not-sr-only">to libretto list</span></span>
	</a>
	<header class="flex flex-wrap items-center justify-center gap-x-4">
		<h1 class="text-xl">
			{@render title()}
		</h1>
		{@render location?.()}
	</header>
	{@render children?.()}
</div>
