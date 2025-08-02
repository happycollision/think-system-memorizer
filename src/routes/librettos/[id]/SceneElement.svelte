<script lang="ts">
	import { characterMatch } from '$lib/characterMatch';
	import type { SceneElement } from '../../../fountain-parser';
	import type { Libretto } from '../../api/librettos.json/+server';

	type Props = {
		el: SceneElement;
		id?: string;
		scene_number_token?: string;
		characterName?: Libretto['characterName'];
	};
	const { el, id, scene_number_token, characterName }: Props = $props();
</script>

<div class="@container relative block w-full text-left" {id}>
	<div class="text-right text-xs">{el.type}</div>
	{#if el.type === 'scene_heading'}
		<div class="scene-heading">
			{el.text}
			{#if el.scene_number && el.scene_number !== scene_number_token}
				<span class="scene-number-inline">{el.scene_number}</span>
			{/if}
		</div>
	{:else if el.type === 'action'}
		{@const text = el.text.split('\n')}
		<p class="action {el.isCentered ? 'centered' : ''}">
			{#each text as line, j (j)}
				{line}{#if j < text.length - 1}<br />{/if}
			{/each}
		</p>
	{:else if el.type === 'character'}
		<p class="character">{el.name}</p>
	{:else if el.type === 'dialogue'}
		{@const text = el.text.split('\n')}
		<p class={['dialogue', characterMatch(characterName, el.character) && 'highlight']}>
			{#each text as line, j (j)}
				{line}{#if j < text.length - 1}<br />{/if}
			{/each}
		</p>
	{:else if el.type === 'parenthetical'}
		<p class="parenthetical">{el.text}</p>
	{:else if el.type === 'transition'}
		<p class="transition">{el.text}</p>
	{:else if el.type === 'note'}
		{@const text = el.text.split('\n')}
		<p class="note">
			<em
				>{#each text as line, j (j)}
					{line}{#if j < text.length - 1}<br />{/if}
				{/each}</em
			>
		</p>
	{:else if el.type === 'lyric'}
		{@const text = el.text.split('\n')}
		<p class={['lyric', characterMatch(characterName, el.character) && 'highlight']}>
			<em
				>{#each text as line, j (j)}
					{line}{#if j < text.length - 1}<br />{/if}
				{/each}</em
			>
		</p>
	{/if}
</div>

<style>
	.scene-heading {
		font-weight: bold;
		text-transform: uppercase;
		margin-top: 20px;
		margin-bottom: 15px;
		padding: 5px 10px;
	}
	.scene-number-inline {
		margin-left: 10px;
		font-style: italic;
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
