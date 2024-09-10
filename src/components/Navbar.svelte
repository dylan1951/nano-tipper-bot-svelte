<script lang="ts">
    import { page } from '$app/stores';
    import {PUBLIC_BACK_END_HOST} from "$env/static/public";

    let url: string;
    $: url = $page.url.pathname;

    let limit: number | undefined;
    let remaining: number | undefined;
    let localTime: string | undefined;

    async function fetchRateLimit() {
        try {
            const response = await fetch(`${PUBLIC_BACK_END_HOST}/rate-limit`, {
                method: 'GET'
            });

            // Check if response is ok and can be parsed as JSON
            if (response.ok) {
                const data = await response.json();

                // Check if data has the expected structure and values
                if (data && data.day && typeof data.day.limit === 'number' && typeof data.day.remaining === 'number' && typeof data.day.reset === 'number') {
                    limit = data.day.limit;
                    remaining = data.day.remaining;

                    // Convert the reset timestamp to local time
                    const resetDate = new Date(data.day.reset * 1000);
                    localTime = resetDate.toLocaleTimeString();
                }
            }
        } catch (error) {
            console.error("Error fetching rate limit:", error);
        }
    }

    // Fetch the rate limit data on component mount
    fetchRateLimit();
</script>

<nav>
    <ul>
        <li><a href="/tips" class:active={url === '/tips'}>Tips</a></li>
        <li><a href="/dashboard" class:active={url === '/dashboard'}>Account</a></li>
    </ul>
    <!-- Only display the message if limit, remaining, and localTime are defined -->
    {#if limit !== undefined && remaining !== undefined && localTime !== undefined}
        <div class="message">{limit-remaining}/{limit} tips today. Resets: {localTime}</div>
    {/if}
</nav>

<style>
    nav {
        background-color: #333;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
        display: flex;
        gap: 1rem;
    }

    li {
        display: inline;
    }

    a {
        color: white;
        text-decoration: none;
        font-weight: bold;
    }

    a:hover {
        text-decoration: underline;
    }

    .active {
        border-bottom: 2px solid white;
    }

    .message {
        color: white;
        font-weight: bold;
    }
</style>
