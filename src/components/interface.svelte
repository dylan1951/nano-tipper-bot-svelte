<script>
    // Example props, these would be populated dynamically
    export let balance = "0.00";
    export let nanoAddress = "nano_3youraddresshere";
    let withdrawAddress = "";
    let amount = "";

    function handleWithdraw() {
        // Add the logic to handle the withdrawal here
        if (withdrawAddress && amount) {
            console.log(`Withdrawing ${amount} Nano to ${withdrawAddress}`);
            // Implement the withdrawal logic here, e.g., API call
        } else {
            alert("Please enter a valid address and amount.");
        }
    }
</script>

<style>
    .container {
        max-width: 400px;
        margin: 0 auto;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        background-color: #f9f9f9;
        font-family: Arial, sans-serif;
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
        background-color: #eef2f5;
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
</style>

<div class="container">
    <div class="header">
        <h2>Nano Tipper</h2>
        <div class="balance">Balance: {balance} Nano</div>
    </div>

    <div class="nano-address">
        Your Nano Address:<br>
        {nanoAddress}
    </div>

    <input type="text" placeholder="Withdraw Amount" bind:value={amount} />
    <input type="text" placeholder="Destination Nano Address" bind:value={withdrawAddress} />

    <button on:click={handleWithdraw}>Withdraw Nano</button>
</div>