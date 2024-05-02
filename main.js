// API

const artistInterface = {
    id: 0,
    name: "",
    link: "",
    picture: "",
    picture_small: "",
    picture_medium: "",
    picture_big: "",
    picture_xl: "",
    tracklist: "",
    type: "",
};

const albumInterface = {
    id: 0,
    title: "",
    cover: "",
    cover_small: "",
    cover_medium: "",
    cover_big: "",
    cover_xl: "",
    md5_image: "",
    tracklist: "",
    type: "",
};

const songInterface = {
    id: 0,
    readable: true,
    title: "",
    title_short: "",
    title_version: "",
    link: "",
    duration: 0,
    rank: 0,
    explicit_lyrics: true,
    explicit_content_lyrics: 0,
    explicit_content_cover: 0,
    preview: "",
    md5_image: "",
    artist: artistInterface,
    album: albumInterface,
};

// Elements

const audio = document.querySelector("audio");
const searchInput = document.querySelector("#search-input");
const searchButton = document.querySelector("#search-button");
const songsCardsWrapper = document.querySelector(".music-cards-wrapper");
const currentSongName = document.querySelector("#current-song-name");
const positionPlayerControlls = document.querySelector(".player-controlls");
const responsiveCurrentSongName = document.querySelector(
    "#responsive-current-song-name"
);
const volumeSlider = document.getElementById("volumeSlider");

const mediaPlayerButtons = {
    playButton: document.getElementById("play-btn"),
    previousButton: document.getElementById("previous-btn"),
    nextButton: document.getElementById("next-btn"),
};

// Array of media data

let songs = [];
// let currentMediaIndex = 0;

// API

class API {
    constructor(
        baseUrl = "",
        options = {
            headers: {
                "X-RapidAPI-Key":
                    "9ebb47f7c6mshfe8c805d52bddacp1f9a17jsnd085d3940efd",
                "X-RapidAPI-Host": "deezerdevs-deezer.p.rapidapi.com",
            },
        }
    ) {
        this.baseUrl = baseUrl;
        this.options = options;
    }

    async searchSongByArtist(artist) {
        const response = await axios({
            method: "GET",
            url: `${this.baseUrl}/search`,
            params: { q: artist },
            headers: this.options.headers,
        });

        songs = response.data.data;

        return response.data;
    }
}

const musicAPI = new API("https://deezerdevs-deezer.p.rapidapi.com");
musicAPI.searchSongByArtist("");

class Views {
    renderSongCard(songData = songInterface, parent) {
        const cardWrapper = document.createElement("div");
        cardWrapper.className = "song-card";

        // Image
        const cardImage = document.createElement("img");
        cardImage.className = "song-image";
        cardImage.src = songData.artist.picture_medium;

        cardWrapper.appendChild(cardImage);

        // Title
        const cardTitle = document.createElement("h3");
        cardTitle.textContent = songData.title;

        cardWrapper.appendChild(cardTitle);

        // Description
        const cardDescription = document.createElement("article");
        cardDescription.innerHTML = `
            <p>Duration: ${getSongDuration(songData.duration)}</p>
            <p>Artist: ${songData.artist.name}</p>
            <p>Link: ${songData.link}</p>
        `;

        cardWrapper.appendChild(cardDescription);

        // AudioButton
        const audioButton = document.createElement("button");
        audioButton.textContent = "Play";
        audioButton.className = "audio-button";

        audioButton.onclick = () => {
            audio.src = songData.preview;
            audio.load();

            Player.controlls.play.classList.replace("fa-play", "fa-pause");
            mediaPlayerButtons.playButton.src =
                "./image/svg/mediaPlayerButtons/pauseButton.svg";
            audio.play();

            views.updateCurrentSongName(songData);
        };

        cardWrapper.appendChild(audioButton);

        // Finally
        parent.appendChild(cardWrapper);
    }

    updateCurrentSongName(songData) {
        if (innerWidth < 450) {
            responsiveCurrentSongName.textContent = `${
                songData.title
            } (${getSongDuration(songData.duration)})`;
        } else {
            currentSongName.textContent = `${songData.title} (${getSongDuration(
                songData.duration
            )})`;
        }
    }
}

const views = new Views();

class SearchHistory {
    getHistory() {
        return JSON.parse(localStorage.getItem("history") || "[]");
    }

    addToHistory(request) {
        let history = this.getHistory();

        if (history.includes(request)) {
            history = history.filter((prevRequest) => prevRequest !== request);
        }

        history.push(request.toLowerCase());

        localStorage.setItem("history", JSON.stringify(history)); 
    }

    renderHistryBySearch() {
        const searchFromHistoryByName = document.getElementById(
            "search-from-history-by-name"
        );

        searchFromHistoryByName.innerHTML = "";

        const getHistory = this.getHistory();

        let maxButtonsToShow = 0;

        innerWidth < 450 ? maxButtonsToShow = 3 : maxButtonsToShow = 6;
 
        // Перемещаем последние выбранные элементы в конец массива
        // const newHistory = Array.from(new Set(history));
        // localStorage.setItem("history", JSON.stringify(newHistory));
        const lastTitles = getHistory.slice(-maxButtonsToShow);
        const newLastTitle = Array.from(new Set(lastTitles));
        // console.log(lastTitles);
        // lastTitles.map((title) => {
        //     const index = getHistory.indexOf(title);
        //     if (index !== -1) {
        //         getHistory.splice(index, 1);
        //         getHistory.push(title);
        //     }

        //     return lastTitles;
        // });

        newLastTitle.forEach((title) => {
            const buttonSearchByHistory = createButton(title);
            searchFromHistoryByName.appendChild(buttonSearchByHistory);
        });

        function createButton(songTitle) {
            const buttonSearchByHistory = document.createElement("button");
            buttonSearchByHistory.className = "button-search-by-history";
            buttonSearchByHistory.textContent = songTitle.toLowerCase();

            async function searchByHistory() {
                const searchValue = songTitle;
                const historySongsTitleData = await musicAPI.searchSongByArtist(
                    searchValue
                );
                console.log(historySongsTitleData);

                songsCardsWrapper.innerHTML = "";

                historySongsTitleData.data.forEach((songData) => {
                    views.renderSongCard(songData, songsCardsWrapper);
                });
            }

            buttonSearchByHistory.onclick = searchByHistory;

            return buttonSearchByHistory;
        }
    }
}

const seachHistory = new SearchHistory();

async function renderSongsCards() {
    if (searchInput.value === "") {
        console.log("search cannot be empty");
    } else {
        const searchValue = searchInput.value;

        seachHistory.addToHistory(searchInput.value);

        const songsData = await musicAPI.searchSongByArtist(searchValue);

        songsCardsWrapper.innerHTML = "";

        songsData.data.forEach((songData) => {
            views.renderSongCard(songData, songsCardsWrapper);
        });

        searchInput.value = "";
    }

    // console.log(songsData);
}

searchButton.onclick = () => {
    renderSongsCards();
    if (searchInput.value === "") {
        console.log("search cannot be empty");
    } else {
        seachHistory.renderHistryBySearch();
    }
};

function normalizeTimeValue(timeValue) {
    return timeValue.length === 2 ? timeValue : `0${timeValue}`;
}

function getSongDuration(s) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setSeconds(s);

    const minutes = normalizeTimeValue(`${date.getMinutes()}`);
    const seconds = normalizeTimeValue(`${date.getSeconds()}`);

    return `${minutes}:${seconds}`;
}

function setVolume() {
    audio.volume = volumeSlider.value;
}

// Устанавливаем громкость в начальное значение при загрузке страницы
setVolume();

// Обрабатываем событие изменения положения ползунка
volumeSlider.addEventListener("input", setVolume);

// Player

// Player Buttons

class Player {
    static controlls = {
        prev: document.getElementById("prev-song-button"),
        play: document.getElementById("play-stop-button"),
        next: document.getElementById("next-song-button"),
        progress: document.getElementById("player-progress"),
        progresTimer: document.getElementById("player-progress-time"),
    };

    constructor(
        mediaPlayerButtons,
        parentSongName,
        responsiveParentSongName,
        currentSongIndex = 0
    ) {
        this.currentSongIndex = currentSongIndex;
        this.mediaPlayerButtons = mediaPlayerButtons;
        this.parentSongName = parentSongName;
        this.responsiveParentSongName = responsiveParentSongName;

        Player.controlls.next.onclick = () => {
            this.nextSong();
        };

        Player.controlls.prev.onclick = () => {
            this.prevSong();
        };

        Player.controlls.play.onclick = () => {
            if (!audio.paused) {
                this.stop();
            } else {
                audio.src = songs[this.currentSongIndex].preview;
                if (innerWidth < 450) {
                    this.responsiveParentSongName.textContent = `${
                        songs[this.currentSongIndex].title
                    } (${getSongDuration(songs[this.currentSongIndex].duration)})`;
                } else {
                    this.parentSongName.textContent = `${
                        songs[this.currentSongIndex].title
                    } (${getSongDuration(songs[this.currentSongIndex].duration)})`;
                }
                this.play();
            }
        };

        Player.controlls.progress.oninput = () => {
            audio.currentTime = +Player.controlls.progress.value;
        };

        audio.ontimeupdate = () => {
            Player.controlls.progress.value = audio.currentTime;
            Player.controlls.progresTimer.textContent = getSongDuration(
                audio.currentTime
            );
        };
    }

    stop() {
        Player.controlls.play.classList.replace("fa-pause", "fa-play");
        this.mediaPlayerButtons.playButton.src =
            "./image/svg/mediaPlayerButtons/playButton.svg";
        audio.pause();
    }
    play() {
        Player.controlls.play.classList.replace("fa-play", "fa-pause");
        this.mediaPlayerButtons.playButton.src =
            "./image/svg/mediaPlayerButtons/pauseButton.svg";
        Player.controlls.progress.max = songs[this.currentSongIndex].duration;
        audio.play();
    }
    prevSong() {
        if (songs.length) {
            Player.controlls.progress.value = 0;
            this.currentSongIndex -= 1;
            audio.src =
                songs[this.currentSongIndex]?.preview || songs[0].preview;
            this.play();

            if (innerWidth < 450) {
                this.responsiveParentSongName.textContent = `${
                    songs[this.currentSongIndex].title
                } (${getSongDuration(songs[this.currentSongIndex].duration)})`;
            } else {
                this.parentSongName.textContent = `${
                    songs[this.currentSongIndex].title
                } (${getSongDuration(songs[this.currentSongIndex].duration)})`;
            }
        }
    }
    nextSong() {
        if (songs.length) {
            Player.controlls.progress.value = 0;
            this.currentSongIndex += 1;
            audio.src =
                songs[this.currentSongIndex]?.preview || songs[0].preview;
            this.play();

            if (innerWidth < 450) {
                this.responsiveParentSongName.textContent = `${
                    songs[this.currentSongIndex].title
                } (${getSongDuration(songs[this.currentSongIndex].duration)})`;
            } else {
                this.parentSongName.textContent = `${
                    songs[this.currentSongIndex].title
                } (${getSongDuration(songs[this.currentSongIndex].duration)})`;
            }
        }
    }
}

const player = new Player(
    mediaPlayerButtons,
    currentSongName,
    responsiveCurrentSongName
);

function mediaPlayer(currentMediaIndex = 0) {
    mediaPlayerButtons.playButton.onclick = () => {
        if (songs.length) {
            if (!audio.paused) {
                mediaPlayerButtons.playButton.src =
                    "./image/svg/mediaPlayerButtons/playButton.svg";
                Player.controlls.play.classList.replace("fa-pause", "fa-play");
                audio.pause();
            } else {
                mediaPlayerButtons.playButton.src =
                    "./image/svg/mediaPlayerButtons/pauseButton.svg";
                Player.controlls.play.classList.replace("fa-play", "fa-pause");
                audio.src = songs[currentMediaIndex].preview;
                audio.play();
                if (innerWidth < 450) {
                    responsiveCurrentSongName.textContent = `${
                        songs[currentMediaIndex].title
                    } (${getSongDuration(songs[currentMediaIndex].duration)})`;
                } else {
                    currentSongName.textContent = `${
                        songs[currentMediaIndex].title
                    } (${getSongDuration(songs[currentMediaIndex].duration)})`;
                }
            }
        }
    };

    mediaPlayerButtons.previousButton.onclick = () => {
        if (songs.length) {
            currentMediaIndex -= 1;
            audio.src = songs[currentMediaIndex].preview;
            if (!audio.paused) {
                mediaPlayerButtons.playButton.src =
                    "./image/svg/mediaPlayerButtons/playButton.svg";
                Player.controlls.play.classList.replace("fa-pause", "fa-play");
            }
            audio.play();
            if (innerWidth < 450) {
                responsiveCurrentSongName.textContent = `${
                    songs[currentMediaIndex].title
                } (${getSongDuration(songs[currentMediaIndex].duration)})`;
            } else {
                currentSongName.textContent = `${
                    songs[currentMediaIndex].title
                } (${getSongDuration(songs[currentMediaIndex].duration)})`;
            }
        }
    };
    mediaPlayerButtons.nextButton.onclick = () => {
        if (songs.length) {
            currentMediaIndex += 1;
            audio.src = songs[currentMediaIndex].preview;
            if (!audio.paused) {
                mediaPlayerButtons.playButton.src =
                    "./image/svg/mediaPlayerButtons/playButton.svg";
                Player.controlls.play.classList.replace("fa-pause", "fa-play");
            }
            audio.play();
            if (innerWidth < 450) {
                responsiveCurrentSongName.textContent = `${
                    songs[currentMediaIndex].title
                } (${getSongDuration(songs[currentMediaIndex].duration)})`;
            } else {
                currentSongName.textContent = `${
                    songs[currentMediaIndex].title
                } (${getSongDuration(songs[currentMediaIndex].duration)})`;
            }

        }
    };
}

mediaPlayer();
