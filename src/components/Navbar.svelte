<script lang="ts">
    import { page } from '$app/stores';

    let url: string;
    $: url = $page.url.pathname;
</script>

<nav>
    <ul>
        <li><a href="/tips" class:active={url === '/tips'}>Tips</a></li>
        <li><a href="/dashboard" class:active={url === '/dashboard'}>Account</a></li>
    </ul>
</nav>

<style>
    nav {
        background-color: #333;
        padding: 1rem;
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
</style>
