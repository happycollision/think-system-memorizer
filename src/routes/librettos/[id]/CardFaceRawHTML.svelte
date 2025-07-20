<script lang="ts">
	type Props = {
		content: string;
	};

	let { content }: Props = $props();
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html content}
