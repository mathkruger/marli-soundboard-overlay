const listenToWebSocket = (fn) => {
    let property = Object.getOwnPropertyDescriptor(MessageEvent.prototype, "data");
    const data = property.get;

    function lookAtMessage() {
        let socket = this.currentTarget instanceof WebSocket;

        if (!socket) {
            return data.call(this);
        }

        let msg = data.call(this);

        Object.defineProperty(this, "data", { value: msg });
        fn({ data: msg, socket: this.currentTarget, event: this });
        return msg;
    }

    property.get = lookAtMessage;
    Object.defineProperty(MessageEvent.prototype, "data", property);
};

const parseMessage = (message) => {
    if (message.indexOf("habblet/open/") > -1) {
        const jsonText = message.split("habblet/open/")[1];
        
        if (jsonText) {
            const json = JSON.parse(jsonText);
            if (json.header === "marli_audio_play") {
                executeSound(json.data.audioId);
            }
        }
    }
};

const executeSound = (soundName) => {
    let audio = document.querySelector("#app");

    if (audio.children.length === 0) {
        audio.innerHTML += `<audio autoplay><source src="sounds/${soundName}.mp3"></audio>`;
        
        audio.querySelector("audio").addEventListener("ended", () => {
            audio.innerHTML = '';
        });
    }
};

window.initMarliSoundboard = function () {
    listenToWebSocket(({ data }) => {
        data.text().then(text => {
            parseMessage(text);
        });
    });
};
