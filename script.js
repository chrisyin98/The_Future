//this is for webcam feed

const video = document.querySelector("#videoElement");
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

//####################################################################




















//This is for machine learning

const URL = "https://teachablemachine.withgoogle.com/models/OO6Z-wMs4/";

let model, webcam, ctx, labelContainer, maxPredictions;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // Note: the pose library adds a tmPose object to your window (window.tmPose)
    let goWord1 = document.createElement('p');
    goWord1.textContent = "have patience children";
    document.getElementById('words').append(goWord1);

    model = await tmPose.load(modelURL, metadataURL);
    document.getElementById('words').textContent = "";
    let goWord = document.createElement('p');
    goWord.textContent = "you are now ready for dance math Time";
    document.getElementById('words').append(goWord);

    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam

    const windowInnerWidth  = window.outerWidth;
    const windowInnerHeight = window.outerHeight;

    console.log(windowInnerHeight);
    console.log(windowInnerHeight);

    const flip = true; // whether to flip the webcam
    //webcam = new tmPose.Webcam(windowInnerWidth, windowInnerHeight, flip); // width, height, flip
   // await webcam.setup(); // request access to the webcam
    //await webcam.play();
    window.requestAnimationFrame(loop);

    // append/get elements to the DOM
    const canvas = document.getElementById("canvas");
    canvas.width = windowInnerWidth; canvas.height = windowInnerHeight;
    ctx = canvas.getContext("2d");
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop(timestamp) {
    //webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    // Prediction #1: run input through posenet
    // estimatePose can take in an image, video or canvas html element
    const { pose, posenetOutput } = await model.estimatePose(document.getElementById('videoElement'));
    // Prediction 2: run input through teachable machine classification model
    const prediction = await model.predict(posenetOutput);

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);

        console.log(classPrediction);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }

    // finally draw the poses
    drawPose(pose);
}

function drawPose(pose) {
    if (document.getElementById('videoElement')) {
        ctx.drawImage(document.getElementById('videoElement'), window.innerWidth, window.innerHeight);
        // draw the keypoints and skeleton
        if (pose) {
            const minPartConfidence = 0.5;
            tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
            tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }
    }
}
