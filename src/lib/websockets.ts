import {PUBLIC_WEBSOCKET_URL} from "$env/static/public";
import {convert, Unit} from "nanocurrency";

export let websocketInstance: WebSocket | null = null;

export async function subscribeToBlockConfirmations(account: string, receive: (hash: string) => void, updateBalance: (balance: string) => void) {
    // Check if there's already an open WebSocket connection
    if (websocketInstance && websocketInstance.readyState === WebSocket.OPEN) {
        console.log("WebSocket connection is already open. Skipping new connection.");
        return;
    }

    const ws = new WebSocket(PUBLIC_WEBSOCKET_URL);
    websocketInstance = ws;

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

    ws.onmessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        console.log(data);

        if (data.ack === "subscribe" || data.topic !== 'confirmation') {
            return;
        }

        if (data.message.block.subtype === 'send' && data.message.account != account) {
            receive(data.message.hash);
        } else if (data.message.block.subtype === 'send' && data.message.account === account) {
            updateBalance(data.message.block.balance);
        } else if (data.message.block.subtype === 'receive' && data.message.account == account) {
            updateBalance(data.message.block.balance);
        }

    };

    ws.onclose = () => {
        console.log("WebSocket connection closed.");
        websocketInstance = null;  // Reset the instance on close
    };
}
