<script lang="ts">
	import AdHocSyntax from './AdHocSyntax.svelte';

	const { data } = $props();
</script>

<AdHocSyntax libretto={data.libretto} />
