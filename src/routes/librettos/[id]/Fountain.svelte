<script lang="ts">
	import type { CardStore } from '$lib/cardStore.svelte';
	import { onMount } from 'svelte';
	import type { FountainParser, SceneElement } from '../../../fountain-parser';
	import type { Libretto } from '../../api/librettos.json/+server';
	import SceneElementComponent from './SceneElement.svelte';
	import { navState } from '$lib/nav.extension.svelte';
	import { getHeaderHeightAndPadding } from './Header.svelte';
	import { characterMatch } from '$lib/characterMatch';
	import { browser } from '$app/environment';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';

	type Props = {
		parsed: ReturnType<FountainParser['parse']>;
		characterName?: Libretto['characterName'];
		getIndexFromEl: (el: SceneElement) => number | undefined;
		cardStore: CardStore<SceneElement[]>;
	};
	let { parsed: screenplay, characterName, getIndexFromEl, cardStore }: Props = $props();

	let runSheet = $derived(
		page.state.runSheet ?? (browser && page.url.searchParams.get('runSheet') === 'true'),
	);

	function toggleRunSheet() {
		if (!browser) return;
		const next = !runSheet;
		const newUrl = new URL(page.url);
		if (next) {
			newUrl.searchParams.set('runSheet', 'true');
		} else {
			newUrl.searchParams.delete('runSheet');
		}
		replaceState(newUrl, { ...page.state, runSheet: next });
	}

	let elements = $derived.by(() => {
		if (!screenplay) return [];
		const elements = screenplay.scenes.flatMap((s) => s.elements);
		if (!runSheet) return elements;
		return elements
			.filter((el, i, arr) => {
				switch (el.type) {
					case 'section':
					case 'scene_heading':
					case 'actor_direction':
					case 'actor_break':
						return true;

					case 'character':
						return (
							(characterMatch(characterName, el.name) || el.name.includes('CUE')) &&
							arr[i + 1]?.type === 'dialogue'
						);
					case 'dialogue':
						return characterMatch(characterName, el.character) || el.character?.includes('CUE');

					default:
						return false;
				}
			})
			.filter((el, i, arr) => {
				if (el.type !== 'character') return true;
				const maybePrevChar = arr[i - 2];
				if (maybePrevChar?.type === 'character' && maybePrevChar.name === el.name) return false;
				return true;
			});
	});

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

<div class="screenplay-container print:columns-2 print:text-xs">
	{#if screenplay}
		{#if Object.keys(screenplay.title_page).length > 0 && !runSheet}
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

		<div class="@container">
			{#each elements as sceneElement, i (i)}
				<SceneElementComponent
					{runSheet}
					data-el-index={getIndexFromEl(sceneElement)}
					id={`card-${getIndexFromEl(sceneElement)}`}
					{@attach (divEl) => {
						if (!observer) return;
						observer.observe(divEl);
						return () => observer?.unobserve(divEl);
					}}
					el={sceneElement}
					{characterName}
				/>
			{/each}
		</div>
	{:else}
		<p>Loading screenplay...</p>
	{/if}
</div>

{#if !runSheet}
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
{/if}

<div class="fixed right-0 bottom-0 p-4 print:hidden">
	<button
		class="btn rounded-full px-4 py-2 shadow-lg shadow-black/40"
		onclick={toggleRunSheet}
	>
		{runSheet ? 'Full script' : 'Run sheet'}
	</button>
</div>

<style lang="postcss">
	.screenplay-container {
		font-family: 'Courier New', Courier, monospace;
		max-width: 800px;
		margin: 20px auto;
		padding: 20px;
		line-height: 1.6;

		@media print {
			columns: 2;
			max-width: none;
			margin: auto;
			padding: 0;
			line-height: 1.2;
		}
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
