const pupeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const STATUS_URL = "http://willsaveworldforgold.com/forum/viewtopic.php?f=11&t=243&sid=91aa9970bdbd1f548f1085da0a82fafd";
const STATUS_POST = "p43541"

async function ResumeATurn(tUrl, browser) {
  const page = await browser.newPage();
  const turnUrl = new URL(tUrl);
  await page.goto(tUrl, {waitUntil: "networkidle2"});
  const diapo = await page.evaluate((postHash) => {
    let post = document.querySelector(postHash);

    if(post == null) post = document.querySelector(postHash.slice(0,-1));


    const content = post.querySelector(".content");
    let iItems = Array.from(content.childNodes);

    function produceChildren(items) {

      // Filter off BR
      items = items.filter(i => !(i instanceof HTMLBRElement));

      // Filter off quote
      items = items.filter((i) => {
        // If not a div
        if(!(i instanceof HTMLDivElement)) return true;

        // If a div
        return i.querySelector(".quotecontent") == null
      });

      // Filter text with no charracters
      items = items.filter((i) => !(i instanceof HTMLSpanElement && i.textContent.match(/\w/) == null));

      console.log(items);
      return items.map((i) => {
        if(i instanceof HTMLSpanElement) {
          const childs = Array.from(i.childNodes);
          // Check if containing images
          if(childs.find(el => el instanceof HTMLImageElement) == null) {
            //No images
            return childs.reduce((prev, cur) => {
              prev.content += `\n${cur.textContent}`
              return prev;
            }, {type: "text", content: ""});
          } else {
            return produceChildren(childs);
          }
        }
        if(i instanceof Text) {
          return { type: "text", content: i.textContent };
        }
        if(i instanceof HTMLImageElement) {
          return { type: "image", content: i.src };
        }
      });
    }

    return produceChildren(iItems);

  }, turnUrl.hash);
  
  await page.close();
  return diapo;
}

async function GenerateRewind() {
  const browser = await pupeteer.launch({headless: true});
  const page = await browser.newPage();

  await page.goto(STATUS_URL, {waitUntil: "networkidle2"});

  const turnsList = await page.evaluate((STATUS_POST_BROWSER) => {
    const statusContent = document.querySelector(`#${STATUS_POST_BROWSER} .content`);
    if(statusContent == null) { throw new Error("Cannot retrieve status post"); }

    const turnList = statusContent.children[2];
    const turnsLink = Array.from(turnList.querySelectorAll("a.postlink"));

    return turnsLink.map((elem) => {
      return {
        name: elem.innerHTML,
        link: elem.href,
      }
    });
  }, STATUS_POST);
  await page.close();
  
  // const ret = turnsList.map(i => (new URL(i.link)).hash)
  //
  //
  //
  console.log("Crawling");
  const ret = [];
  for(let yy = 0; yy < turnsList.length; yy ++) {
    const diapo = await ResumeATurn(turnsList[yy].link, browser);
    const rDiapo = diapo.reduce((prev, value) => {
      if(value instanceof Array) return [...prev, ...value]
      return [...prev, value];
    }, []);
    console.log(`\rTurn ${yy}/${turnsList.length}`);
    ret.push({ name: turnsList[yy].name , diapo: rDiapo });
  }

  await browser.close();

  return ret
}

GenerateRewind().then((movie) => {
  fs.writeFileSync(path.join(__dirname, "movie.json"), JSON.stringify(movie));
});
