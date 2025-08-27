<script lang="ts">
	import type { CardStore } from '$lib/cardStore.svelte';
	import { onMount } from 'svelte';
	import type { FountainParser, SceneElement } from '../../../fountain-parser';
	import type { Libretto } from '../../api/librettos.json/+server';
	import SceneElementComponent from './SceneElement.svelte';
	import { navState } from '$lib/nav.extension.svelte';
	import { getHeaderHeightAndPadding } from './Header.svelte';

	type Props = {
		parsed: ReturnType<FountainParser['parse']>;
		characterName?: Libretto['characterName'];
		getIndexFromEl: (el: SceneElement) => number | undefined;
		cardStore: CardStore<SceneElement[]>;
	};
	let { parsed: screenplay, characterName, getIndexFromEl, cardStore }: Props = $props();

	let observer: IntersectionObserver | undefined = $state();

	function scrollIntoViewAsync(element: HTMLElement, options = { behavior: 'smooth' as const }) {
		return new Promise<void>((resolve) => {
			let lastScrollTime = Date.now();
			const handler = () => {
				lastScrollTime = Date.now();
			};

			window.addEventListener('scroll', handler);

			element.scrollIntoView(options);

			function checkScrollEnd() {
				if (Date.now() - lastScrollTime > 100) {
					window.removeEventListener('scroll', handler);
					resolve();
				} else {
					requestAnimationFrame(checkScrollEnd);
				}
			}
			requestAnimationFrame(checkScrollEnd);
		});
	}

	$effect(() => {
		if (navState.shouldScroll) {
			const sceneElement = document.getElementById(`card-${navState.card - 1}`);
			if (sceneElement) {
				navState.acceptScrollRequest((done) => scrollIntoViewAsync(sceneElement).then(done));
			}
		}
	});

	function toActorDirection(dir: 'next' | 'prev') {
		const elements = Array.from(
			document.querySelectorAll('[data-actor-direction]'),
		) as HTMLElement[];
		const targetIndex = elements.findIndex((el) => {
			const pos = el.getBoundingClientRect().top + window.scrollY;
			return pos > window.scrollY + getHeaderHeightAndPadding();
		});

		let target = elements[targetIndex + (dir === 'next' ? 0 : -2)];

		// we might be at/past the last one...
		if (targetIndex === -1 && elements.length > 0 && dir === 'prev') {
			const penultimate = elements[elements.length - 2];
			const ultimate = elements[elements.length - 1];

			target = ultimate;

			if (ultimate && penultimate) {
				if (
					ultimate.getBoundingClientRect().top + window.scrollY ===
					window.scrollY + getHeaderHeightAndPadding()
				) {
					// already at the end, so go to the previous one
					target = penultimate;
				}
			}
		}

		if (target) {
			navState.acceptScrollRequest((done) => scrollIntoViewAsync(target).then(done));
		}
	}

	onMount(() => {
		navState.shouldScroll = true;
		setTimeout(
			() =>
				(observer = new IntersectionObserver(
					(entries) => {
						entries.forEach((entry) => {
							if (entry.isIntersecting) {
								const dataId = (entry.target as HTMLDivElement).dataset.elIndex;
								if (!dataId) return;
								const idx = Number(dataId);
								if (idx === cardStore.currentCardIndex) return;
								cardStore.goToCard(idx);
							}
						});
					},
					{
						// A thin line at the top of the viewport
						rootMargin: '-1px 0px -99% 0px',
					},
				)),
			// Time for the smooth scroll above to complete. One second won't hurt anybody.
			1000,
		);

		return () => observer?.disconnect();
	});
</script>

<div class="fixed right-0 bottom-0">{cardStore.currentCardIndex + 1}</div>

<div class="screenplay-container">
	{#if screenplay}
		{#if Object.keys(screenplay.title_page).length > 0}
			<div class="title-page">
				{#each Object.entries(screenplay.title_page) as [key, values] (key)}
					{#if values && values.length > 0}
						<div class="title-page-item">
							<span class="title-key">{key.replace(/_/g, ' ').toUpperCase()}:</span>
							{#each values as value, i (i)}
								<p class="title-value">{value}</p>
							{/each}
						</div>
					{/if}
				{/each}
			</div>
		{/if}

		<div class="scenes">
			{#each screenplay.scenes as scene, i (i)}
				{#each scene.elements as sceneElement, i (i)}
					<div
						data-el-index={getIndexFromEl(sceneElement)}
						{@attach (divEl) => {
							if (!observer) return;
							observer.observe(divEl);
							return () => observer?.unobserve(divEl);
						}}
					>
						<SceneElementComponent
							id={`card-${getIndexFromEl(sceneElement)}`}
							el={sceneElement}
							{characterName}
						/>
					</div>
				{/each}
			{/each}
		</div>
	{:else}
		<p>Loading screenplay...</p>
	{/if}
</div>

<div class="fixed bottom-0 left-0 p-4">
	<div class="inline-flex gap-2">
		<button
			class="btn aspect-square rounded-full p-2 shadow-lg shadow-black/40"
			onclick={() => toActorDirection('next')}>Nxt</button
		>
		<button
			class="btn aspect-square rounded-full p-2 shadow-lg shadow-black/40"
			onclick={() => toActorDirection('prev')}>Prv</button
		>
	</div>
</div>

<style lang="postcss">
	.screenplay-container {
		font-family: 'Courier New', Courier, monospace;
		max-width: 800px;
		margin: 20px auto;
		padding: 20px;
		line-height: 1.6;
	}

	.title-page {
		text-align: center;
		margin-bottom: 40px;
		padding-bottom: 20px;
	}

	.title-page-item {
		margin-bottom: 15px;
	}

	.title-key {
		font-weight: bold;
		display: block;
	}

	.title-value {
		margin-top: 5px;
	}
</style>
