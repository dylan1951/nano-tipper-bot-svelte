<script lang="ts">
    import { onMount } from 'svelte';
    import {goto} from "$app/navigation";

    import { PUBLIC_BACK_END_HOST } from '$env/static/public'

    onMount(async () => {
        if (localStorage.getItem('account')) {
            await goto("/dashboard");
        } else {
        }
    });

    function signIn() {
        window.location.href = `${PUBLIC_BACK_END_HOST}/authenticate`;
    }
</script>

<style>
    .container {
        max-width: 400px;
        margin: 20vh auto 0;
        padding: 20px;
        text-align: center;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        background-color: #f4f4f9;
        font-family: Arial, sans-serif;
    }

    h2 {
        margin-bottom: 10px;
        font-size: 1.5em;
        color: #333;
    }

    .message {
        margin-bottom: 20px;
        font-size: 1em;
        color: #555;
    }

    .sign-in-button {
        display: inline-block;
        background-color: #1da1f2;
        border-radius: 5px;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }

    .sign-in-button img {
        display: block;
        width: 100%;
        height: auto;
    }

    .sign-in-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }
</style>

<div class="container">
    <h2>Connect to Nano Tipper Bot</h2>
    <div class="message">
        Sign in with X to manage your @NanoTipperBot account
    </div>
    <button class="sign-in-button" on:click={signIn}>
        <img alt="Sign in with Twitter" src="https://cdn.cms-twdigitalassets.com/content/dam/developer-twitter/auth-docs/sign-in-with-twitter-gray.png.twimg.1920.png">
    </button>
</div>
