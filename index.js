window.onload = function () {
    let audio = null;

    const executeSound = (soundName) => {
        if (audio === null) {
            audio = new Audio(`sounds/${soundName}.mp3`);
            audio.play();
            audio.addEventListener("ended", () => {
                audio = null;
            });
        }
    }

    const webSocketMethods = {
        onOpen = () => {
            console.log("[Marli Soundboard] connection opened");
        },
        onClose = () => {
            console.log("[Marli Soundboard] connection closed");
        },
        onMessage = (message) => {
            const json = JSON.parse(message.data);
            executeSound(json.audioId);
        },
        onError = () => {
            console.log("[Marli Soundboard] websocket error!");
        }
    };

    const connectToWebSocket = (wsUrl) => {
        const webSocket = new WebSocket(wsUrl);
        webSocket.onopen = webSocketMethods.onOpen;
        webSocket.onclose = webSocketMethods.onClose;
        webSocket.onmessage = webSocketMethods.onMessage;
        webSocket.onerror = webSocketMethods.onError;
    };

    window.initMarliSoundboard = function (wsUrl) {
        connectToWebSocket(wsUrl);
    }
}