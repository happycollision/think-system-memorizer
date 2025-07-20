<script lang="ts">
	import type { FountainParser, SceneElement } from '../../../fountain-parser';
	import type { Libretto } from '../../api/librettos.json/+server';
	import SceneElementComponent from './SceneElement.svelte';

	type Props = {
		parsed: ReturnType<FountainParser['parse']>;
		characterName?: Libretto['characterName'];
	};
	const { parsed: screenplay, characterName }: Props = $props();
</script>

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
						<SceneElementComponent
							{el}
							scene_number_token={scene.scene_number_token}
							{characterName}
						/>
					{/each}
				</div>
			{/each}
		</div>
	{:else}
		<p>Loading screenplay...</p>
	{/if}
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

	.scene {
		margin-bottom: 30px;
	}

	.scene-number-token {
		font-weight: bold;
		margin-bottom: 10px;
	}
</style>
