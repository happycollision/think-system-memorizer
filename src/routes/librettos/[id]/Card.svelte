<script lang="ts" generics="T">
	import type { Component as SvelteComponent } from 'svelte';
	import type { Attachment } from 'svelte/attachments';

	type Props = {
		front: T;
		back: T;
		isFlipped: boolean;
		isFocusedCard: boolean;
		flipCard: () => void;
		Component: SvelteComponent<{ content: T }>;
	};

	let { front, back, isFlipped, isFocusedCard, flipCard, Component }: Props = $props();

	/**
	 * If the front card is quite long, we likely don't care much about the stuff
	 * near the top, since that is not the actor's cue.
	 */
	const scrollCardToBottom: Attachment = (el) => {
		$effect(() => {
			if (!isFocusedCard) return;
			setTimeout(() => {
				el.scrollTo({
					top: el.scrollHeight,
					behavior: 'smooth',
				});
			}, 200);
		});
	};
</script>

<button
	type="button"
	onclick={flipCard}
	style="--flip-duration: 0.35s"
	class={[
		'flip-card relative isolate m-auto block h-full w-full max-w-md touch-manipulation text-left text-2xl',
		{ flipped: isFlipped },
	]}
>
	<span class="sr-only">(Click or tap to flip)</span>
	<div
		class="front overflow-auto rounded-xl bg-blue-400 p-4 dark:bg-blue-900"
		{@attach scrollCardToBottom}
	>
		<Component content={front} />
	</div>
	<div class="back overflow-auto rounded-xl bg-green-400 p-4 dark:bg-green-900">
		<Component content={back} />
	</div>
</button>

<style>
	.flip-card {
		& {
			perspective: 1800px;
		}
		.back,
		.front {
			height: 100%;
			width: 100%;
			position: absolute;
			top: 0;
			left: 0;

			-webkit-transform-style: preserve-3d;
			-moz-transform-style: preserve-3d;
			-ms-transform-style: preserve-3d;
			-o-transform-style: preserve-3d;
			transform-style: preserve-3d;
			-webkit-backface-visibility: hidden;
			-moz-backface-visibility: hidden;
			-ms-backface-visibility: hidden;
			-o-backface-visibility: hidden;
			backface-visibility: hidden;
			-webkit-transition: var(--flip-duration);
			-moz-transition: var(--flip-duration);
			-ms-transition: var(--flip-duration);
			-o-transition: var(--flip-duration);
			transition: var(--flip-duration);
		}
		.front {
			z-index: 1;
			-webkit-transform: rotateY(0deg);
			-moz-transform: rotateY(0deg);
			-ms-transform: rotateY(0deg);
			-o-transform: rotateY(0deg);
			transform: rotateY(0deg);
		}
		&.flipped .front {
			z-index: 0;
			-webkit-transform: rotateY(180deg);
			-moz-transform: rotateY(180deg);
			-ms-transform: rotateY(180deg);
			-o-transform: rotateY(180deg);
			transform: rotateY(180deg);
		}
		.back {
			z-index: 0;
			-webkit-transform: rotateY(-180deg);
			-moz-transform: rotateY(-180deg);
			-ms-transform: rotateY(-180deg);
			-o-transform: rotateY(-180deg);
			transform: rotateY(-180deg);
		}
		&.flipped .back {
			z-index: 1;
			-webkit-transform: rotateY(0deg);
			-moz-transform: rotateY(0deg);
			-ms-transform: rotateY(0deg);
			-o-transform: rotateY(0deg);
			transform: rotateY(0deg);
		}
	}
</style>
