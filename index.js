const SONGS = {
    amor: "O Amor está no Ar",
    cachaca: "Cachaça",
    bertulina: "Bertulina"
};

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
            if (json.header === "marli_audio") {
                switch(json.data.command) {
                    case "tocar":
                        executeSound(json.data.argument);
                    break;

                    case "parar":
                        stopSound();
                    break;

                    case "pausar":
                        pauseSound();
                    break;
                }
            }
        }
    }
};

const executeSound = (soundName) => {
    let audio = document.querySelector("#marli-soundboard-container .player");

    if (soundName == null) {
        audio.querySelector("audio").play();
    }
    else {
        audio.innerHTML = '';
    
        audio.innerHTML += `<audio autoplay><source src="marli-soundboard-overlay/sounds/${soundName}.mp3"></audio>`;
        
        setVolume(audio.parentElement.querySelector("input.volume-control").value);
        audio.querySelector("audio").play();
        
        audio.parentElement.querySelector(".player-information").innerHTML = `
            <p>Tocando Agora: <strong>${SONGS[soundName]}</strong></p>
        `;
        
        audio.querySelector("audio").addEventListener("ended", () => {
            audio.innerHTML = '';
        });
    
        audio.parentElement.setAttribute("style", "");
    }
};

const stopSound = () => {
    let audio = document.querySelector("#marli-soundboard-container .player");
    audio.innerHTML = '';

    audio.parentElement.setAttribute("style", "display: none");
    audio.parentElement.querySelector(".player-information").innerHTML = "";
};

const pauseSound = () => {
    const player = document.querySelector("#marli-soundboard-container .player audio");
    player.pause();
};

const setVolume = (volume) => {
    const player = document.querySelector("#marli-soundboard-container .player audio");
    player.volume = volume;
};

const createContainers = () => {
    const app = document.querySelector("#marli-soundboard-container");
    app.innerHTML += `<div class="player"></div>`;
    app.innerHTML += `<div class="player-information"></div>`;
    app.innerHTML += `<div class="player-volume">
        Volume: <br/>
        <input class="volume-control" onchange="setVolume(this.value)" value="1" type="range" min="0" max="1" step="0.1" />
    </div>`;

    app.setAttribute("style", "display: none");
}

window.initMarliSoundboard = function () {
    createContainers();

    listenToWebSocket(({ data }) => {
        data.text().then(text => {
            parseMessage(text);
        });
    });
};
