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
const volumeSlider = document.getElementById("volumeSlider");

// Array of media data

let mediaData = [];

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

        mediaData = response.data.data;
        console.log(mediaData);

        return response.data;
    }
}

const musicAPI = new API("https://deezerdevs-deezer.p.rapidapi.com");

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
            if (audio.src === songData.preview) {
                audio.src = "";
                audio.pause();
                audioButton.textContent = "Stop!";
            } else {
                audio.src = songData.preview;
                audio.load();
                audio.play();

                views.updateCurrentSongName(songData);

                audioButton.textContent = "Play!";
            }
        };

        cardWrapper.appendChild(audioButton);

        // Finally
        parent.appendChild(cardWrapper);
    }

    updateCurrentSongName(songData) {
        currentSongName.textContent = `${songData.title} (${getSongDuration(
            songData.duration
        )})`;
    }
}

const views = new Views();

async function renderSongsCards() {
    const searchValue = searchInput.value;

    const songsData = await musicAPI.searchSongByArtist(searchValue);

    songsCardsWrapper.innerHTML = "";

    songsData.data.forEach((songData) => {
        views.renderSongCard(songData, songsCardsWrapper);
    });

    searchInput.value = "";

    // console.log(songsData);
}

searchButton.onclick = renderSongsCards;

function getSongDuration(s) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setSeconds(s);

    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    return `${minutes}:${seconds}`;
}

function setVolume() {
    audio.volume = volumeSlider.value;
}

setVolume();

volumeSlider.addEventListener("input", setVolume);

// Завдання: реалізуйте управління плеєром
// Тільки кнопки: вперед, назад, стоп, старт

// Кнопки мають завантажувати наступну/попередню пісню

// Якщо пісень немає - кнопки ігнорують натискання

function mediaPlayer(currentMediaIndex = 0) {
    const mediaPlayerButtons = {
        playButton: document.getElementById("play-btn"),
        previousButton: document.getElementById("previous-btn"),
        nextButton: document.getElementById("next-btn"),
    };

    mediaPlayerButtons.playButton.onclick = () => {
        if (mediaData.length) {
            if (!audio.paused) {
                mediaPlayerButtons.playButton.src =
                    "./image/svg/mediaPlayerButtons/pauseButton.svg";
                audio.pause();
            } else {
                mediaPlayerButtons.playButton.src =
                    "./image/svg/mediaPlayerButtons/playButton.svg";
                audio.src = mediaData[currentMediaIndex].preview;
                audio.play();
                currentSongName.textContent = `${
                    mediaData[currentMediaIndex].title
                } (${getSongDuration(mediaData[currentMediaIndex].duration)})`;
            }
        }
    };

    mediaPlayerButtons.previousButton.onclick = () => {
        if (mediaData.length) {
            currentMediaIndex -= 1;
            audio.src = mediaData[currentMediaIndex].preview;
            audio.play();
            if (audio.played) {
                mediaPlayerButtons.playButton.src =
                    "./image/svg/mediaPlayerButtons/playButton.svg";
            }
            currentSongName.textContent = `${
                mediaData[currentMediaIndex].title
            } (${getSongDuration(mediaData[currentMediaIndex].duration)})`;
        }
    };
    mediaPlayerButtons.nextButton.onclick = () => {
        if (mediaData.length) {
            currentMediaIndex += 1;
            audio.src = mediaData[currentMediaIndex].preview;
            audio.play();
            if (audio.played) {
                mediaPlayerButtons.playButton.src =
                    "./image/svg/mediaPlayerButtons/playButton.svg";
            }
            currentSongName.textContent = `${
                mediaData[currentMediaIndex].title
            } (${getSongDuration(mediaData[currentMediaIndex].duration)})`;
        }
    };
}

mediaPlayer();
