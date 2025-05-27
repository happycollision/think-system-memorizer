<script module lang="ts">
	export { default as SwiperSlide } from './SwiperSlide.svelte';
</script>

<script lang="ts">
	import { register, type SwiperContainer } from 'swiper/element/bundle';
	import { browser } from '$app/environment';
	import type { Snippet } from 'svelte';
	register();

	type Props = {
		slideIndex: number;

		children: Snippet;
		onSlideChange?: (index: number) => void;
	};

	let { children, onSlideChange, slideIndex }: Props = $props();

	let swiperEl: SwiperContainer | undefined;

	$effect(function syncOutsideChanges() {
		if (!swiperEl) return;
		if (slideIndex !== swiperEl.swiper.activeIndex) {
			swiperEl.swiper.slideTo(slideIndex);
		}
	});

	$effect(function styleContainerToAllowCardsBreakthrough() {
		if (!swiperEl) return;
		swiperEl.shadowRoot?.styleSheets[0].insertRule(
			'.swiper {overflow-x:clip;overflow-y:visible}',
			swiperEl.shadowRoot?.styleSheets[0].cssRules.length
		);
	});
</script>

{#if browser}
	<swiper-container
		class="h-full"
		bind:this={swiperEl}
		initial-slide={slideIndex}
		slides-per-view={1}
		space-between={10}
		centered-slides={true}
		virtual={true}
		onswiperslidechange={() => {
			const index = swiperEl?.swiper.activeIndex;
			if (index === undefined) return;
			onSlideChange?.(index);
		}}
	>
		{@render children()}
	</swiper-container>
{/if}
