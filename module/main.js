import { ACADEMIC_WORDLIST_ENDPOINT } from './datafetching.js';
import { confirmShow } from './confirm.js';

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
  const settings = localStorage.ACADEMIC_WORDLIST_SETTINGS
    ? JSON.parse(localStorage.ACADEMIC_WORDLIST_SETTINGS)
    : {
        color: '#2dbe60',
        sublist: '0',
        showCheckbox: false,
      };
  const sublistSelected = parseInt(settings.sublist) > 0 ? parseInt(settings.sublist) : 0;
  const colorSelected = settings.color ? settings.color : '#2dbe60';

  if (sublistSelected > 0) {
    wordlist = fullWordlist.filter((e) => e.sublist === sublistSelected);
  } else {
    wordlist = fullWordlist;
  }

  const randomize = () => {
    return Math.floor(Math.random() * wordlist.filter((e) => e.disabled !== true).length);
  };

  const inlineStyle = () => {
    var css = `.academic__sublist ul:before {border-bottom-color: ${colorSelected};}
    .academic__sublist-checkbox input[type="checkbox"]:checked ~ .gg-check-r,
    .academic__sublist-checkbox input[type="checkbox"]:checked ~ span,
    .academic__sublist .academic__sublist-checkbox.checked ~ span,
    .academic__sublist.active header {color: ${colorSelected}}
    input:checked + .switch {background: ${colorSelected}}
    `,
      head = document.head || document.getElementsByTagName('head')[0],
      style = document.createElement('style');
    head.appendChild(style);
    style.appendChild(document.createTextNode(css));
  };

  let { word, phonetics, meanings, sublist } = wordlist.filter((e) => e.disabled !== true)[randomize()];

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
            (d) => `<p class="academic__meanings-definition" style="color: ${colorSelected}"><strong>Definition: </strong><span>${d.definition}</span></p>
            ${d.example ? `<p class="academic__meanings-example"><strong>Example: </strong><span>${d.example}</span></p>` : ''}
        ${d.synonyms ? `<p class="academic__meanings-syn"><strong>Synonyms: </strong><span>${d.synonyms.map((s) => `<i>${s}</i>`).join(', ')}</span></p>` : ''}`
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
              Show the Sublist's words
            </span>
          </button>
          <button class="academic__sublist-btn academic__sublist-reset tooltip">
            <i class="gg-log-off"></i>
            <span class="tooltiptext">Reset all the ticked words of the sublist</span>
          </button>
          <label class='academic__sublist-switch tooltip'><strong>Random Filter: </strong><input type="checkbox" id='checkbox-switch' ${settings.showCheckbox ? 'checked' : ''} /><i class="switch"></i><span class="tooltiptext">The words ticked will no longer be shown randomly</span></label>
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
        "Are you sure to reset filter?",
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
          })
        },
        function () {
          console.log('Cancel');
        }
      );
    });
  };

  inlineStyle();
  renderData(word, phonetics, meanings, sublist);
};

export default main;
