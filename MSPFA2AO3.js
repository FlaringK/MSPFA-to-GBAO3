
let storyData

// Testing, replace with upload later
fetch("./AllHomestuck.json").then(response => {
   return response.json();
}).then(data => {
  storyData = data
  convertJson()
});

const importJson = () => {
  const files = document.getElementById("selectFiles").files

  if (!files.length) return;
  
  var fr = new FileReader();

  fr.onload = function(e) { 
    console.log(e);
      var result = JSON.parse(e.target.result);
      var formatted = JSON.stringify(result, null, 2);
      //    document.getElementById('result').value = formatted;
      storyData = result
      convertJson()
    }
  
  fr.readAsText(files.item(0));

}

// Actual function
const convertJson = () => {
  console.log(storyData)

  let comic = document.getElementsByClassName("comicContent")[0]
  comic.innerHTML = ""

  len = storyData.p.length

  let start = document.getElementById("pagemin").value > len ? len : document.getElementById("pagemin").value
  let end = document.getElementById("pagemax").value > len ? len : document.getElementById("pagemax").value

  for (let i = start - 1; i < end; i++) {

    pageData = storyData.p[i]
    pageIndex = i - start + 1

    // link to page to account for weird ao3 shit
    let pageHook = document.createElement("a")
    pageHook.rel = "nofollow"
    pageHook.className = "story-link"
    pageHook.id = "page-" + (pageIndex + 1)
    pageHook.name = "page-" + (pageIndex + 1)

    let pageWrap = document.createElement("div")
    pageWrap.className = "story-page"

    // Main page content
    let pageTitle = document.createElement("h2")
    pageTitle.innerHTML = MSPFAparseBBcode(pageData.c).innerHTML
    pageWrap.appendChild(pageTitle)

    let pageContent = document.createElement("div")
    pageContent.innerHTML = MSPFAparseBBcode(pageData.b).innerHTML
    pageWrap.appendChild(pageContent)

    // Create links to next page
    let nextPageLinkWrap = document.createElement("div")
    nextPageLinkWrap.className = "links"
    pageWrap.appendChild(nextPageLinkWrap)

    pageData.n.forEach(nextPageIndex => {

      let nextPageLink = document.createElement("a")
      nextPageLink.rel = "nofollow"
      nextPageLink.href = "#page-" + (nextPageIndex - start + 1)
      nextPageLink.innerText = storyData.p[nextPageIndex - 1] ? storyData.p[nextPageIndex - 1].c : storyData.m

      nextPageLinkWrap.appendChild(document.createTextNode("> "))
      nextPageLinkWrap.appendChild(nextPageLink)
      nextPageLinkWrap.appendChild(document.createElement("br"))
    })

    if (!pageData.n.length) {
      let nextPageIndex = (pageIndex + 2)
      console.log(pageIndex, pageIndex + 2)

      let nextPageLink = document.createElement("a")
      nextPageLink.rel = "nofollow"
      nextPageLink.href = "#page-" + nextPageIndex
      nextPageLink.innerText = storyData.p[nextPageIndex - 1] ? storyData.p[nextPageIndex - 1].c : storyData.m

      nextPageLinkWrap.appendChild(document.createTextNode("> "))
      nextPageLinkWrap.appendChild(nextPageLink)
      nextPageLinkWrap.appendChild(document.createElement("br"))
    }

    // Create game links
    let gamelinkWrap = document.createElement("div")
    gamelinkWrap.className = "gameLinks"
    pageWrap.appendChild(gamelinkWrap)

    let startover = document.createElement("a")
    startover.rel = "nofollow"
    startover.href = "#page-1"
    startover.innerText = "Start Over"

    let goback = document.createElement("a")
    goback.rel = "nofollow"
    goback.href = "#page-" + (pageIndex ? pageIndex : 1)
    goback.innerText = "Go Back"

    gamelinkWrap.appendChild(startover)
    gamelinkWrap.appendChild(document.createTextNode(" | "))
    gamelinkWrap.appendChild(goback)

    comic.prepend(pageWrap)
    comic.prepend(pageHook)
  }

  // Dummy link to be preoended
  let dummyDiv = document.createElement("div")
  dummyDiv.className = "story-page"
  dummyDiv.innerText = "This is a dummy page, just... trust me, it's needed"

  comic.prepend(dummyDiv)
  comic.prepend(document.createElement("a"))

  let finalHTML = document.getElementById("workskin").innerHTML.replaceAll("<br><br>", "<br>\n\n<br>")

  for (const [key, value] of Object.entries(hsColors)) {
    finalHTML = finalHTML.replaceAll('style="color: ' + key + ';"', "class=" + value)
    console.log(key, value)
  }

  document.getElementById("ao3html").value = finalHTML 

  document.getElementById("count").innerHTML = "Character Count = " + finalHTML.split("").length + " / 500000"
}


// MSPFA Parse BBcode
let MSPFAparseBBcode = (code, noHTML) => {
  if (noHTML) {
    code = [
      code.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    ];
  } else {
    code = code.split(/\<(textarea|style)(?:(?: |\n)(?:.|\n)*?)?\>(?:.|\n)*?\<\/\2\>/gi);
    for (var i = 2; i < code.length; i += 2) {
      code.splice(i, 1);
    }
  }

  for (var i = 0; i < code.length; i += 2) {
    var prevCode;
    while (prevCode != code[i]) {
      prevCode = code[i];
      for (var j = 0; j < MSPFABBC.length; j++) {
        code[i] = code[i].replace(MSPFABBC[j][0], MSPFABBC[j][1]);
      }
    }
  }

  code = code.join('');
  var e = document.createElement('span');
  e.innerHTML = code;
  var es = e.querySelectorAll('*');
  for (var i = es.length - 1; i >= 0; i--) {
    if (es[i].tagName == 'SCRIPT') {
      es[i].parentNode.removeChild(es[i]);
    } else if (es[i].tagName == 'PARAM') {
      if (es[i].name.trim() == 'allowScriptAccess') {
        es[i].parentNode.removeChild(es[i]);
      }
    } else {
      // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
      for (var j = 0; j < es[i].attributes.length; j++) {
        if (es[i].attributes[j].name.toLowerCase().indexOf('on') == 0 || (typeof es[i][es[i].attributes[j].name.toLowerCase()] == 'string' && /^(?:javascript|data):/.test(es[i][es[i].attributes[j].name.toLowerCase()])) || /^(?:javascript|data):/.test(es[i].attributes[j].value) || es[i].attributes[j].name.toLowerCase() == 'allowscriptaccess') {
          es[i].removeAttribute(es[i].attributes[j].name);
        }
      }
    }
  }
  return e;
}

// BBCODE

let MSPFABBC=[
  [/  /g,
  '&nbsp;&nbsp;'],
  [
    /\t/g,
    '&nbsp;&nbsp;&nbsp;&nbsp;'
  ],
  [
    /\r?\n/g,
    '<br>'
  ],
  [
    /\[b\]((?:(?!\[b\]).)*?)\[\/b\]/gi,
    '<b>$1</b>'
  ],
  [
    /\[i\]((?:(?!\[i\]).)*?)\[\/i\]/gi,
    '<i>$1</i>'
  ],
  [
    /\[u\]((?:(?!\[u\]).)*?)\[\/u\]/gi,
    '<u>$1</u>'
  ],
  [
    /\[s\]((?:(?!\[s\]).)*?)\[\/s\]/gi,
    '<s>$1</s>'
  ],
  [
    /\[size=(\d*?)\]((?:(?!\[size=(?:\d*?)\]).)*?)\[\/size\]/gi,
    '$2'
  ],
  [
    /\[color=("?)#?([a-f0-9]{3}(?:[a-f0-9]{3})?)\1\]((?:(?!\[color(?:=[^;]*?)\]).)*?)\[\/color\]/gi,
    '<span style="color: #$2;">$3</span>'
  ],
  [
    /\[color=("?)([^";]+?)\1\]((?:(?!\[color(?:=[^;]*?)\]).)*?)\[\/color\]/gi,
    '<span style="color: $2;">$3</span>'
  ],
  [
    /\[background=("?)#?([a-f0-9]{3}(?:[a-f0-9]{3})?)\1\]((?:(?!\[background(?:=[^;]*?)\]).)*?)\[\/background\]/gi,
    '$3'
  ],
  [
    /\[background=("?)([^";]+?)\1\]((?:(?!\[background(?:=[^;]*?)\]).)*?)\[\/background\]/gi,
    '$3'
  ],
  [
    /\[font=("?)([^";]*?)\1\]((?:(?!\[size(?:=[^;]*?)\]).)*?)\[\/font\]/gi,
    '$3'
  ],
  [
    /\[(center|left|right|justify)\]((?:(?!\[\1\]).)*?)\[\/\1\]/gi,
    '<p align="$1">$2</div>'
  ],
  [
    /\[url\]([^"]*?)\[\/url\]/gi,
    '<a href="$1">$1</a>'
  ],
  [
    /\[url=("?)([^"]*?)\1\]((?:(?!\[url(?:=.*?)\]).)*?)\[\/url\]/gi,
    '<a href="$2">$3</a>'
  ],
  [
    /\[alt=("?)([^"]*?)\1\]((?:(?!\[alt(?:=.*?)\]).)*?)\[\/alt\]/gi,
    '<span title="$2">$3</span>'
  ],
  [
    /\[img\]([^"]*?)\[\/img\]/gi,
    '<img src="$1">'
  ],
  [
    /\[img=(\d*?)x(\d*?)\]([^"]*?)\[\/img\]/gi,
    '<img src="$3" width="$1" height="$2">'
  ],
  [
    /\[spoiler\]((?:(?!\[spoiler(?: .*?)?\]).)*?)\[\/spoiler\]/gi,
    '<div class="spoiler">$1</div>'
  ],
  [
    /\[spoiler open=("?)([^"]*?)\1 close=("?)([^"]*?)\3\]((?:(?!\[spoiler(?: .*?)?\]).)*?)\[\/spoiler\]/gi,
    '<div class="spoiler">$5</div>'
  ],
  [
    /\[spoiler close=("?)([^"]*?)\1 open=("?)([^"]*?)\3\]((?:(?!\[spoiler(?: .*?)?\]).)*?)\[\/spoiler\]/gi,
    '<div class="spoiler">$5</div>'
  ],
  [
    /\[flash=(\d*?)x(\d*?)\](.*?)\[\/flash\]/gi,
    'This was a flash, but it\'s broken now, sorry!'
  ],
  [
    /\[user\](.+?)\[\/user\]/gi,
    ''
  ]
]

// HOMESTUCK COLOURS

const hsColors = {
  "#000000": "black",
  "#ffffff": "scratch",
  "#a10000": "aradia",
  "#e00707": "AR",
  "#0000ff": "athblue",
  "#ff0000": "athred",
  "#00ff00": "athgreen",
  "#f2a400": "strider",
  "#4b4b4b": "dad",
  "#000056": "equius",
  "#6a006a": "eridan",
  "#77003c": "feferi",
  "#2b0057": "gamzee",
  "#4ac925": "jade",
  "#1f9400": "jadesprite",
  "#00d5f2": "jane",
  "#ff6ff2": "jaspersprite",
  "#0715cd": "john",
  "#008141": "kanaya",
  "#626262": "karkat",
  "#416600": "nepeta",
  "#b536da": "rose",
  "#a1a100": "sollux",
  "#a15000": "tavros",
  "#008282": "terezi",
  "#929292": "uu",
  "#323232": "undyingumbrage",
  "#005682": "vriska",
  "#2ed73a": "altcaliborn",
  "#678900": "limeblood"
}