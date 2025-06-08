<script lang="ts">
	import type { PageData } from './$types';
	import type { SceneElement } from '../../../fountain-parser'; // Adjusted path

	export let data: PageData;

	const { screenplay, error } = data;
	console.log('Screenplay data:', screenplay);
</script>

<svelte:head>
	<title>Diamonds - Screenplay</title>
</svelte:head>

<div class="screenplay-container">
	{#if error}
		<p class="error">Error loading screenplay: {error}</p>
	{:else if screenplay}
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
			{#each screenplay.scenes as scene_, i (i)}
				{@const scene = scene_ as {
					elements: SceneElement[];
					scene_number_token?: string;
					scene_number?: string;
				}}
				{#if i > 0}
					<hr />
				{/if}
				<div class="scene">
					{#if scene.scene_number_token && scene.elements.length > 0 && scene.elements[0].type !== 'scene_heading'}
						<!-- Display scene number if it's standalone and not part of a heading -->
						<p class="scene-number-token">{scene.scene_number_token}</p>
					{/if}
					{#each scene.elements as element, i (i)}
						{@const el = element as SceneElement}
						{#if el.type === 'scene_heading'}
							<div class="scene-heading">
								{el.text}
								{#if el.scene_number && el.scene_number !== scene.scene_number_token}
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
							<p class="dialogue">
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
							<p class="lyric">
								<em
									>{#each text as line, j (j)}
										{line}{#if j < text.length - 1}<br />{/if}
									{/each}</em
								>
							</p>
						{/if}
					{/each}
				</div>
			{/each}
		</div>
	{:else}
		<p>Loading screenplay...</p>
	{/if}
</div>

<style>
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

	.scene {
		margin-bottom: 30px;
	}

	.scene-heading {
		font-weight: bold;
		text-transform: uppercase;
		margin-top: 20px;
		margin-bottom: 15px;
		padding: 5px 10px;
	}
	.scene-number-token {
		font-weight: bold;
		margin-bottom: 10px;
	}
	.scene-number-inline {
		margin-left: 10px;
		font-style: italic;
	}

	.action {
		margin-top: 10px;
		margin-bottom: 10px;
		margin-left: 1.5in; /* Standard action indent */
		margin-right: 1in;
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
		margin-left: 3.5in; /* Standard character indent */
	}

	.dialogue {
		margin-left: 2.5in; /* Standard dialogue indent */
		margin-right: 2.5in;
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
		margin-left: 2.5in;
		margin-bottom: 5px;
		font-style: italic;
	}
	.error {
		font-weight: bold;
	}

	/* Adjust indents for smaller screens if necessary */
	@media (max-width: 768px) {
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
