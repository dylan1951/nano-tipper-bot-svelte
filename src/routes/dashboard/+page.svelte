<script lang="ts">
    import {onMount, onDestroy} from "svelte";
    import {PUBLIC_BACK_END_HOST} from '$env/static/public';
    import {goto} from "$app/navigation";
    import {subscribeToBlockConfirmations, websocketInstance} from "$lib/websockets";
    import {convert, Unit} from "nanocurrency";

    import Header from './Header.svelte';
    import DepositTab from './DepositTab.svelte';
    import WithdrawTab from './WithdrawTab.svelte';
    import UnclaimedTips from './UnclaimedTips.svelte';
    import LoadingSpinner from './LoadingSpinner.svelte';

    type Tip = {
        from: {
            id: string;
            account: string;
            username: string;
        };
        hash: string;
        amount: string;
        date: string;
        tweetId: string;
    };

    let loading = true;
    let balance = "";
    let nanoAddress = "";
    let username = "";
    let unclaimedTips: Tip[] = [];
    let currentAction = 'deposit';
    let showUnclaimedTips = false;
    let balanceIncreased = false;

    onMount(async () => {
        await updateAccount();
        if (nanoAddress) {
            subscribeToBlockConfirmations(nanoAddress, receive, updateBalance);
        }
    });

    onDestroy(() => {
        if (websocketInstance) {
            websocketInstance.close();
        }
    });

    async function updateAccount() {
        const response = await fetch(`${PUBLIC_BACK_END_HOST}/account`, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("account", data.account);
            nanoAddress = data.account;
            balance = data.balance;
            username = data.username;
            unclaimedTips = data.unclaimedTips;
            if (parseFloat(data.receivable) > 0) {
                showUnclaimedTips = true;
            }
            loading = false;
        } else {
            console.error(response);
            if (response.status === 401) {
                localStorage.removeItem("account");
                await goto("/");
            }
        }
    }

    function receive(hash: string) {
        fetch(`${PUBLIC_BACK_END_HOST}/receive`, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({block: hash}),
            headers: {'Content-Type': 'application/json'}
        }).then(response => {
            if (response.ok) {
                console.log("Finished receiving block");
            }
        })
    }

    function updateBalance(newBalanceRaw: string) {
        const newBalance = convert(newBalanceRaw, {from: Unit.raw, to: Unit.Nano});
        if (parseFloat(newBalance) > parseFloat(balance)) {
            balanceIncreased = true;
            setTimeout(() => {
                balanceIncreased = false;
            }, 1000);
        }
        balance = newBalance;
    }

    function setCurrentAction(action: 'deposit' | 'withdraw') {
        currentAction = action;
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
        border: none;
        font-size: 1em;
    }

    .tab.active {
        background-color: #8e7cc3;
        color: white;
    }
</style>

<div class="container">
    {#if loading}
        <LoadingSpinner/>
    {:else}
        <Header {username} {balance} {balanceIncreased}/>

        {#if showUnclaimedTips}
            <UnclaimedTips {unclaimedTips} {nanoAddress} on:close={() => showUnclaimedTips = false} />
        {:else}
            <div class="tabs">
                <button
                        type="button"
                        class="tab"
                        class:active={currentAction === 'deposit'}
                        on:click={() => setCurrentAction('deposit')}
                >
                    Deposit
                </button>
                <button
                        type="button"
                        class="tab"
                        class:active={currentAction === 'withdraw'}
                        on:click={() => setCurrentAction('withdraw')}
                >
                    Withdraw
                </button>
            </div>

            {#if currentAction === "deposit"}
                <DepositTab {nanoAddress}/>
            {:else}
                <WithdrawTab/>
            {/if}
        {/if}
    {/if}
</div>