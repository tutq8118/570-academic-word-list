import {
  ACADEMIC_WORDLIST_ENDPOINT
} from "./datafetching.js";

const main = async () => {
  let wordlist;
  if (localStorage.ACADEMIC_WORDLIST) {
    wordlist = JSON.parse(localStorage.ACADEMIC_WORDLIST);
  } else {
    const res = await fetch(ACADEMIC_WORDLIST_ENDPOINT, {
      headers: {
        accept: "application/json",
      },
    });
    wordlist = await res.json();
    localStorage.ACADEMIC_WORDLIST = JSON.stringify(wordlist);
  }
  const fullWordlist = JSON.parse(JSON.stringify(wordlist));
  const settings = localStorage.ACADEMIC_WORDLIST_SETTINGS ? JSON.parse(localStorage.ACADEMIC_WORDLIST_SETTINGS) : {};
  const sublistSelected = parseInt(settings.sublist) > 0 ? parseInt(settings.sublist) : 0;
  const colorSelected = settings.color ? settings.color : "#2dbe60";

  if (sublistSelected > 0) {
    wordlist = fullWordlist.filter((e) => e.sublist === sublistSelected)
  } else {
    wordlist = fullWordlist;
  }

  const randomize = () => {
    return Math.floor(Math.random() * wordlist.length);
  };

  const inlineStyle = () => {
    var css = `.academic__sublist ul:before {border-bottom-color: ${colorSelected};}`,
    head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');
    head.appendChild(style);
    style.appendChild(document.createTextNode(css));
  }

  let {
    word,
    phonetics,
    meanings,
    sublist
  } = wordlist[randomize()];

  const renderData = (word, phonetics, meanings, sublist) => {
    const phoneticsHTML = phonetics
      .map(
        (e) => `
      <li class='academic__phonetics-item'>
        <p><strong>IPA:</strong><span>&nbsp;${e.text}</span></p>
        <audio controls>
        <source src="${e.audio}" type="audio/mpeg">
        Your browser does not support the audio element.
        </audio>
      </li>
      `
      )
      .join("");
    const meaningsHTML = meanings
      .map(
        (e, i) => `
      <div class="academic__meanings-item">
        <h3 class="academic__meanings-pos"><strong>Part of speech: </strong><span>${
          e.partOfSpeech
        }</span></h3>
        ${e.definitions
          .map(
            (
              d
            ) => `<p class="academic__meanings-definition" style="color: ${colorSelected}"><strong>Definition: </strong><span>${
              d.definition
            }</span></p>
            ${
              d.example
                ? `<p class="academic__meanings-example"><strong>Example: </strong><span>${d.example}</span></p>`
                : ""
            }
        ${
          d.synonyms
            ? `<p class="academic__meanings-syn"><strong>Synonyms: </strong><span>${d.synonyms
                .map((s) => `<i>${s}</i>`)
                .join(", ")}</span></p>`
            : ""
        }`
          )
          .join("<hr style='border-top: #eaeaea; width: 150px; margin: 3rem auto;'>")}
      </div>
      `
      )
      .join("");

    const sublistHTML = wordlist.filter((e) => e.sublist === sublist).map((i) => `<li>${i.word}</li>`).join("");

    document.body.innerHTML = `
    <div class='academic'>
      <h1 class='academic__word' style="color: ${colorSelected}">
         &ldquo;${word}&rdquo;
      </h1>
      <div class='academic__sublist'>
        <header>
          <h4 class='academic__sublist-title'><strong>Sublist:</strong> ${sublist} (${wordlist.filter((e) => e.sublist === sublist).length} words)</h4>
          <button class='academic__sublist-btn'>
            <i class="gg-list"></i>
            <i class="gg-close-r"></i>
          </button>
        </header>
        <ul style="border-color: ${colorSelected}">${sublistHTML}</ul>
      </div>
      <ul class="academic__phonetics">
        ${phoneticsHTML}
      </ul>
      <div class="academic__meanings">
        ${meaningsHTML}
      </div>
    </div>
  `;

    document.querySelectorAll('.academic__sublist li').forEach(item => {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        const text = this.innerText;
        const element = wordlist.find(i => i.word === text);
        renderData(element.word, element.phonetics, element.meanings, element.sublist);
      });
    });

    document.querySelector('.academic__sublist-btn').addEventListener('click', function(e) {
      e.preventDefault();
      this.classList.toggle('active');
      document.querySelector('.academic__sublist').classList.toggle('active');
    });

  };

  inlineStyle();
  renderData(word, phonetics, meanings, sublist);

};

export default main;