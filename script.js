let currentSong = new Audio();
let songs;
let currFolder;

function convertSecondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    let result = minutes + ":" + (remainingSeconds / 60).toFixed(2).slice(1).replaceAll(".", "");

    return result;
}

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    //console.log(response)

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])//spliting the song name after the songs(word) 
        }

    }

    //show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
             
             <img class="invert" src="img/music.svg " alt="">
                         <div class="info">
                             <div>${song.replaceAll("%20", " ").replaceAll("%26", " ")}</div>
                         </div>
                         <div class="playnow">
                             Play Now
                             <img class="invert" src="img/playnow.svg" alt="">
 
                         </div>
                     </li>`;
    }

    //Attach and event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs;

}
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

async function displayAlbums() {
    console.log("displaying albums");
    let a = await fetch('/songs/'); // Adjust this if necessary
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").pop(); // Get the last segment of the URL
            let infoUrl = `${window.location.origin}/songs/${folder}/info.json`; // Use window.location.origin
            
            console.log(`Fetching: ${infoUrl}`); // Log the URL being fetched
            
            let infoResponse = await fetch(infoUrl);
            
            if (!infoResponse.ok) {
                console.error(`Failed to fetch ${infoUrl}: ${infoResponse.statusText}`);
                continue; // Skip this folder if the info.json cannot be fetched
            }
            
            let responseData = await infoResponse.json(); 
            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="/songs/${folder}/card.jpeg" alt="">
                    <h2>${responseData.title}</h2>
                    <p>${responseData.description}</p>
                </div>`;
        }
    }

    // Load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    await getSongs("songs/Sleepy")
    // console.log(songs)
    playMusic(songs[0], true)

    //Displaying all the albums dynamically on the page
    displayAlbums()


    //Attach an event listener for play,pause

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }

    })

    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime,currentSong.duration)
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutesSeconds(currentSong.currentTime)} 
        / ${convertSecondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //Add an event listener to seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //Add event listner for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //Add event listner for cross 
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    //Add event listener for previous
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    //Add event listner for next`   
    next.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length - 1) {
            playMusic(songs[index + 1])
        }
    })

    //Add event listner for the volume control
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })

    //Add event listner to mute the song
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;

        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentSong.volume = .50;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50;
        }

    })
}
main()
