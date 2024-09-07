<script lang="ts">
    import {onMount} from 'svelte';
    import {PUBLIC_BACK_END_HOST} from "$env/static/public";

    // Define the types for the response
    type Tip = {
        from: {
            id: string;
            account: string;
            username: string | null;
        };
        to: {
            id: string;
            account: string;
            username: string | null;
        };
        hash: string;
        amount: string;
        fromUserId: string;
        toUserId: string;
        date: string; // Make sure date is a string since it will be serialized as ISO in JSON
    };

    let tips: Tip[] = [];
    let errorMessage: string | null = null;

    // Fetch tips from the backend
    onMount(async () => {
        try {
            const response = await fetch(`${PUBLIC_BACK_END_HOST}/tips`);
            if (!response.ok) {
                throw new Error(`Failed to fetch tips: ${response.status}`);
            }
            tips = await response.json();
        } catch (error) {
            errorMessage = error.message;
        }
    });
</script>

<!-- Display the table of tips or error message if any -->
{#if errorMessage}
    <p class="error">{errorMessage}</p>
{:else if tips.length === 0}
    <p>No tips available.</p>
{:else}
    <table>
        <thead>
        <tr>
            <th>From</th>
            <th>To</th>
            <th>Amount (Nano)</th>
            <th>Date</th>
            <th>Transaction Hash</th>
        </tr>
        </thead>
        <tbody>
        {#each tips as tip}
            <tr>
                <td>{tip.from.username || tip.from.account}</td>
                <td>{tip.to.username || tip.to.account}</td>
                <td>{tip.amount}</td>
                <td>{new Date(tip.date).toLocaleString()}</td>
                <td>{tip.hash}</td>
            </tr>
        {/each}
        </tbody>
    </table>
{/if}

<style>
    /* Center the table horizontally */
    table {
        margin: 2rem auto;
        border-collapse: collapse;
        width: 80%; /* Adjust the width as needed */
        text-align: left;
        font-family: Arial, sans-serif;
    }

    th, td {
        padding: 1rem;
        border: 1px solid #ddd;
    }

    th {
        background-color: #f4f4f4;
        font-weight: bold;
    }

    tr:nth-child(odd) {
        background-color: #cccccc;
    }

    tr:nth-child(even) {
        background-color: #f9f9f9;
    }

    .error {
        color: red;
        text-align: center;
    }

    /* Make the page content centered */
    body {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }
</style>