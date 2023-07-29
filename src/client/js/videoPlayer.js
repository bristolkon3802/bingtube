const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const volumeRange = document.getElementById("volume");
const currenTime = document.getElementById("currenTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const videoContainer = document.getElementById("videoContainer");

let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = (e) => {
  //비디오가 플레이 되고 있다면, 멈추는 기능
  //멈춰있으면 플레이 가능하게
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtn.innerText = video.paused ? "재생" : "멈춤";
};
//const handlePause = () => (playBtn.innerText = "재생");
//const handlePlay = () => (playBtn.innerText = "멈춤");

const handleMute = (e) => {
  //비디오 음소거 체크
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtn.innerText = video.muted ? "음소거" : "소리";
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeRange = (e) => {
  //비디오가 음소거 됐고 드래그 해주면 음소거 해제
  //비디오가 음소거 됐고, 다시 버튼을 눌러서 음소거 해제하면 그전 상태로 빽
  const {
    target: { value },
  } = e;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "소리";
  }
  volumeValue = value;
  video.volume = value;
};

const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substring(11, 19);

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  currenTime.innerHTML = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

const handleTimelineChange = (e) => {
  const {
    target: { value },
  } = e;
  video.currentTime = value;
};

const handleFullScreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
    fullScreenBtn.innerHTML = "Enter Full Screen";
  } else {
    videoContainer.requestFullscreen();
    fullScreenBtn.innerHTML = "Exit Full Screen";
  }
};

const handleKeydown = (e) => {
  //e.preventDefault();
  if (e.keyCode === 39) {
    video.currentTime += 5;
  }
  if (e.keyCode === 37) {
    video.currentTime -= 5;
  }
};

const handleEnded = () => {
  video.currentTime = 0;
  playBtn.innerText = "재생";
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
fullScreenBtn.addEventListener("click", handleFullScreen);
volumeRange.addEventListener("input", handleVolumeRange);
video.addEventListener("loadedmetadata", handleLoadedMetadata);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);
timeline.addEventListener("input", handleTimelineChange);
window.addEventListener("keydown", handleKeydown);

//마우스가 언제 비디오에 들어가고,
//언제 비디오 안에서 움직이는지 탐색
const videoControls = document.getElementById("videoControls");

let controlsTimeout = null;
let controlsMovementTimeout = null;

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  //마우스가 움직임을 멈춘다면, function은 실행되지 않음
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  videoControls.classList.add("showing");
  //마우스가 멈추는걸 감지
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
  controlsTimeout = setTimeout(hideControls, 3000);
};

video.addEventListener("mousemove", handleMouseMove);
video.addEventListener("mouseleave", handleMouseLeave);
