const background = document.querySelector("#background");
const text = document.querySelector("#text");
const title = document.querySelector("#title");
const body = document.querySelector("body");

if(background == null || text == null) {
  throw new Error("Malformed Html");
}

/**
 * 0 : Playing
 * 1 : Wating unil next elem
 **/
let STATUS = 0;

// position in the movie
let turn = 0;
let element = 0;

// if anchor
const parsed = document.location.hash.match(/#([0-9]+);([0-9]+)/);
if(parsed != null) {
  turn = Number(parsed[1]);
  element = Number(parsed[2]);
}

// Control variables
let prev = -1;
let progress = 0;

let next = 0;

let end = false;

// Storage variables
let imgSource = "";

// background animation

background.addEventListener("animationend", (ev) => {
  if(ev.animationName === "fadeIn") {
    background.classList.remove("fadeIn");
  } else if (ev.animationName === "fadeOut") {
    background.setAttribute("src", imgSource);
  }
});

background.addEventListener("loadend", (ev) => {
  background.classList.remove("fadeOut");
  background.classList.add("fadeIn");
});




const MovieRequest = new Request("/scripts/movie.json");
let movieJson = null;


body.addEventListener("keyup", (ev) => {
  if(ev.code === "Space" || ev.code === "ArrowRight") {
    next = 1;
  } else if (ev.code === "ArrowLeft") {
    next = -1;
  }
});

function step(timestamp) {
  if(STATUS === 0) {
    document.location.hash = `#${turn};${element}`
    const elem = movieJson[turn].diapo[element];
    // If text
    if(elem.type === "text") {
      if(elem.content.toLowerCase().match(/turn [0-9]+/) != null) {
        text.hidden = true;
        background.hidden = true;
        title.hidden = false;
        title.textContent = elem.content;
      } else {
        background.hidden = false;
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
    //if(progress > TIME_BETWEEN_SLIDE) {
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
    /*} else {
      progress += timestamp - prev;
      prev = timestamp;
    }*/
  }

  requestAnimationFrame(step);
}

fetch(MovieRequest).then((res) => res.json()).then((res) => {
  movieJson = res
  requestAnimationFrame((ts) => {
    prev = ts
    step(ts);
  });
});
