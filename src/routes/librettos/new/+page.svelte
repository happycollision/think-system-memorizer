<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import type { FormEventHandler } from 'svelte/elements';

	type Libretto = { title: string; content: string };

	const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();
		if (!e.target) return;

		const { title, content } = Object.fromEntries(
			new FormData(e.currentTarget).entries()
		) as Libretto;

		if (!title || !content) {
			alert('Title and content are required');
			return;
		}

		try {
			const response = await fetch(`${base}/api/librettos/mutate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ title, content })
			});

			if (!response.ok) {
				const error = await response.json();
				alert(error.error || 'Failed to submit libretto');
				return;
			}

			console.log('Libretto submitted:', { title, content });
			goto(`${base}/librettos`);
		} catch (error) {
			console.error('Error submitting libretto:', error);
			alert('Failed to submit libretto');
		}
	};
</script>

<svelte:head>
	<title>Submit Libretto - Think System Memorizer</title>
</svelte:head>

<div class="mx-auto max-w-4xl p-8">
	<h1 class="mb-8 text-center text-3xl font-bold text-gray-800">Submit a New Libretto</h1>

	<div class="mb-6 text-center text-red-600">
		WARNING: This is not a real feature yet. It will not save your script.
	</div>

	<form onsubmit={handleSubmit} class="flex flex-col gap-6">
		<div class="flex flex-col gap-2">
			<label for="title" class="text-sm font-semibold text-gray-700">Title *</label>
			<input
				id="title"
				name="title"
				type="text"
				required
				class="rounded-md border-2 border-gray-300 px-3 py-2 text-base transition-colors focus:border-blue-500 focus:outline-none"
			/>
		</div>

		<div class="flex flex-col gap-2">
			<label for="content" class="text-sm font-semibold text-gray-700">Libretto Content *</label>
			<textarea
				id="content"
				name="content"
				placeholder="Paste the text here..."
				rows="10"
				required
				class="min-h-80 resize-y rounded-md border-2 border-gray-300 px-3 py-2 font-mono text-base transition-colors focus:border-blue-500 focus:outline-none"
			></textarea>
		</div>

		<div class="mb-6 text-center text-red-600">
			WARNING: This is not a real feature yet. It will not save your script.
		</div>

		<div class="mt-4 flex justify-center gap-4">
			<button
				type="submit"
				class="cursor-pointer rounded-md border-none bg-blue-600 px-8 py-3 text-base text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
			>
				Submit Libretto
			</button>
			<a
				href="{base}/librettos"
				class="cursor-pointer rounded-md border-none bg-gray-600 px-8 py-3 text-base text-white transition-colors hover:bg-gray-700"
			>
				Cancel
			</a>
		</div>
	</form>
</div>
