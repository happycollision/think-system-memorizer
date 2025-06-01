<script>
	import { base } from '$app/paths';
	const libFilesNames = [
		{ label: 'Diamonds & Divas: Adam', file: 'DiamondsAdam' },
		{ label: 'Diamonds & Divas: Jimmy', file: 'Diamonds' },
		{ label: 'Hairspray: Corny', file: 'Hairspray' },
		{ label: 'Bridges: Robert', file: 'Bridges' },
		{ label: 'Elf: Jovie', file: 'Elf' },
		{ label: 'Grease: Kenicke', file: 'Grease' },
		{ label: 'Zombie Prom: Jonny', file: 'ZombieProm' },
		{ label: 'Music Man: Harold', file: 'MusicManHaroldHill' },
		{ label: 'Music Man: Marian', file: 'MusicManMarian' },
		{ label: 'Darkness', file: 'DarknessFalls' }
	];
</script>

<div class="mx-auto my-12 max-w-3xl text-2xl">Librettos</div>
<nav class="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
	{#each libFilesNames as lib (lib)}
		<a class="btn flex h-12 items-center justify-center" href="{base}/librettos/{lib.file}"
			>{lib.label}</a
		>
	{/each}
</nav>
