<script lang="ts">
    import { Circle } from 'svelte-loading-spinners';
    import {PUBLIC_BACK_END_HOST} from "$env/static/public";

    let withdrawAddress = "";
    let amount = "";
    let sending = false;

    async function handleWithdraw(address: string, amount: string) {
        const response = await fetch(`${PUBLIC_BACK_END_HOST}/withdraw`, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({ address, amount }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            alert(`Successfully sent Nano. Hash: ${data.block}`);
        } else {
            if (response.status === 401) {
                window.location.href = `${PUBLIC_BACK_END_HOST}/authenticate`;
            } else {
                alert(await response.text());
            }
        }
    }

    async function onWithdraw() {
        sending = true;
        await handleWithdraw(withdrawAddress, amount);
        sending = false;
    }
</script>

<style>
    input {
        width: 100%;
        padding: 10px;
        margin-bottom: 12px;
        border-radius: 8px;
        border: 1px solid #d0c9e4;
        font-size: 1em;
        box-sizing: border-box;
    }
    button {
        width: 100%;
        padding: 10px;
        background-color: #8e7cc3;
        color: white;
        font-size: 1em;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }
    button:hover {
        background-color: #7b68b5;
    }
    .sending-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100px;
    }
</style>

<input type="text" placeholder="Withdraw Amount" bind:value={amount}/>
<input type="text" placeholder="Destination Nano Address" bind:value={withdrawAddress}/>

{#if !sending}
    <button disabled={sending} on:click={onWithdraw}>Withdraw Nano</button>
{:else}
    <div class="sending-container">
        <Circle color="#8e7cc3" size="30" unit="px" duration="1s"/>
    </div>
{/if}