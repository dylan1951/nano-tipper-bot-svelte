<script lang="ts">
    import { onMount } from 'svelte';
    import { PUBLIC_BACK_END_HOST } from "$env/static/public";

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
        date: string;
        tweetId: string;
        claimed?: boolean;
        refundHash?: string;
    };

    let tips: Tip[] = [];
    let errorMessage: string | null = null;
    let currentPage = 1;
    let pageSize = 10;
    let loading = false;
    let hasMore = true;

    async function fetchTips(page: number) {
        try {
            loading = true;
            const response = await fetch(`${PUBLIC_BACK_END_HOST}/tips?page=${page}&pageSize=${pageSize}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch tips: ${response.status}`);
            }
            const newTips = await response.json();
            if (newTips.length < pageSize) {
                hasMore = false;
            }
            tips = page === 1 ? newTips : [...tips, ...newTips];
            currentPage = page;
        } catch (error) {
            errorMessage = error.message;
        } finally {
            loading = false;
        }
    }

    function loadMore() {
        fetchTips(currentPage + 1);
    }

    onMount(() => {
        fetchTips(1);
    });

    function getTipStatus(tip: Tip): string {
        if (tip.refundHash) return 'Refunded';
        if (tip.claimed === true) return 'Claimed';
        if (tip.claimed === false) return 'Unclaimed';
        return 'Unknown';
    }

    function getStatusClass(status: string): string {
        switch (status) {
            case 'Claimed': return 'status-claimed';
            case 'Unclaimed': return 'status-unclaimed';
            case 'Refunded': return 'status-refunded';
            default: return 'status-unknown';
        }
    }
</script>

<main>
    <h2 style="color: white;">Unclaimed tips are refunded after 3 days</h2>
    {#if errorMessage}
        <p class="error">{errorMessage}</p>
    {:else if tips.length === 0 && !loading}
        <p class="no-tips">No tips available.</p>
    {:else}
        <div class="table-container">
            <table>
                <thead>
                <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Transaction</th>
                    <th>Post</th>
                </tr>
                </thead>
                <tbody>
                {#each tips as tip}
                    <tr>
                        <td data-label="From">
                            {#if tip.from.username}
                                <a href={`https://x.com/${tip.from.username}`} target="_blank" rel="noopener noreferrer">
                                    @{tip.from.username}
                                </a>
                            {:else}
                                {tip.from.account}
                            {/if}
                        </td>
                        <td data-label="To">
                            {#if tip.to.username}
                                <a href={`https://x.com/${tip.to.username}`} target="_blank" rel="noopener noreferrer">
                                    @{tip.to.username}
                                </a>
                            {:else}
                                {tip.to.account}
                            {/if}
                        </td>
                        <td data-label="Amount">{tip.amount} Ӿ</td>
                        <td data-label="Date">{new Date(tip.date).toLocaleString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</td>
                        <td data-label="Status">
                            <span class={`status ${getStatusClass(getTipStatus(tip))}`}>
                                {getTipStatus(tip)}
                            </span>
                        </td>
                        <td data-label="Hash">
                            <a href={`https://nanexplorer.com/all/block/${tip.hash}`} target="_blank" rel="noopener noreferrer">
                                {tip.hash.substring(0, 10)}...
                            </a>
                        </td>
                        <td data-label="Post">
                            <a href={`https://x.com/i/web/status/${tip.tweetId}`} target="_blank" rel="noopener noreferrer" class="tweet-link">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-twitter-x" viewBox="0 0 16 16">
                                    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
                                </svg>
                            </a>
                        </td>
                    </tr>
                {/each}
                </tbody>
            </table>
        </div>
        {#if hasMore}
            <button class="load-more" on:click={loadMore} disabled={loading}>
                {loading ? 'Loading...' : 'Load More'}
            </button>
        {/if}
    {/if}
</main>


<style>
    main {
        max-width: 1100px;
        padding: 20px;
        margin: 3vh auto 0;
        text-align: center;
    }

    h1 {
        text-align: center;
        color: #2c3e50;
        margin-bottom: 30px;
    }

    .table-container {
        width: 100%;
        overflow-x: auto;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    table {
        width: 100%;
        table-layout: auto; /* Adjust column widths based on content */
        border-collapse: separate;
        border-spacing: 0;
    }

    th, td {
        padding: 12px 15px;
        text-align: left;
    }

    th {
        background-color: #34495e;
        color: white;
        font-weight: bold;
        text-transform: uppercase;
    }

    tr:nth-child(even) {
        background-color: #f8f9fa;
    }

    tr:nth-child(odd) {
        background-color: #ffffff;
    }

    tr:hover {
        background-color: #e9ecef;
    }

    .error, .no-tips {
        text-align: center;
        padding: 20px;
        background-color: #e74c3c;
        color: white;
        border-radius: 8px;
        margin-top: 20px;
    }

    .no-tips {
        background-color: #3498db;
    }

    .load-more {
        display: block;
        margin: 20px auto;
        padding: 10px 20px;
        background-color: #3498db;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 16px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .load-more:hover {
        background-color: #2980b9;
    }

    .load-more:disabled {
        background-color: #bdc3c7;
        cursor: not-allowed;
    }

    a {
        color: #3498db;
        text-decoration: none;
        transition: color 0.3s ease;
    }

    a:hover {
        color: #2980b9;
        text-decoration: underline;
    }

    .status {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8em;
        font-weight: bold;
        text-transform: uppercase;
    }

    .status-claimed {
        background-color: #2ecc71;
        color: white;
    }

    .status-unclaimed {
        background-color: #f39c12;
        color: white;
    }

    .status-refunded {
        background-color: #e74c3c;
        color: white;
    }

    .status-unknown {
        background-color: #95a5a6;
        color: white;
    }

    @media screen and (max-width: 1000px) {
        .table-container {
            box-shadow: none;
            background-color: transparent;
        }

        table {
            border: 0;
        }

        table thead {
            border: none;
            clip: rect(0 0 0 0);
            height: 1px;
            margin: -1px;
            overflow: hidden;
            padding: 0;
            position: absolute;
            width: 1px;
        }

        table tr {
            border-bottom: 3px solid #ddd;
            display: block;
            margin-bottom: .625em;
            background-color: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }

        table td {
            border-bottom: 1px solid #ddd;
            display: block;
            font-size: .8em;
            text-align: right;
            padding: 10px;
        }

        table td::before {
            content: attr(data-label);
            float: left;
            font-weight: bold;
            text-transform: uppercase;
        }

        table td:last-child {
            border-bottom: 0;
        }

        .status {
            display: inline-block;
            margin-top: 5px;
        }
    }
</style>