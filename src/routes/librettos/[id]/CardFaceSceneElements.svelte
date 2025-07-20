<script lang="ts">
	import type { SceneElement } from '../../../fountain-parser';
	import SceneElementComponent from './SceneElement.svelte';

	type Props = {
		content: SceneElement[];
	};

	let { content }: Props = $props();
</script>

{#each content as el, i (i)}
	<SceneElementComponent {el} />
{/each}
