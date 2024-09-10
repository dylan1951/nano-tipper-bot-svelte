import {PUBLIC_WEBSOCKET_URL} from "$env/static/public";
import {convert, Unit} from "nanocurrency";

export let websocketInstance: WebSocket | null = null;

export async function subscribeToBlockConfirmations(account: string, callback: (amount: string) => void) {
    // Check if there's already an open WebSocket connection
    if (websocketInstance && websocketInstance.readyState === WebSocket.OPEN) {
        console.log("WebSocket connection is already open. Skipping new connection.");
        return;
    }

    const ws = new WebSocket(PUBLIC_WEBSOCKET_URL);
    websocketInstance = ws;  // Store the WebSocket instance

    ws.onerror = (error: Event) => {
        console.error("WebSocket error:", error);
    };

    ws.onopen = () => {
        ws.send(JSON.stringify({
            action: "subscribe",
            topic: "confirmation",
            options: { accounts: [account] }
        }));
    };

    ws.onmessage = (event: MessageEvent) => {  // Explicitly typed event
        const data = JSON.parse(event.data);
        console.log(data);

        // Check if subscription acknowledgment was received
        if (data.ack === "subscribe") {
            return;
        }

        // Ensure the message topic and block subtype are correct
        if (data.topic !== 'confirmation' || data.message.block.subtype !== 'send') {
            return;
        }

        // Call the provided callback if everything is valid
        callback(data.message.amount);
    };

    ws.onclose = () => {
        console.log("WebSocket connection closed.");
        websocketInstance = null;  // Reset the instance on close
    };
}
