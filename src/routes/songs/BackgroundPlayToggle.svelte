<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { bgPlay } from './backgroundPlay.svelte';

	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface Props extends HTMLAttributes<HTMLInputElement> {}

	let { onchange, ...htmlProps }: Props = $props();
</script>

<div class="mb-4 rounded bg-gray-100 p-2 dark:bg-gray-800">
	<label>
		<input
			type="checkbox"
			checked={bgPlay.enabled}
			class="mb-4"
			onchange={(e) => {
				bgPlay.toggle();
				onchange?.(e);
			}}
			{...htmlProps}
		/> Allow background playback
	</label>
	<div>
		On some devices, playback will stop when the screen locks or when switching apps. Enable this
		option to allow playback in the background. The precision of the loop boundaries will be reduced
		when using background playback.
	</div>
</div>
