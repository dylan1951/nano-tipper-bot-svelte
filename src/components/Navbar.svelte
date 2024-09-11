<script lang="ts">
    import { page } from '$app/stores';
    import { PUBLIC_BACK_END_HOST } from "$env/static/public";
    import { onMount } from 'svelte';

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

            if (response.ok) {
                const data = await response.json();

                if (data && data.day && typeof data.day.limit === 'number' && typeof data.day.remaining === 'number' && typeof data.day.reset === 'number') {
                    limit = data.day.limit;
                    remaining = data.day.remaining;

                    const resetDate = new Date(data.day.reset * 1000);
                    localTime = resetDate.toLocaleTimeString();
                }
            }
        } catch (error) {
            console.error("Error fetching rate limit:", error);
        }
    }


    fetchRateLimit();

    onMount(() => {
        // Load Twitter widgets script
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        document.body.appendChild(script);
    });

    $: tipsPercentage = limit && remaining ? ((limit - remaining) / limit) * 100 : 0;
</script>

<nav>
    <ul class="nav-links">
        <li><a href="/tips" class:active={url === '/tips'}>Tips</a></li>
        <li><a href="/dashboard" class:active={url === '/dashboard'}>Account</a></li>
    </ul>

    <div class="right-section">
        {#if limit !== undefined && remaining !== undefined && localTime !== undefined}
            <div class="tips-progress" title="Tips used today">
                <div class="progress-bar" style="width: {tipsPercentage}%"></div>
                <span class="tips-text">{limit - remaining}/{limit}</span>
            </div>
        {/if}
        <a href="https://twitter.com/messages/compose?recipient_id=2529149599&ref_src=twsrc%5Etfw" class="twitter-dm-button" data-size="large" data-screen-name="dylan11951" data-show-count="false">Message @dylan11951</a>
        <a href="https://github.com/dylan1951/nano-tipper-bot" target="_blank" rel="noopener noreferrer" class="icon-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        </a>
    </div>
</nav>

<style>
    nav {
        background-color: #1e2f54;
        padding: 0.5rem 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .nav-links {
        list-style-type: none;
        margin: 0;
        padding: 0;
        display: flex;
        gap: 1rem;
    }

    .right-section {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    li {
        display: inline;
    }

    a {
        color: #f8f6ff;
        text-decoration: none;
        font-weight: 500;
        font-size: 1rem;
        transition: color 0.3s ease;
    }

    a:hover,
    .active {
        color: #8e7cc3;
    }

    .tips-progress {
        width: 80px;
        height: 26px;
        background-color: rgba(142, 124, 195, 0.2);
        border-radius: 12px;
        overflow: hidden;
        position: relative;
    }

    .progress-bar {
        height: 100%;
        background-color: #8e7cc3;
        transition: width 0.3s ease;
    }

    .tips-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #f8f6ff;
        font-size: 0.8rem;
        font-weight: 500;
        white-space: nowrap;
    }

    .icon-link {
        color: #f8f6ff;
        transition: color 0.3s ease;
    }

    .icon-link:hover {
        color: #8e7cc3;
    }

    :global(.twitter-dm-button) {
        vertical-align: middle;
    }

    @media (max-width: 768px) {
        nav {
            flex-wrap: wrap;
            justify-content: center;
            gap: 0.5rem;
        }

        .nav-links {
            width: 100%;
            justify-content: center;
        }

        .right-section {
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
        }

        .tips-progress {
            width: 80px;
        }

        .tips-text {
            font-size: 0.7rem;
        }
    }
</style>