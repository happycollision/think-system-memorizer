<script lang="ts">
	import { characterMatch } from '$lib/characterMatch';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { SceneElement } from '../../../fountain-parser';
	import type { Libretto } from '../../api/librettos.json/+server';

	interface Props extends HTMLAttributes<HTMLDivElement | HTMLParagraphElement> {
		el: SceneElement;
		characterName?: Libretto['characterName'];
		runSheet?: boolean;
	}
	const { el, characterName, runSheet, ...htmlProps }: Props = $props();
</script>

<!-- <div class="text-right text-xs">{el.type}; {el.sceneIndex}; {el.id}</div> -->

{#if el.type === 'scene_heading'}
	<div class={[runSheet ? 'underline' : 'scene-heading']} {...htmlProps}>
		{el.text}
	</div>
{:else if el.type === 'action'}
	{@const text = el.text.split('\n')}
	<p class="action {el.isCentered ? 'centered' : ''}" {...htmlProps}>
		{#each text as line, j (j)}
			{line}{#if j < text.length - 1}<br />{/if}
		{/each}
	</p>
{:else if el.type === 'character'}
	<p class={[runSheet ? 'mt-1 ml-12 text-center' : 'character']} {...htmlProps}>{el.name}</p>
{:else if el.type === 'dialogue'}
	{@const text = el.text.split('\n')}
	<p
		class={[
			runSheet ? 'mt-1 ml-12' : 'dialogue',
			!runSheet && characterMatch(characterName, el.character) && 'highlight',
		]}
		{...htmlProps}
	>
		{#each text as line, j (j)}
			{line}{#if j < text.length - 1}<br />{/if}
		{/each}
	</p>
{:else if el.type === 'actor_direction'}
	<p
		data-actor-direction
		class={[
			runSheet
				? 'ml-4 font-sans'
				: 'bg-black/5 p-2 font-sans inset-shadow-sm inset-shadow-black/40 dark:bg-white/10 dark:inset-shadow-white',
		]}
		{...htmlProps}
	>
		• {el.text}
	</p>
{:else if el.type === 'lesser_actor_direction'}
	<p
		class={[
			runSheet
				? 'ml-4 font-sans'
				: 'p-2 font-sans inset-shadow-sm inset-shadow-black/20 dark:inset-shadow-white',
		]}
		{...htmlProps}
	>
		• {el.text}
	</p>
{:else if el.type === 'parenthetical'}
	<p class="parenthetical" {...htmlProps}>{el.text}</p>
{:else if el.type === 'transition'}
	<p class="transition" {...htmlProps}>{el.text}</p>
{:else if el.type === 'section'}
	{#if el.level === 1}
		<h1
			class={[runSheet ? 'underline [text-decoration-style:dotted]' : 'my-4 text-xl font-bold']}
			{...htmlProps}
		>
			{el.text}
		</h1>
	{:else if el.level === 2}
		<h2
			class={[runSheet ? 'underline [text-decoration-style:dotted]' : 'my-3 text-lg font-bold']}
			{...htmlProps}
		>
			{el.text}
		</h2>
	{/if}
{:else if el.type === 'note'}
	{@const text = el.text.split('\n')}
	<p class="note" {...htmlProps}>
		<em
			>{#each text as line, j (j)}
				{line}{#if j < text.length - 1}<br />{/if}
			{/each}</em
		>
	</p>
{:else if el.type === 'lyric'}
	{@const text = el.text.split('\n')}
	<p class={['lyric', characterMatch(characterName, el.character) && 'highlight']} {...htmlProps}>
		<em
			>{#each text as line, j (j)}
				{line}{#if j < text.length - 1}<br />{/if}
			{/each}</em
		>
	</p>
{/if}

<style>
	.scene-heading {
		font-weight: bold;
		text-transform: uppercase;
		margin-top: 20px;
		margin-bottom: 15px;
		padding: 5px 10px;
	}

	.action {
		margin-top: 10px;
		margin-bottom: 10px;
		padding-inline: 0.5in;
	}

	.action.centered {
		text-align: center;
		margin-left: auto;
		margin-right: auto;
	}

	.character {
		text-transform: uppercase;
		margin-top: 15px;
		margin-bottom: 5px;
		text-align: center;
	}

	.dialogue {
		margin-bottom: 10px;
	}

	.parenthetical {
		margin-left: 3in; /* Standard parenthetical indent */
		margin-right: 3in;
		margin-bottom: 5px;
	}

	.transition {
		text-transform: uppercase;
		text-align: right;
		margin-top: 15px;
		margin-bottom: 15px;
		margin-right: 1in;
	}

	.note {
		padding: 10px;
		margin: 10px 1.5in;
		font-style: italic;
	}

	.lyric {
		padding-left: 1in;
		margin-bottom: 5px;
		font-style: italic;
	}

	/* Adjust indents for smaller screens if necessary */
	@container (width < 768px) {
		.action {
			margin-left: 1em;
			margin-right: 1em;
		}
		.character {
			margin-left: 2em;
		}
		.dialogue {
			margin-left: 1.5em;
			margin-right: 1.5em;
		}
		.parenthetical {
			margin-left: 2em;
			margin-right: 2em;
		}
		.transition {
			text-align: left;
			margin-left: 1em;
			margin-right: 1em;
		}
		.note {
			margin: 10px 1em;
		}
		.lyric {
			margin-left: 1.5em;
		}
	}
</style>
