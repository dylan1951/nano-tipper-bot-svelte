<script lang="ts">
    export let username: string;
    export let balance: string;
    export let balanceIncreased: boolean;
</script>

<style>
    .header {
        text-align: center;
        margin-bottom: 15px;
    }
    .username {
        font-size: 1.2em;
        color: #333;
    }
    .balance {
        font-size: 2em;
        font-weight: bold;
        color: #8e7cc3;
        transition: all 0.3s ease;
    }
    .balance-increased {
        color: #4CAF50;
        transform: scale(1.3);
    }
</style>

<div class="header">
    <div class="username">@{username}</div>
    <div class="balance" class:balance-increased={balanceIncreased}>{balance} Ӿ</div>
</div>