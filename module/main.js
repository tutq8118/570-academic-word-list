import {
  ACADEMIC_WORDLIST_ENDPOINT
} from './datafetching.js';
import {
  confirmShow
} from './confirm.js';

const main = async () => {
  let wordlist;
  if (localStorage.ACADEMIC_WORDLIST) {
    wordlist = JSON.parse(localStorage.ACADEMIC_WORDLIST);
  } else {
    const res = await fetch(ACADEMIC_WORDLIST_ENDPOINT, {
      headers: {
        accept: 'application/json',
      },
    });
    wordlist = await res.json();
    localStorage.ACADEMIC_WORDLIST = JSON.stringify(wordlist);
  }
  let fullWordlist = JSON.parse(JSON.stringify(wordlist));
  const settings = localStorage.ACADEMIC_WORDLIST_SETTINGS ?
    JSON.parse(localStorage.ACADEMIC_WORDLIST_SETTINGS) :
    {
      color: '#2dbe60',
      sublist: '0',
      quizSublist: "0",
      amount: "10",
      showCheckbox: false,
    };
  const sublistSelected = parseInt(settings.sublist) > 0 ? parseInt(settings.sublist) : 0;
  const colorSelected = settings.color ? settings.color : '#2dbe60';
  const showCheckbox = settings.showCheckbox ? settings.showCheckbox : false;

  if (sublistSelected > 0) {
    wordlist = fullWordlist.filter((e) => e.sublist === sublistSelected);
  } else {
    wordlist = fullWordlist;
  }

  const randomize = () => {
    if (showCheckbox) {
      return Math.floor(Math.random() * wordlist.filter((e) => e.disabled !== true).length);
    } else {
      return Math.floor(Math.random() * wordlist.length);
    }
  };

  const inlineStyle = () => {
    var css = `.academic__sublist ul:before {border-bottom-color: ${colorSelected};}
    .academic__sublist-checkbox input[type="checkbox"]:checked ~ .gg-check-r,
    .academic__sublist-checkbox input[type="checkbox"]:checked ~ span,
    .academic__sublist.show-checkbox .academic__sublist-checkbox.checked ~ span,
    .academic__sublist-quiz,
    .academic__sublist.active header {color: ${colorSelected}}
    input:checked + .switch, .switch {background: ${colorSelected}}
    `,
      head = document.head || document.getElementsByTagName('head')[0],
      style = document.createElement('style');
    head.appendChild(style);
    style.appendChild(document.createTextNode(css));
  };

  let {
    word,
    phonetics,
    meanings,
    sublist
  } = showCheckbox ? wordlist.filter((e) => e.disabled !== true)[randomize()] : wordlist[randomize()];

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
      .join('');
    const meaningsHTML = meanings
      .map(
        (e, i) => `
      <div class="academic__meanings-item">
        <h3 class="academic__meanings-pos"><strong>Part of speech: </strong><span>${e.partOfSpeech}</span></h3>
        ${e.definitions
          .map(
            (d) => `<p class="academic__meanings-definition" style="color: ${colorSelected}"><strong><u>Definition</u>:</strong> <span>${d.definition}</span></p>
            ${d.example ? `<p class="academic__meanings-example"><strong><u>Example</u>:</strong> <span>${d.example.split(" ").map(w => (w.includes(word) ? `<strong><i>${w}</i></strong>` : w )).join(" ")}</span></p>` : ''}
        ${d.synonyms ? `<p class="academic__meanings-syn"><strong><u>Synonyms</u>:</strong> <span>${d.synonyms.map((s) => `<i>${s}</i>`).join(', ')}</span></p>` : ''}`
          )
          .join("<hr style='border-top: #eaeaea; width: 150px; margin: 3rem auto;'>")}
      </div>
      `
      )
      .join('');

    const sublistHTML = wordlist
      .filter((e) => e.sublist === sublist)
      .map((i) => `<li><label class='academic__sublist-checkbox ${i.disabled ? 'checked' : ''}'><input type='checkbox' title='Check to turn off the word on the Random' ${i.disabled ? 'checked' : ''} name='showOnRandom'></input><i class="gg-check-r"></i></label><span>${i.word}</span></li>`)
      .join('');

    document.body.innerHTML = `
    <div class='academic'>
      <h1 class='academic__word' style="color: ${colorSelected}">
         &ldquo;${word}&rdquo;
      </h1>
      <div class='academic__sublist ${settings.showCheckbox ? 'show-checkbox' : ''}'>
        <header>
          <h4 class='academic__sublist-title'><strong>Sublist:</strong> ${sublist} (${wordlist.filter((e) => e.sublist === sublist).length} words)</h4>
          <button class='academic__sublist-btn tooltip'>
            <i class="gg-list"></i>
            <i class="gg-close-r"></i>
            <span class="tooltiptext tooltiptext--open">
              Show list of words
            </span>
          </button>
          <button class="academic__sublist-btn academic__sublist-reset tooltip" style="visibility: ${wordlist.filter((e) => e.sublist === sublist && e.disabled === true).length > 0 ? 'visible' : 'hidden' }">
          <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="recycle" class="svg-inline--fa fa-recycle fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M184.561 261.903c3.232 13.997-12.123 24.635-24.068 17.168l-40.736-25.455-50.867 81.402C55.606 356.273 70.96 384 96.012 384H148c6.627 0 12 5.373 12 12v40c0 6.627-5.373 12-12 12H96.115c-75.334 0-121.302-83.048-81.408-146.88l50.822-81.388-40.725-25.448c-12.081-7.547-8.966-25.961 4.879-29.158l110.237-25.45c8.611-1.988 17.201 3.381 19.189 11.99l25.452 110.237zm98.561-182.915l41.289 66.076-40.74 25.457c-12.051 7.528-9 25.953 4.879 29.158l110.237 25.45c8.672 1.999 17.215-3.438 19.189-11.99l25.45-110.237c3.197-13.844-11.99-24.719-24.068-17.168l-40.687 25.424-41.263-66.082c-37.521-60.033-125.209-60.171-162.816 0l-17.963 28.766c-3.51 5.62-1.8 13.021 3.82 16.533l33.919 21.195c5.62 3.512 13.024 1.803 16.536-3.817l17.961-28.743c12.712-20.341 41.973-19.676 54.257-.022zM497.288 301.12l-27.515-44.065c-3.511-5.623-10.916-7.334-16.538-3.821l-33.861 21.159c-5.62 3.512-7.33 10.915-3.818 16.536l27.564 44.112c13.257 21.211-2.057 48.96-27.136 48.96H320V336.02c0-14.213-17.242-21.383-27.313-11.313l-80 79.981c-6.249 6.248-6.249 16.379 0 22.627l80 79.989C302.689 517.308 320 510.3 320 495.989V448h95.88c75.274 0 121.335-82.997 81.408-146.88z"></path></svg>
                      <span class="tooltiptext">Uncheck all the words</span>
                    </button>
          <label class='academic__sublist-switch tooltip'><strong>Word Filter: </strong><input type="checkbox" id='checkbox-switch' ${settings.showCheckbox ? 'checked' : ''} /><i class="switch"></i><span class="tooltiptext">If turn on this, the checked words will no longer be shown randomly</span></label>

          <a href="quiz.html" target="_blank" class="academic__sublist-quiz">
            <?xml version="1.0"?>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M 12 0 C 10.694 0 9.583875 0.835 9.171875 2 L 5 2 C 3.911 2 3 2.911 3 4 L 3 20 C 3 21.089 3.911 22 5 22 L 19 22 C 20.089 22 21 21.089 21 20 L 21 4 C 21 2.911 20.089 2 19 2 L 14.828125 2 C 14.416125 0.835 13.306 4.6351811e-17 12 0 z M 12 2 C 12.552 2 13 2.448 13 3 C 13 3.552 12.552 4 12 4 C 11.448 4 11 3.552 11 3 C 11 2.448 11.448 2 12 2 z M 5 4 L 7 4 L 7 7 L 17 7 L 17 4 L 19 4 L 19 20 L 5 20 L 5 4 z M 16.888672 9.2324219 L 15.121094 11 L 14.060547 9.9394531 L 13 11 L 15.121094 13.121094 L 17.949219 10.292969 L 16.888672 9.2324219 z M 7 10 L 7 12 L 12 12 L 12 10 L 7 10 z M 16.888672 14.232422 L 15.121094 16 L 14.060547 14.939453 L 13 16 L 15.121094 18.121094 L 17.949219 15.292969 L 16.888672 14.232422 z M 7 15 L 7 17 L 12 17 L 12 15 L 7 15 z" clip-rule="evenodd" fill-rule="evenodd" />
            </svg>
            <span>QUIZ</span>
          </a>
        </header>
        <ul style="border-color: ${colorSelected}">
          ${sublistHTML}
        </ul>
      </div>
      <ul class="academic__phonetics">
        ${phoneticsHTML}
      </ul>
      <div class="academic__meanings">
        ${meaningsHTML}
      </div>
    </div>
  `;

    document.querySelector('#checkbox-switch').addEventListener('change', function () {
      document.querySelector('.academic__sublist').classList.toggle('show-checkbox');
      settings.showCheckbox = this.checked;
      localStorage.ACADEMIC_WORDLIST_SETTINGS = JSON.stringify(settings);
    });

    document.querySelectorAll('.academic__sublist li').forEach((item) => {
      item.lastElementChild.addEventListener('click', function (e) {
        e.preventDefault();
        const text = this.innerText;
        const element = wordlist.find((i) => i.word === text);
        renderData(element.word, element.phonetics, element.meanings, element.sublist);
      });
      item.firstElementChild.firstElementChild.addEventListener('change', function () {
        this.parentElement.classList.toggle('checked');
        const text = item.lastElementChild.innerText;
        fullWordlist = fullWordlist.map((e) => {
          if (e.word === text) {
            e.disabled = this.checked;
            return e;
          } else {
            return e;
          }
        });

        !fullWordlist.filter((e) => e.sublist === sublist && e.disabled === true).length ? (document.querySelector('.academic__sublist-reset').style.visibility = 'hidden') : (document.querySelector('.academic__sublist-reset').style.visibility = 'visible')

        localStorage.ACADEMIC_WORDLIST = JSON.stringify(fullWordlist);
      });
    });

    document.querySelector('.academic__sublist-btn').addEventListener('click', function (e) {
      e.preventDefault();
      this.classList.toggle('active');
      document.querySelector('.academic__sublist').classList.toggle('active');
    });

    document.querySelector('.academic__sublist-reset').addEventListener('click', function (e) {
      confirmShow(
        "Are you sure to uncheck all the words?",
        function () {
          fullWordlist = fullWordlist.map((e) => {
            if (e.sublist === sublist) {
              e.disabled = false;
              return e;
            } else {
              return e;
            }
          });
          localStorage.ACADEMIC_WORDLIST = JSON.stringify(fullWordlist);
          document.querySelectorAll('.academic__sublist-checkbox input[type="checkbox"]').forEach((item) => {
            item.checked = false;
            item.parentElement.classList.remove('checked');
          });
          document.querySelector('.academic__sublist-reset').style.visibility = 'hidden';
        }
      );
    });
  };

  inlineStyle();
  renderData(word, phonetics, meanings, sublist);
};

export default main;