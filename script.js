let audio = new Audio();
let currentIndex = 0;
let isPlaying = false;

const playBtn = document.getElementById('playBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const volumeSlider = document.getElementById('volume');
const timeline = document.getElementById('timeline');
const waveform = document.getElementById('waveform');

const songs = [
  {
    title: "Finding Her",
    artist: "Bharath, Kushagra, Saaheal",
    audioURL: "songs/finding_her.mp3",
    coverURL: "covers/finding_her_cover.jpg"
  },
  {
    title: "Hass Hass",
    artist: "Diljit x Sia",
    audioURL: "songs/hass_hass.mp3",
    coverURL: "covers/hass_hass_cover.jpg"
  },
  {
    title: "Humdum",
    artist: "Aditya Rikhari",
    audioURL: "songs/humdum.mp3",
    coverURL: "covers/humdum_cover.jpg"
  },
  {
    title: "Saiyaara",
    artist: "Tanishk Bagchi, Faheem Abdullah",
    audioURL: "songs/saiyaara.mp3",
    coverURL: "covers/saiyaara_cover.jpg"
  },
  {
    title: "Khoobsurat",
    artist: "Vishal Mishra",
    audioURL: "songs/khoobsurat.mp3",
    coverURL: "covers/khoobsurat_cover.jpg"
  },
  {
    title: "Noor Mahal",
    artist: "Chani Nattan, Inderpal Moga",
    audioURL: "songs/noor_mahal.mp3",
    coverURL: "covers/noor_mahal_cover.jpg"
  },
  {
    title: "Into You",
    artist: "Tegi Pannu, Manni Sandhu",
    audioURL: "songs/into_you.mp3",
    coverURL: "covers/into_you_cover.jpg"
  },
  {
    title: "Soni Soni",
    artist: "Darshan Raval, Jonita Gandhi",
    audioURL: "songs/soni_soni.mp3",
    coverURL: "covers/soni_soni_cover.jpg"
  },
  {
    title: "Tu Hi Aa",
    artist: "The Prophec",
    audioURL: "songs/tu_hi_aa.mp3",
    coverURL: "covers/tu_hi_aa_cover.jpg"
  },
  {
    title: "Tumhare Hi Rahenge Hum",
    artist: "Amitabh Bhattacharya",
    audioURL: "songs/tumhare_hi_rahenge_hum.mp3",
    coverURL: "covers/tumhare_hi_rahenge_hum_cover.jpg"
  }
];

function loadSong(index) {
  const song = songs[index];
  const display = document.getElementById('songDisplay');
  console.log("Loading:", song.audioURL);

  audio.src = encodeURI(song.audioURL);
  audio.load();

  display.innerHTML = `
  <div class="pulse-ring">
    <img src="${encodeURI(song.coverURL)}" alt="Cover" class="cover"/>
  </div>
  <h3>${song.title}</h3>
  <p>${song.artist}</p>
`;


  playBtn.textContent = "▶️";
  isPlaying = false;

  drawVisualizer();

}

function playPause() {
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const pulse = document.querySelector(".pulse-ring");

  if (audio.paused) {
    audio.play();
    playBtn.textContent = "⏸️";
    isPlaying = true;
    pulse?.classList.add("active"); // activate glow
  } else {
    audio.pause();
    playBtn.textContent = "▶️";
    isPlaying = false;
    pulse?.classList.remove("active"); // remove glow
  }

  console.log("Play clicked");
}


function playNext() {
  currentIndex = (currentIndex + 1) % songs.length;
  loadSong(currentIndex);
  audio.play();
  playBtn.textContent = "⏸️";
}

function playPrev() {
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  loadSong(currentIndex);
  audio.play();
  playBtn.textContent = "⏸️";
}

// Timeline scrubber
// Wait until the audio metadata is loaded to get correct duration
audio.addEventListener("loadedmetadata", () => {
  timeline.max = audio.duration;
  document.getElementById("totalTime").textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  timeline.value = audio.currentTime;
  document.getElementById("currentTime").textContent = formatTime(audio.currentTime);
});


timeline.addEventListener("input", () => {
  audio.currentTime = timeline.value;
});

// Auto-play next
audio.addEventListener("ended", () => {
  playNext();
});

// Volume
volumeSlider.addEventListener("input", () => {
  audio.volume = volumeSlider.value;
});

// Visualizer
let ctx = new (window.AudioContext || window.webkitAudioContext)();
let analyser = ctx.createAnalyser();
let source = ctx.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(ctx.destination);

let bufferLength = analyser.frequencyBinCount;
let dataArray = new Uint8Array(bufferLength);

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer);

  analyser.getByteFrequencyData(dataArray);

  // Update waveform bars
  waveform.innerHTML = "";
  for (let i = 0; i < bufferLength; i += 16) {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${dataArray[i] / 2}px`;
    waveform.appendChild(bar);
  }

  // Update glow based on volume
  const pulseWrapper = document.querySelector(".pulse-ring");
  if (pulseWrapper) {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const avg = sum / dataArray.length;

    const scale = 1 + (avg / 256) * 0.4; // 1.0 to 1.4
    const opacity = 0.3 + (avg / 256) * 0.7; // 0.3 to 1.0

    pulseWrapper.style.setProperty("--glow-scale", scale.toFixed(2));
    pulseWrapper.style.setProperty("--glow-opacity", opacity.toFixed(2));
  }
}


// Event listeners
playBtn.addEventListener('click', playPause);
nextBtn.addEventListener('click', playNext);
prevBtn.addEventListener('click', playPrev);

// Load first song
window.onload = () => loadSong(currentIndex);

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

