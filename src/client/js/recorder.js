const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;

const handleDownload = () => {};

const hendleStop = () => {
  startBtn.innerText = "Download Recording";
  startBtn.removeEventListener("click", hendleStop);
  startBtn.addEventListener("click", handleDownload);

  recorder.stop();
};

const handleStart = () => {
  startBtn.innerText = "Stop Recording";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", hendleStop);

  const recorder = new window.MediaRecorder(stream);
  recorder.ondataavailable = (e) => {
    //console.log(e.data);
    const videoFile = URL.createObjectURL(e.data);
    //console.log(videoFile);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  //console.log(stream);
  video.srcObject = stream;
  video.play();
};

init();

startBtn.addEventListener("click", handleStart);
