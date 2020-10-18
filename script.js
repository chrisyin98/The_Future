var video = document.querySelector("#videoElement");
const constraints = { video: true,
                      video: {width: { ideal: 4096 },
                      height: { ideal: 2160 } }};
if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia(constraints)
    .then(function (stream) {
      video.srcObject = stream;
    })
    .catch(function (err0r) {
      console.log("Something went wrong!");
    });
}





