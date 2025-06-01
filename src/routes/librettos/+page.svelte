<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { base } from '$app/paths';

	const { data } = $props();

	async function deleteLibretto(id: string) {
		if (confirm('Are you sure you want to delete this libretto?')) {
			try {
				const response = await fetch(`${base}/api/librettos/${id}/mutate`, {
					method: 'DELETE'
				});

				if (!response.ok) {
					throw new Error('Failed to delete libretto');
				}

				// Refresh the page data
				invalidateAll();
			} catch (error) {
				console.error('Error deleting libretto:', error);
				alert('Failed to delete libretto');
			}
		}
	}
</script>

<svelte:head>
	<title>Librettos - Think System Memorizer</title>
</svelte:head>

<div class="mx-auto max-w-6xl p-8">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold text-gray-800 dark:text-gray-200">Libretto Collection</h1>
		<a
			href="{base}/librettos/new"
			class="rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
		>
			New Libretto
		</a>
	</div>

	{#if data.librettos.length === 0}
		<div class="py-12 text-center">
			<p class="mb-4 text-lg text-gray-500">No librettos yet</p>
			<a
				href="{base}/librettos/new"
				class="rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
			>
				Submit Your First Libretto
			</a>
		</div>
	{:else}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each data.librettos as libretto (libretto.title)}
				<div
					class="relative isolate rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-600 dark:bg-gray-800"
				>
					<h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200">
						<a href="{base}/librettos/{libretto.id}">
							{libretto.title}
							<span class="absolute inset-0"></span>
						</a>
					</h3>
					<div class="flex gap-2">
						<button
							onclick={(e) => {
								e.preventDefault();
								deleteLibretto(libretto.id);
							}}
							class="z-10 rounded bg-red-600 px-3 py-2 text-sm text-white transition-colors hover:bg-red-700"
						>
							Delete
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
