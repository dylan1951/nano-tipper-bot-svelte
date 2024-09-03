<script lang="ts">
    import {onMount} from "svelte";
    import SvgQR from '@svelte-put/qr/svg/QR.svelte';
    import {Circle} from 'svelte-loading-spinners';
    import {PUBLIC_BACK_END_HOST} from '$env/static/public'
    import {goto, invalidateAll} from "$app/navigation";

    let sending: boolean = false;
    let loading: boolean = true;

    export let balance: string
    export let nanoAddress: string
    export let username: string
    let withdrawAddress = "";
    let amount = "";

    let currentAction = 'deposit';

    async function updateAccount() {
        const response = await fetch(`${PUBLIC_BACK_END_HOST}/account`, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("account", data['account']);
            localStorage.setItem("balance", data['balance']);
            nanoAddress = data['account']
            balance = data['balance'];
            username = data['username'];
            loading = false;
        } else {
            console.error(response);
            if (response.status === 401) {
                localStorage.removeItem("account");
                localStorage.removeItem("balance");
                await goto("/");
            }
        }
    }

    onMount(() => {
        updateAccount()
    });

    async function handleWithdraw() {
        if (withdrawAddress && amount) {
            sending = true;

            const response = await fetch(`${PUBLIC_BACK_END_HOST}/withdraw`, {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify({
                    address: withdrawAddress,
                    amount: amount
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            sending = false;

            if (response.ok) {
                const data = await response.json();
                alert(`Successfully sent Nano. Hash: ${data.block}`);
                await updateAccount();
            } else {
                if (response.status === 401) {
                    window.location.href = `${PUBLIC_BACK_END_HOST}/authenticate`;
                } else {
                    alert(await response.text());
                }
            }
        } else {
            alert("Please enter a valid address and amount.");
        }
    }
</script>

<style>
    .container {
        max-width: 400px;
        margin: 5vh auto 0;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        background-color: #f9f9f9;
        font-family: Arial, sans-serif;
        box-sizing: border-box; /* Ensure padding is included in width */
    }

    .header {
        text-align: center;
        margin-bottom: 20px;
    }

    .balance {
        font-size: 1.5em;
        font-weight: bold;
        margin-bottom: 10px;
    }

    .nano-address {
        font-size: 0.9em;
        word-wrap: break-word;
        background-color: #f9f9f9;
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 20px;
    }

    input, button {
        width: 100%;
        padding: 10px;
        margin-bottom: 15px;
        border-radius: 5px;
        border: 1px solid #ccc;
        box-sizing: border-box; /* Include padding in the element's width */
    }

    button {
        background-color: #00bfa5;
        color: white;
        font-size: 1em;
        cursor: pointer;
        border: none;
        transition: background-color 0.3s ease;
    }

    button:hover {
        background-color: #009c87;
    }

    button:disabled {
        background-color: #cccccc; /* A lighter gray to indicate the disabled state */
        color: #666666; /* A darker gray color for the text */
        cursor: not-allowed; /* Changes the cursor to indicate it's not clickable */
        opacity: 0.6; /* Reduces the opacity for a disabled effect */
    }

    .username {
        font-size: 1.2em;
        color: #555;
        margin-bottom: 10px;
    }

    .loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100px; /* Adjust height as needed */
    }

    .sending-container {
        display: flex;
        justify-content: center; /* Horizontally centers the spinner */
        align-items: center;
    }

    .tabs {
        width: 100%;
        display: flex;
        box-sizing: border-box;
        border-radius: 0.3rem;
        padding-left: 20px;
        padding-right: 20px;
        margin-bottom: 20px;
    }

    .tab {
        flex: 1;
        text-align: center;
        padding: 0.5rem 0;
        cursor: pointer;
        border-bottom: 3px solid #cccccc; /* inactive state */
        font-size: 14pt;
    }

    .tab.active {
        color: #6200ee;
        border-bottom: 3px solid #253c69; /* active state */
    }
</style>

<div class="container">
    {#if loading}
        <div class="loading-container">
            <Circle size="60" color="#253c69" unit="px" duration="1s"/>
        </div>
    {:else}
        <div class="header">
            <h2>Nano Sprinkle</h2>
            <div class="username">@{username}</div>
            <div class="balance">Balance: {balance} Nano</div>
        </div>

        <div class="tabs">
            <div class="tab {currentAction === 'deposit' ? 'active' : ''}" on:click={() => currentAction = 'deposit'}>
                Deposit
            </div>
            <div class="tab {currentAction === 'withdraw' ? 'active' : ''}" on:click={() => currentAction = 'withdraw'}>
                Withdraw
            </div>
        </div>

        {#if currentAction === "deposit"}
            <div class="nano-address">
                {nanoAddress}
            </div>

            <SvgQR data={`nano:${nanoAddress}`}/>
        {:else}
            <input type="text" placeholder="Withdraw Amount" bind:value={amount}/>
            <input type="text" placeholder="Destination Nano Address" bind:value={withdrawAddress}/>

            {#if !sending}
                <button disabled={sending} on:click={handleWithdraw}>Withdraw Nano</button>
            {:else}
                <div class="sending-container">
                    <Circle color="#253c69" size="30" unit="px" duration="1s"/>
                </div>
            {/if}
        {/if}
    {/if}
</div>