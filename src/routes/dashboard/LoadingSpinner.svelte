<script lang="ts">
    import { Circle } from 'svelte-loading-spinners';
</script>

<style>
    .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100px;
    }
</style>

<div class="loading-container">
    <Circle size="60" color="#8e7cc3" unit="px" duration="1s"/>
</div>