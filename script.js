// Name any p5.js functions we use in the global so Glitch can recognize them.
/* global createCanvas, random, background, fill, color, rect, ellipse, square,
stroke, noStroke, noFill, strokeWeight, colorMode,  width, height, text, HSB,
line, mouseX, mouseY, mouseIsPressed, windowWidth, windowHeight, textSize */
const W = window.innerWidth;
const H = window.innerHeight;


const video = document.querySelector("#videoElement");
const constraints = { video: true,
                      video: {width: { ideal: 4096 },
                      height: { ideal: 2160 } }};
if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia(constraints)
    .then(function (stream) {
      video.srcObject = stream;
    })
    .catch(function (error) {
      console.log(error);
    });
}



let dots;
let radius, rGrowSpeed, rColor;
let score;
let currentNum;
let fishImage;
let storage = {
  score: 0,
  time: 10,
  num1: -1,
  num2: -1,
  solution: 0,
  numberStore: [],
  possibleSolutions: [],
  type: 0,
  paused: false
};
let interval;
let pausePopout;
let congratsBanner;
let isWon = false;
let wonTimeCount = 0;

let pauseText = document.querySelector("#pauseText");

let pauseButton = document.querySelector("#pause");
pauseButton.addEventListener("click", function() {
  storage.pause = !storage.pause;
  if(storage.pause) {
    clearInterval(interval);
    pauseText.innerHTML = "Play";
    pauseButton.classList.add("resumeClass");
    if(pauseButton.classList.contains("pauseClass")) {
      pauseButton.classList.remove("pauseClass");
    }
  } else {
    interval = setInterval(handleTime, 1000);
    pauseText.innerHTML = "Pause";
    pauseButton.classList.add("pauseClass");
    if(pauseButton.classList.contains("resumeClass")) {
      pauseButton.classList.remove("resumeClass");
    }
  }
});

let timer = document.querySelector("#timerContent");

let question = document.querySelector("#questionContent");

let scoreKeeper = document.querySelector("#scoreKeep");

let addMainButton = document.querySelector("#add");
addMainButton.addEventListener("click", function() {
  alert("clicked add");
});

let subMainButton = document.querySelector("#subtract");
subMainButton.addEventListener("click", function() {
  alert("clicked subtract");
});

let multiMainButton = document.querySelector("#multiply");
multiMainButton.addEventListener("click", function() {
  alert("clicked multiply");
});

let divMainButton = document.querySelector("#divide");
divMainButton.addEventListener("click", function() {
  alert("clicked divide");
});

document.body.onkeyup = function(e){
  e.preventDefault();
    if(e.keyCode == 32){
      storage.pause = !storage.pause;
      if(storage.pause) {
        clearInterval(interval);
        pauseText.innerHTML = "Play";
        pauseButton.classList.add("resumeClass");
        if(pauseButton.classList.contains("pauseClass")) {
          pauseButton.classList.remove("pauseClass");
        }
      } else {
        interval = setInterval(handleTime, 1000);
        pauseText.innerHTML = "Pause";
        pauseButton.classList.add("pauseClass");
        if(pauseButton.classList.contains("resumeClass")) {
          pauseButton.classList.remove("resumeClass");
        }
      }
    }
}

function setup() {
  createCanvas(windowWidth - 20, windowHeight - 100);
  //createCanvas(1800, 800);
  colorMode(HSB, 360, 100, 100);
  interval = setInterval(handleTime, 1000);
  timer.innerHTML = storage.time + " sec(s)";
  radius = 0.5;
  rColor = random(360);

  // controls number of dots on screen
  dots = [];
  for (let i = 0; i < 5; i++) {
    // creates a new bouncing dot with random rize, position, and color
    let bouncyDot = new BouncyDot(random(width), random(height), 80, random(360));
    let overlapping = false;
    for (let dot of dots) {
      let d = dist(bouncyDot.x, bouncyDot.y, dot.x, dot.y);
      if (d < bouncyDot.r + dot.r) {
        overlapping = true;
      }
    }

    if (!overlapping) {
      dots.push(bouncyDot);
      storage.numberStore.push(bouncyDot.number);
    }
    else {
      i--;
    }
  }

  console.log("NumberStore initial: " + storage.numberStore);
  // Storing all possible solutions
  // if(storage.type == 1) {
    for(let i = 0; i < storage.numberStore.length; i++) {
      for(let j = i + 1; j < storage.numberStore.length; j++) {
        storage.possibleSolutions.push(storage.numberStore[i] + storage.numberStore[j]);
      }
    }
  // }
  // console.log("possible solutions: " + storage.possibleSolutions);
  storage.solution = storage.possibleSolutions[Math.floor(Math.random() * storage.possibleSolutions.length)];
  // console.log("solution: " + storage.solution);

  // Updating score
  scoreKeeper.innerHTML = "Score: " + storage.score;

  question.innerHTML = "What two numbers <b>add</b> to " + storage.solution + "?";

  // keeps track of current number user hovered over
  currentNum = 0;
  fishImg = loadImage('https://cdn.glitch.com/2d6f592c-086f-42ba-a4b0-4fb322cbb8be%2FScreenshot%202020-10-17%20184949.png?v=1602986732084');
  pausePopout = loadImage('https://cdn.glitch.com/2d6f592c-086f-42ba-a4b0-4fb322cbb8be%2FRectangle%20336%20(3).png?v=1602997780880');
  congratsBanner = loadImage('https://cdn.glitch.com/2d6f592c-086f-42ba-a4b0-4fb322cbb8be%2FRectangle%20336%20(2).png?v=1602995937090');
  // // Setting timer
  // setTimer();
}

function draw() {
  background(0, 0, 0);
  // displays current number
  //text(`current number: ${currentNum}`, 10, 40);
  // follows mouse
  ellipse(mouseX, mouseY, 5);

  // fish in the background
  image(fishImg, width / 7, height / 3, width / 6, width / 7.2);
  image(fishImg, 3 * width / 7, 2 * height / 3, width / 6, width / 7.2);
  image(fishImg, 5 * width / 7, height / 3, width / 6, width / 7.2);

  for (let dot of dots) {
    dot.checkAllCollisions(dots);
    dot.move();
    //dot.ifhover();
    dot.display();
  }

  while (isWon) {
    image(congratsBanner, 0, height / 2 - height / 4, width, height / 2);
    wonTimeCount++;
  }


  if (storage.pause) {
    image(pausePopout, 10, 10, width - 10, height - 10);
  }
}

function reset() {
  clearInterval(interval)
  isWon = false;
  wonTimeCount = 0;
  storage.num1 = -1;
  storage.num2 = -1;
  storage.numberStore = [];
  storage.possibleSolutions= [];
  storage.time = 10;
  setup();
}

function mouseClicked() {
  for (let dot of dots) {
    if (!storage.pause && checkMouseCollision(5, dot.x, dot.y, dot.r)) {

      currentNum = dot.number;
      if(storage.num1 == -1) {
        storage.num1 = dot.number;
        console.log("num 1: " + storage.num1);
      } else {
        storage.num2 = dot.number;
        console.log("num 2: " + storage.num2);
        if(storage.num1 + storage.num2 == storage.solution) {
          storage.score++;
          storage.clear = true;


          isWon = true;
          reset();
        } else {
          storage.num1 = -1;
          storage.num2 = -1;
        }
      }
    }
  }
}

function checkMouseCollision(cursorRadius, x, y, dotRadius) {
  return Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2)) -
    (cursorRadius + dotRadius) <= 0;
}

//wait how do you check if theyre on top of each other lol //jessica -idk
//
function checkCollision(BouncyDot1, BouncyDot2) {
  return Math.sqrt(Math.pow(BouncyDot1.x - BouncyDot2.x, 2) + Math.pow(BouncyDot1.y - BouncyDot2.y, 2))
        < (BouncyDot1.r + BouncyDot2.r);
}

class BouncyDot {
  constructor(x, y, r, color) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.number = Math.floor(random(10));
    // console.log(storage.numberStore);
    this.color = color;
    // Randomly generate a master velocity (broken into components)...
    this.masterXvelocity = random(0.5, 5);
    this.masterYvelocity = random(0.5, 5);
    // ...and use those as starting velocities.
    this.xVelocity = this.masterXvelocity;
    this.yVelocity = this.masterYvelocity;
  }

  ifHover()  {
    if (checkMouseCollision(1, this.x, this.y, this.r))  {
      this.color = "blue";
    }
  }

  updateCollisionVelocity(dot) {
    let vCollision = {x: dot.x - this.x, y: dot.y - this.y};
    let vCollisionNorm = {x: vCollision.x / (dot.r + this.r), y: vCollision.y / (this.r + dot.r)};
    let vRelativeVelocity = {x: this.xVelocity - dot.xVelocity, y: this.yVelocity - dot.yVelocity};
    let speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;

    this.xVelocity -= (speed * vCollisionNorm.x);
    this.yVelocity -= (speed * vCollisionNorm.y);
    dot.xVelocity += (speed * vCollisionNorm.x);
    dot.yVelocity += (speed * vCollisionNorm.y);
  }

  // Checks for collision and updates velocities accordingly
  checkAllCollisions(dots) {
    for (let dot of dots) {
      if (this.x - dot.x != 0 && this.y - dot.y != 0) {
        if (checkCollision(this, dot))  {
          this.updateCollisionVelocity(dot);
        }
      }
    }
  }

  move() {
    this.x += this.xVelocity;
    this.y += this.yVelocity;
    // Standard bounce code - like the DVD logo, but for spheres.
    if (this.x + this.r > width) {
      this.xVelocity = -1 * this.masterXvelocity;
    }
    if (this.x - this.r < 0) {
      this.xVelocity = this.masterXvelocity;
    }

    if (this.y + this.r > height) {
      this.yVelocity = -1 * this.masterYvelocity;
    }

    if (this.y - this.r < 0) {
      this.yVelocity = this.masterYvelocity;
    }
  }

  display() {
    fill(0, 0, 20);
    noStroke();
    ellipse(this.x + 5, this.y + 5, this.r * 2);

    fill(this.color, 50, 90);
    noStroke();
    ellipse(this.x, this.y, this.r * 2);

    // puts numbers in the circles
    fill(100);
    textSize(50);
    text(`${this.number}`, this.x - (this.r / 5), this.y + (this.r / 5));
  }
}

function handleTime() {
  if (storage.time > 0) {
    storage.time--;
    timer.innerHTML = storage.time + " sec(s)";
  }
  else {
    timer.innerHTML = "EXPIRED";
    reset();
  }
}








async function init() {
 //old https://teachablemachine.withgoogle.com/models/OO6Z-wMs4/
  const URL = "https://teachablemachine.withgoogle.com/models/zUm0hXv5l/";
  let model, webcam, ctx, labelContainer, maxPredictions;

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
    const windowInnerHeight = window.outerHeight; //instead of window.inner


    const flip = true; // whether to flip the webcam
    //webcam = new tmPose.Webcam(windowInnerWidth, windowInnerHeight, flip); // width, height, flip
   // await webcam.setup(); // request access to the webcam
    //await webcam.play();
    window.requestAnimationFrame(mLloop);

    // append/get elements to the DOM
    const canvas = document.getElementById("canvas");
    canvas.width = windowInnerWidth; canvas.height = windowInnerHeight;
    ctx = canvas.getContext("2d");
    //labelContainer = document.getElementById("label-container");
    //for (let i = 0; i < maxPredictions; i++) { // and class labels
    //    labelContainer.appendChild(document.createElement("div"));
   // }



    async function mLloop(timestamp) {
      //webcam.update(); // update the webcam frame
      await predict();
      window.requestAnimationFrame(mLloop);
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
        //  labelContainer.childNodes[i].innerHTML = classPrediction;

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
}








