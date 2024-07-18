console.log("Spotify clone- Made by Priyanshu Choudhary");
// window.history.pushState(null, null, "/home")//to force the url to change.
let currentsong = new Audio();
let currentfolder;
let songs;

async function getSongs(folder) {
    currentfolder = folder
    let a = await fetch(`/songs/${folder}/`);
    //TODO  this fetch is used to get data from a server
    let response = await a.text();
    //todo this .text function converts the object to text format.

    let div = document.createElement("div");
    div.innerHTML = response;

    //todo this anchortags variable gets all the anchor tags of songs in a html collection
    let anchortags = div.getElementsByTagName("a");

    songs = [];
    for (let i = 0; i < anchortags.length; i++) {
        const element = anchortags[i];
        //todo function to check all the href in anchor tags which ends with .mp3
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href);
        }
    }

    //todo- to get and display all the songs in the playlist, we get from getsong function
    let songUl = document
        .querySelector(".songslist")
        .getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
    for (const song of songs) {
        //todo- this temp splits the element in two parts then takes the main song part and replace the '%20' with space and '.mp3' with no-space.
        let temp = song
            .split(`songs/${currentfolder}/`)[1]
            .replaceAll("%20", " ")
            .replace(".mp3", "");
        songUl.innerHTML =
            songUl.innerHTML +
            `<li class="flex music-player-leftContainer">
            <img class="invert-img image-width" src="images/songlist-music.svg" alt="">

            <div class="song-container flex">
             <div class="songname">${temp}</div>
            </div>
            <i class="fa-solid fa-play" style="color: #ffffff;"></i>
         </li>`;
    }

    //todo attach an event listener to play music
    Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            //to set the track back to 0 when even song changes
            document.querySelector(".circle").style.left = "0%";
            playmusic(e.querySelector(".song-container").firstElementChild.innerHTML + ".mp3");

            const container = document.querySelectorAll(".music-player-leftContainer");
            container.forEach(e => {
                e.lastElementChild.outerHTML = '<i class="fa-solid fa-play style="color: #ffffff;""></i>'
            })

            //todo to only set the icon of the current song to play
            e.querySelector(".song-container").parentElement.lastElementChild.setAttribute("class", "fa-solid fa-pause");
            play.src = "images/pause-button.svg";
        })

    });
    return songs;
}

function playmusic(track) {

    currentsong.src = `/songs/${currentfolder}/` + track;
    currentsong.play();
    document.getElementById("songNameDisplay").innerHTML = track
}

function convertSeconds(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.ceil(seconds % 60);

    // Add leading zero to seconds if less than 10
    const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

    return `${minutes} : ${formattedSeconds}`;
}

async function displayCard() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer")
    let array = Array.from(anchors)
    //for loop is used so that the function do not run in background 
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folders = e.href.split("/songs/")[1]
            let a = await fetch(`/songs/${folders}/info.json`);
            let response = await a.json();
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-clickedsong="${folders}" class="card rounded-border grey-background">
            <div class="playbutton">
              <svg class="playbuttonArrow" width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <polygon points="30,20 30,80 80,50" fill="black"/></svg>
            </div>
            <img class="rounded-border margin-bottom" src="songs/${folders}/cover.jpg" alt="some error occured">
            <h5 class="margin-bottom">${response.title}</h5>
            <p class="margin-bottom">${response.description}</p>
          </div>`
        }
    }

    //todo- to get the song card name whenever clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`${item.currentTarget.dataset.clickedsong}`);
            let playByDefault = songs[0].split(`/songs/${currentfolder}/`)[1].replaceAll("%20", " ");
            playmusic(playByDefault);
            document.querySelector(".song-container").parentElement.lastElementChild.setAttribute("class", "fa-solid fa-pause");
            play.src = "images/pause-button.svg";
        })
    })

}

(async function main() {
    // todo since this songs returns a promise instead of an array , therefore it has to be wrapped in a main function of async and await
    songs = await getSongs("hindi");

    //todo- function to make folders songs playlist folder in background
    displayCard();

    //todo-  to play the first song by default 
    let playByDefault = songs[0].split(`/songs/${currentfolder}/`)[1].replaceAll("%20", " ");
    playmusic(playByDefault);
    currentsong.pause();

    //todo- to attach an event listener for play pause button
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "images/pause-button.svg";
        }
        else {
            currentsong.pause();
            play.src = "images/PlayPause-song.svg";
        }
    });

    //to update current song time
    currentsong.addEventListener("timeupdate", () => {
        document.getElementById("songDuration").innerHTML = `${convertSeconds(currentsong.currentTime)} / ${convertSeconds(currentsong.duration)}`;
        //to update the seek bar as the time updates
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

    //to update the seek bar when user slides it
    document.querySelector(".trackbar").addEventListener("click", e => {
        let percentageTrackbar = e.offsetX / e.target.getBoundingClientRect().width * 100
        document.querySelector(".circle").style.left = (percentageTrackbar + '%');
        //to update the current time of the song being played.
        currentsong.currentTime = percentageTrackbar * currentsong.duration / 100;
    })

    //todo - onclick event to open hamburger menu
    hamburger.addEventListener("click", () => {
        document.querySelector(".leftcontainer").style.left = "0"
    })
    //todo- onclick event to close hamburger menu
    closebutton.addEventListener("click", () => {
        document.querySelector(".leftcontainer").style.left = "-90%"
    })

    //todo- event listener for previous song
    previous.addEventListener("click", () => {
        let previousSong = songs.indexOf(currentsong.src.replace(" ", ""))
        if (previousSong > 0) {
            playmusic(songs[previousSong - 1].split(`/songs/${currentfolder}/`)[1].replaceAll("%20", " "));
        }

    })

    //todo- event listener for next song
    next.addEventListener("click", () => {
        let nextSong = songs.indexOf(currentsong.src.replace(" ", ""))
        if (nextSong < songs.length) {
            playmusic(songs[nextSong + 1].split(`/songs/${currentfolder}/`)[1].replaceAll("%20", " "));
        }

    })
    //todo - function to set the volume range 
    document.getElementById("volumehover").addEventListener("change", e => {
        currentsong.volume = (parseInt(e.target.value) / 100)
        //to change the images when volume is muted or not
        if ((currentsong.volume * 100) == 0) {
            document.querySelector(".volumeRange").getElementsByTagName("img")[0].src = "images/mute.svg"
        }
        else {
            document.querySelector(".volumeRange").getElementsByTagName("img")[0].src = "images/volume.svg"
        }
    });

    //todo -add event listener for mute
    let clickcount = 0;
    document.querySelector(".volume").addEventListener("click", () => {
        clickcount++;
        if (clickcount == 1) {
            document.querySelector(".volumeRange").getElementsByTagName("img")[0].src = "images/mute.svg";
            currentsong.volume = 0;
            document.querySelector("#volumehover").value = 0
        }
        else if (clickcount == 2) {
            document.querySelector(".volumeRange").getElementsByTagName("img")[0].src = "images/volume.svg";
            currentsong.volume = 50 / 100;
            document.querySelector("#volumehover").value = 50
            clickcount = 0;
        }
    })



})();
