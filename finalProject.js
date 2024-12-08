let songId = null;
let genreName = null;

// reset songs and display picked genre
function getSongsByGenre(genre){
    resetPage();
    url = "https://harmeets.sgedu.site/song.php?id=" + genre + "&?date=" + Date.now();
    updatePage(url,genre);
    currentIndex = 0;
}

async function getGenre(genre) {
    url = "https://harmeets.sgedu.site/getGenre.php?genreId=" + genre + "&date=" + Date.now();
    response = await fetch(url); 
    data = await response.text(); 
    return data;
}

async function uploadSong(id, genre) {
    songId = id;
    genreName = await getGenre(genre);
    overlay.style.display = 'block';
}

async function submitSong(){
    const token = localStorage.getItem('token');
    const rating = document.querySelector('input[name="rating"]:checked');
    
    if (rating) {

        const response = await fetch(`https://harmeets.sgedu.site/submitSong.php?random=${songId}&date=${Date.now()}`, {
            method: 'GET',
        });
        const data = await response.json();

        const title = data.title;
        const artist = data.artist.name;
        const album = data.album.title;
        const published = data.album.release_date;
        const cover = data.album.cover_medium;

        fetch("https://cs120-final-project.vercel.app/api/songs", {
            method: "POST", 
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                artist: artist,
                album: album,
                published: Number(published.slice(0,4)),
                genre: genreName,
                rating: rating.value,
                cover: cover
            }),
        })

        overlay.style.display = 'none';
    } else {
        alert('Please select a rating.');
    }
}

function updatePage(url,genre){
    fetch (url)
    .then(res => res.text())
    .then (data => 
    {
        let parsedData = JSON.parse(data);
        parsedData.data.forEach(song => {
            document.getElementById("songGrid1").insertAdjacentHTML("beforeend", "<div class='songLine'> <img src=' " + song.album.cover_medium + "'> <h3>" + song.title_short + "</h3> <p>" + song.artist.name + 
                "</p> <audio controls> <source src='" + song.preview + "' type='audio/mpeg'> </audio> <button id='likeButton' onclick='uploadSong(" + song.id + ", "+ genre+")'> &hearts; </button> </div>")
        });
        if (parsedData.prev) {
            document.getElementById("songPages").insertAdjacentHTML("beforeend", "<button class='pageCycle' onclick='goThere(0," + genre +")'> Previous </button>");
        }
        if (parsedData.next) {
            document.getElementById("songPages").insertAdjacentHTML("beforeend", "<button class='pageCycle' onclick='goThere(1," + genre +");'> Next </button>");
        }
    })
}

function resetPage(){
    while (document.getElementById("songGrid1").firstChild) {
        document.getElementById("songGrid1").removeChild(document.getElementById("songGrid1").firstChild);
    }
    while (document.getElementById("songPages").firstChild) {
        document.getElementById("songPages").removeChild(document.getElementById("songPages").firstChild);
    }
}

function goThere(direction, genre){
    url = "https://harmeets.sgedu.site/goThere.php?direction=" + direction + "&genre=" + genre + "&date=" + Date.now() + "&index=" + currentIndex;
    if (direction == 1){
        currentIndex = currentIndex + 12;
    }
    else {
        currentIndex = currentIndex - 12;
    }
    resetPage();
    updatePage(url,genre);
    
}