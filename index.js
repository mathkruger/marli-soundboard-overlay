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
        onOpen: (sso) => {
            webSocket.send(JSON.stringify({ header: "sso", data: { ticket: sso } }));
            console.log("[Marli Soundboard] connection opened");
        },
        onClose: () => {
            console.log("[Marli Soundboard] connection closed");
        },
        onMessage: (message) => {
            const json = JSON.parse(message.data);
            executeSound(json.audioId);
        },
        onError: (e) => {
            console.log("[Marli Soundboard] websocket error!", e);
        }
    };

    const connectToWebSocket = (wsUrl, sso) => {
        const webSocket = new WebSocket(wsUrl);
        webSocket.onopen = () => { webSocketMethods.onOpen(sso) };
        webSocket.onclose = webSocketMethods.onClose;
        webSocket.onmessage = webSocketMethods.onMessage;
        webSocket.onerror = webSocketMethods.onError;
    };

    window.initMarliSoundboard = function (wsUrl, sso) {
        connectToWebSocket(wsUrl, sso);
    }
}