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

<div>List of all librettos:</div>

{#each libFilesNames as lib (lib)}
	<div>
		<a class="btn" href="{base}/librettos/{lib.file}">{lib.label}</a>
	</div>
{/each}
