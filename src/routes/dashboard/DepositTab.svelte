<script lang="ts">
    import SvgQR from '@svelte-put/qr/svg/QR.svelte';

    export let nanoAddress: string;

    let copied = false;

    function copyAddress() {
        navigator.clipboard.writeText(nanoAddress);
        copied = true;
        setTimeout(() => copied = false, 2000);
    }
</script>

<style>
    .nano-address {
        font-size: 0.9em;
        background-color: #efeaf7;
        padding: 10px 40px 10px 10px;
        border-radius: 8px;
        margin: 10px 0;
        word-break: break-all;
        position: relative;
    }
    .copy-icon {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
        color: #8e7cc3;
        background-color: #efeaf7;
        padding: 5px;
        border-radius: 4px;
    }
    .qr-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: auto;
    }
    .qr-container :global(svg) {
        width: 100%;
        height: 100%;
    }
</style>

<div class="nano-address">
    {nanoAddress}
    <span class="copy-icon" on:click={copyAddress}>
        {copied ? '✓' : '📋'}
    </span>
</div>

<div class="qr-container">
    <SvgQR data={`nano:${nanoAddress}`} logo="favicon.png" shape="circle"/>
</div>