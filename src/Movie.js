const background = document.querySelector("#background");
const text = document.querySelector("#text");
const title = document.querySelector("#title");
const body = document.querySelector("body");
const navs = document.querySelectorAll(".nav");

if(background == null || text == null) {
  throw new Error("Malformed Html");
}

/**
 * 0 : Playing
 * 1 : Wating unil next elem
 **/
let STATUS = 0;

// position in the story
let turn = 0;
let element = 0;

// Control variables
let next = 0;

let end = false;

// Storage variables
let imgSource = "";
let movieJson = null;

// if anchor
function readHash(hash) {
  console.log("reading");
  const parsed = hash.match(/#([0-9]+);([0-9]+)/);
  if(parsed != null) {
    turn = Number(parsed[1]);
    element = Number(parsed[2]);

    let imgFound = "";
    let curElem = element;
    let curTurn = turn;

    // Find nearest image
    while(imgFound === "" && curTurn >= 0) {
      if(movieJson[curTurn].diapo[curElem].type === "image") {
        imgFound = movieJson[curTurn].diapo[curElem].content;
      } else {
        curElem -= 1;
        if (curElem < 0) {
          curTurn -= 1;
          if(curTurn >= 0) curElem = movieJson[turn].diapo.length;
        }
      }
    }

    // Refresh image, even if not found
    imgSource = imgFound;
    background.classList.add("fadeOut");
    // If anchoring an image, load next text
    if(curElem === element && curTurn === turn) {
      next = 1;
    }
  } else {
    console.warn(`Invalid hash ${hash}`);
  }
}

// background animation

background.addEventListener("animationend", (ev) => {
  if(ev.animationName === "fadeIn") background.classList.remove("fadeIn");
  else if (ev.animationName === "fadeOut") {
    background.setAttribute("src", imgSource);
    if(imgSource == null || imgSource === "") {
      background.classList.remove("fadeOut");
      background.classList.add("fadeIn");
    }
  }
});

background.addEventListener("loadend", (ev) => {
  background.classList.remove("fadeOut");
  background.classList.add("fadeIn");
});


// Navigation control
body.addEventListener("keyup", (ev) => {
  if(ev.code === "Space" || ev.code === "ArrowRight") next = 1;
  else if (ev.code === "ArrowLeft") next = -1;
});

navs.forEach(element => element.addEventListener("click", (ev) => {
  switch(ev.target.id) {
    case "first":
      document.location.hash = "#0;0";
      readHash(document.location.hash);
      STATUS = 0;
      break;
    case "prev":
      next = -1;
      break;
    case "next":
      next = 1;
      break;
    case "last":
      document.location.hash = `#${movieJson.length - 1};0`;
      readHash(document.location.hash);
      STATUS = 0;
      break;
  }
}));



// Loop function
function step() {
  if(STATUS === 0) {
    document.location.hash = `#${turn};${element}`
    const elem = movieJson[turn].diapo[element];
    // If text
    if(elem.type === "text") {
      if(elem.content.toLowerCase().match(/turn [0-9]+/) != null) {
        text.hidden = true;
        title.hidden = false;
        title.textContent = elem.content;
      } else {
        text.hidden = false;
        title.hidden = true;
        text.textContent = elem.content;
      }

      next = 0;
    //Else if image
    } else if (elem.type === "image") {
      background.classList.remove("fadeIn");
      background.classList.add("fadeOut");
      imgSource = elem.content;

      if(next === 1) next = 1;
      else next = 0;
    }
    
    STATUS = 1
  }
  if(STATUS === 1) {
    if(next === 1) {
      element += 1;
      if(element === movieJson[turn].diapo.length) {
        turn += 1;
        element = 0;
      }

      if(turn === movieJson.length) {
        end = true;
        turn -= 1;
      }

      STATUS = 0;
    } else if(next === -1) {
      element -= 1;
      if(element < 0) {
        turn -= 1
        element = 0;
      }

      if(turn < 0) turn = 0;

      STATUS = 0;
    }
  }
  requestAnimationFrame(step);
}

const MovieRequest = new Request("scripts/movie.json");

fetch(MovieRequest).then((res) => res.json()).then((res) => {
  movieJson = res;
  readHash(document.location.hash);
  requestAnimationFrame((ts) => {
    step(ts);
  });
});
