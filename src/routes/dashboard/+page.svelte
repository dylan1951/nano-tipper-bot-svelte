<script lang="ts">
    import {onDestroy, onMount, tick} from "svelte";
    import SvgQR from '@svelte-put/qr/svg/QR.svelte';
    import {Circle} from 'svelte-loading-spinners';
    import {PUBLIC_BACK_END_HOST} from '$env/static/public'
    import {goto, invalidateAll} from "$app/navigation";
    import {subscribeToBlockConfirmations, websocketInstance} from "$lib/websockets";
    import {type DotLottie, DotLottieSvelte} from '@lottiefiles/dotlottie-svelte';
    import {convert, Unit} from "nanocurrency";

    let dotLottie: DotLottie | null = null;

    function onComplete() {
        showCheckmark = false;
    }

    function setupListeners(dotLottieInstance) {
        dotLottieInstance.addEventListener('complete', onComplete);
    }

    function removeListeners(dotLottieInstance) {
        dotLottieInstance.removeEventListener('complete', onComplete);
    }

    onDestroy(() => {
        if (dotLottie) {
            removeListeners(dotLottie);
        }
        if (websocketInstance) {
            websocketInstance.close();
        }
    });

    let sending: boolean = false;
    let loading: boolean = true;

    export let balance: string
    export let receivable: string
    export let nanoAddress: string
    export let username: string
    let withdrawAddress = "";
    let amount = "";
    let showCheckmark = false;

    let currentAction = 'deposit';
    let copied = false;

    function copyAddress() {
        navigator.clipboard.writeText(nanoAddress);
        copied = true;
        setTimeout(() => copied = false, 2000);
    }

    async function updateAccount() {
        const response = await fetch(`${PUBLIC_BACK_END_HOST}/account`, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("account", data['account']);
            nanoAddress = data['account']
            balance = data['balance'];
            username = data['username'];
            receivable = data['receivable'];
            loading = false;
        } else {
            console.error(response);
            if (response.status === 401) {
                localStorage.removeItem("account");
                await goto("/");
            }
        }
    }

    function receiveAll() {
        fetch(`${PUBLIC_BACK_END_HOST}/receive-all`, {
            method: 'POST',
            credentials: 'include',
        }).then(async response => {
            if (response.ok) {
                console.log("finished receiving all")
            }
        });
    }

    function handleSend(hash: string) {
        showCheckmark = true;

        fetch(`${PUBLIC_BACK_END_HOST}/receive`, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                block: hash,
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(async response => {
            if (response.ok) {
                console.log("finished receiving all")
            }
        });
    }

    function handleReceive(newBalance: string) {
        balance = convert(newBalance, {from: Unit.raw, to: Unit.Nano});
    }

    onMount(() => {
        updateAccount().then(() => {
            if (nanoAddress) {
                subscribeToBlockConfirmations(nanoAddress, handleSend, handleReceive);
                if (parseFloat(receivable) > 0) {
                    receiveAll()
                }
            }
        })
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
        width: 90%;
        max-width: 400px;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        background: linear-gradient(145deg, #f8f6ff, #ffffff);
        font-family: 'Roboto', sans-serif;
        box-sizing: border-box;
        margin: 5vh auto 2vh;
    }

    .header {
        text-align: center;
        margin-bottom: 15px;
    }

    .balance {
        font-size: 2em;
        font-weight: bold;
        color: #8e7cc3;
    }

    .nano-address {
        font-size: 0.9em;
        background-color: #efeaf7;
        padding: 10px 40px 10px 10px; /* Increased right padding */
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
        background-color: #efeaf7; /* Match background color */
        padding: 5px;
        border-radius: 4px;
    }

    input {
        width: 100%;
        padding: 10px;
        margin-bottom: 12px;
        border-radius: 8px;
        border: 1px solid #d0c9e4;
        font-size: 1em;
        box-sizing: border-box; /* Add this line */
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

    .tabs {
        display: flex;
        margin-bottom: 15px;
        border-radius: 8px;
        overflow: hidden;
    }

    .tab {
        flex: 1;
        text-align: center;
        padding: 8px 0;
        cursor: pointer;
        background-color: #efeaf7;
        transition: background-color 0.3s ease;
        color: #253c69;
    }

    .tab.active {
        background-color: #8e7cc3;
        color: white;
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

    .loading-container, .sending-container {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100px; /* Adjust this value as needed */
    }

</style>

<div class="container">
    {#if loading}
        <div class="loading-container">
            <Circle size="60" color="#8e7cc3" unit="px" duration="1s"/>
        </div>
    {:else}
        <div class="header">
            <div class="username">@{username}</div>
            <div class="balance">{balance} Ӿ</div>
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
                <span class="copy-icon" on:click={copyAddress}>
                    {copied ? '✓' : '📋'}
                </span>
            </div>

            <div class="qr-container">
                {#if showCheckmark}
                    <DotLottieSvelte
                            src="https://lottie.host/de25f9a2-04dc-4120-8c8f-73ae1cad7f7c/EeMbUDjUlX.json"
                            autoplay={true}
                            dotLottieRefCallback={(ref) => {
                            dotLottie = ref;
                            setupListeners(dotLottie);
                        }}
                    />
                {:else}
                    <SvgQR data={`nano:${nanoAddress}`} logo="favicon.png" shape="circle"/>
                {/if}
            </div>
        {:else}
            <input type="text" placeholder="Withdraw Amount" bind:value={amount}/>
            <input type="text" placeholder="Destination Nano Address" bind:value={withdrawAddress}/>

            {#if !sending}
                <button disabled={sending} on:click={handleWithdraw}>Withdraw Nano</button>
            {:else}
                <div class="sending-container">
                    <Circle color="#8e7cc3" size="30" unit="px" duration="1s"/>
                </div>
            {/if}
        {/if}
    {/if}
</div>