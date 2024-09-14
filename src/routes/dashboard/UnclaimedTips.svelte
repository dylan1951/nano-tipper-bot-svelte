<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { PUBLIC_BACK_END_HOST } from '$env/static/public';
    import { convert, Unit } from 'nanocurrency';
    import confetti from 'canvas-confetti';
    import {createEventDispatcher} from "svelte";
    import LoadingSpinner from "./LoadingSpinner.svelte";

    export let unclaimedTips: { tweetId?: string; amount: string; from: { username: string }; hash: string }[] = [];
    export let nanoAddress: string;

    const dispatch = createEventDispatcher();

    let receivableBlocks: { hash: string; amount_nano: string; source: string; username?: string; tweetId?: string }[] = [];
    let receivingBlock: string | null = null;
    let errorMessage: string | null = null;
    let loading = true;

    async function fetchReceivableBlocks() {
        try {
            const response = await fetch('https://rpc.nano.to', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'receivable', account: nanoAddress, source: true })
            });

            loading = false;

            if (!response.ok) {
                throw new Error(`Failed to fetch receivable blocks: ${response.statusText}`);
            }

            const data = await response.json();
            const blocks = data.blocks || {};
            receivableBlocks = Object.keys(blocks).map(hash => {
                const tip = unclaimedTips.find(t => t.hash === hash);
                return {
                    hash,
                    source: blocks[hash].source,
                    amount_nano: convert(blocks[hash].amount, { from: Unit.raw, to: Unit.Nano }),
                    username: tip?.from.username,
                    tweetId: tip?.tweetId
                };
            });
        } catch (error) {
            console.error(error);
            errorMessage = 'Error fetching receivable blocks. Please try again later.';
        }
    }

    async function receiveBlock(hash: string) {
        if (receivingBlock !== null) return;
        receivingBlock = hash;

        try {
            const response = await fetch(`${PUBLIC_BACK_END_HOST}/receive`, {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify({ block: hash }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`Failed to receive block: ${response.statusText}`);
            }

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            receivableBlocks = receivableBlocks.filter(block => block.hash !== hash);

            // Dispatch 'close' event if all blocks are received
            if (receivableBlocks.length === 0) {
                dispatch('close');
            }
        } catch (error) {
            console.error(error);
            errorMessage = 'Error receiving block. Please try again.';
        } finally {
            receivingBlock = null;
        }
    }

    // Fetch receivable blocks when component is mounted
    fetchReceivableBlocks();
</script>

<style>
    .header {
        text-align: center;
        margin-bottom: 20px;
    }
    .title {
        font-size: 1.7em;
        color: #253c69;
        margin-bottom: 5px;
    }
    .block-item {
        background-color: #e4f3ff;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
        transition: transform 0.2s ease;
    }
    .block-item:hover {
        transform: translateY(-2px);
    }
    .block-source, .block-tip {
        font-size: 0.9em;
        color: #666;
        margin-bottom: 5px;
        display: flex;
        align-items: center;
    }
    .block-source {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .block-amount {
        font-size: 1.2em;
        color: #253c69;
        font-weight: bold;
        margin-bottom: 10px;
    }
    .receive-button {
        background-color: #8e7cc3;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        font-size: 0.9em;
        cursor: pointer;
        transition: background-color 0.2s ease;
        width: 100%;
    }
    .receive-button:hover:not(:disabled) {
        background-color: #7b68b5;
    }
    .receive-button:disabled {
        background-color: #bdc3c7;
        cursor: not-allowed;
    }
    .error-message {
        color: #e74c3c;
        text-align: center;
        margin-bottom: 15px;
        padding: 8px;
        background-color: #fadbd8;
        border-radius: 4px;
    }
    .close-button {
        background-color: #bdc3c7;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        font-size: 0.9em;
        cursor: pointer;
        transition: background-color 0.2s ease;
        margin-top: 15px;
        width: 100%;
    }
    .close-button:hover {
        background-color: #c0392b;
    }
    a {
        color: #8e7cc3;
        text-decoration: none;
        margin-left: 5px;
    }
    a:hover {
        text-decoration: underline;
    }
    .icon {
        width: 16px;
        height: 16px;
        margin-right: 5px;
    }
</style>

<div class="container">
    {#if errorMessage}
        <div class="error-message">{errorMessage}</div>
    {/if}

    <div class="header">
        <h1 class="title">🎉 Claim your Tips 🎉</h1>
    </div>

    {#if loading}
        <LoadingSpinner></LoadingSpinner>
    {/if}

    {#each receivableBlocks as block (block.hash)}
        <div class="block-item"
             in:fly={{ y: 20, duration: 200 }}
             out:fade={{ duration: 150 }}>
            {#if block.username}
                <div class="block-tip">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <a href="https://x.com/{block.username}" target="_blank">@{block.username}</a>
                    {#if block.tweetId}
                        <a href="https://x.com/i/web/status/{block.tweetId}" target="_blank">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                        </a>
                    {/if}
                </div>
            {:else}
                <div class="block-source" title={block.source}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                    {block.source}
                </div>
            {/if}
            <div class="block-amount">{block.amount_nano} Ӿ</div>
            <button
                    class="receive-button"
                    on:click={() => receiveBlock(block.hash)}
                    disabled={receivingBlock !== null}
            >
                {receivingBlock === block.hash ? 'Claiming...' : 'Claim'}
            </button>
        </div>
    {/each}

    <button class="close-button" on:click={() => dispatch('close')}>Close</button>
</div>