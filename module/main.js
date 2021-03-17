import { ACADEMIC_WORDLIST_ENDPOINT } from './datafetching.js';
import { confirmShow } from './confirm.js';
import { settings } from './settings.js';

const main = async () => {
  // settings =========================
  let settings = {
    color: '#2dbe60',
    sublist: '0',
    quizSublist: '0',
    amount: '10',
    showCheckbox: false,
    showingMode: 'sublist',
  };

  if (localStorage.ACADEMIC_WORDLIST_SETTINGS) {
    settings = JSON.parse(localStorage.ACADEMIC_WORDLIST_SETTINGS);
  }

  const sublistSelected = parseInt(settings.sublist) > 0 ? parseInt(settings.sublist) : 0;
  const colorSelected = settings.color ? settings.color : '#2dbe60';
  const showingMode = settings.showingMode ? settings.showingMode : 'sublist';

  document.querySelector('#sublist-selector').getElementsByTagName('option')[sublistSelected].selected = 'selected';
  document.querySelector('#color-selector').value = colorSelected;

  // document.querySelector('#mode-selector').addEventListener('change', function(e) {
  //   document.querySelector('#sublist-selector').value = '0';
  // });

  document.querySelector('#settings-form').addEventListener('submit', function (e) {
    e.preventDefault();
    settings.showingMode = document.querySelector('#mode-selector').value;
    settings.sublist = document.querySelector('#sublist-selector').value;
    settings.color = document.querySelector('#color-selector').value;
    localStorage.ACADEMIC_WORDLIST_SETTINGS = JSON.stringify(settings);
    chrome.tabs.reload();
  });

  document.querySelector('#color-reset').addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector('#color-selector').value = '#2dbe60';
    settings.color = '#2dbe60';
  });

  //end settings ============================

  let wordlist;
  if (localStorage.ACADEMIC_WORDLIST) {
    wordlist = JSON.parse(localStorage.ACADEMIC_WORDLIST);
  } else {
    document.querySelector('.app__setting').style.display = 'none';
    document.querySelector('.app__main').innerHTML = '<h3 class="app__loading">Initial Loading...</h3>';
    const res = await fetch(ACADEMIC_WORDLIST_ENDPOINT, {
      headers: {
        accept: 'application/json',
      },
    });
    wordlist = await res.json();
    localStorage.ACADEMIC_WORDLIST = JSON.stringify(wordlist);
  }
  let fullWordlist = JSON.parse(JSON.stringify(wordlist));

  if (showingMode === 'sublist') {
    if (sublistSelected > 0) {
      wordlist = fullWordlist.filter((e) => e.sublist === sublistSelected);
    } else {
      wordlist = fullWordlist;
    }
  } else {
    wordlist = fullWordlist.filter((e) => e.disabled === true)
  }

  

  /*   // Check missing exampe, synonyms items 
  let missingArr = [];
  fullWordlist.forEach(item => {
    item.meanings.forEach(meaning => {
      meaning.definitions.forEach(definition => {
        if (!definition.synonyms && !missingArr.includes(item)) {
          missingArr.push(item);
        }
      })
    })
  });
  console.log(missingArr); */

  const randomize = () => {
      return Math.floor(Math.random() * wordlist.length);
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

  let currentWordIndex = randomize();

  let { word, phonetics, meanings, sublist } = wordlist[currentWordIndex];
  const renderData = (word, phonetics, meanings, sublist) => {
    const phoneticsHTML = phonetics
      .slice(0, 2)
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
        <h3 class="academic__meanings-pos"><span>${e.partOfSpeech}</span></h3>
        ${e.definitions
          .map(
            (d) => `<p class="academic__meanings-definition" style="color: ${colorSelected}"><strong><u>Definition</u>:</strong> <span>${d.definition}</span></p>
            ${
              d.example
                ? `<p class="academic__meanings-example"><strong><u>Example</u>:</strong> <span>${d.example
                    .split(' ')
                    .map((w) => (w.includes(word) ? `<strong><i>${w}</i></strong>` : w))
                    .join(' ')}</span></p>`
                : ''
            }
        ${d.synonyms ? `<p class="academic__meanings-syn"><strong><u>Synonyms</u>:</strong> <span>${d.synonyms.map((s) => `<i>${s}</i>`).join(', ')}</span></p>` : ''}`
          )
          .join("<hr style='border-top: #eaeaea; width: 150px; margin: 3rem auto;'>")}
      </div>
      `
      )
      .join('');

    const sublistHTML = fullWordlist
      .filter((e) => e.sublist === sublist)
      .map(
        (i) => `<li data-value=${i.word}>
      <label class='academic__sublist-checkbox ${i.word === word ? 'active' : ''} ${i.disabled ? 'checked' : ''}'>
        <input type='checkbox' ${i.disabled ? 'checked' : ''} name=''>
        </input>
        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 0 512.011 512.011" style="enable-background:new 0 0 512.011 512.011;" xml:space="preserve">
      <g>
        <g>
          <g>
            <path d="M505.755,240.855l-89.088-89.088c-4.437-4.437-9.109-8.491-13.824-12.501L144.773,397.335
              c34.432,19.328,72.789,29.227,111.232,29.227c58.197,0,116.373-22.165,160.661-66.453l89.088-89.088
              C514.096,262.679,514.096,249.196,505.755,240.855z M256.005,362.604c-11.776,0-21.333-9.557-21.333-21.333
              s9.557-21.333,21.333-21.333c35.285,0,64-28.715,64-64c0-11.776,9.557-21.333,21.333-21.333c11.776,0,21.333,9.557,21.333,21.333
              C362.672,314.753,314.821,362.604,256.005,362.604z"/>
            <path d="M95.344,151.767L6.256,240.855c-8.341,8.341-8.341,21.824,0,30.165l89.088,89.088c4.437,4.437,9.109,8.491,13.824,12.501
              L367.237,114.54C280.688,65.921,168.901,78.188,95.344,151.767z M256.005,191.937c-35.285,0-64,28.715-64,64
              c0,11.776-9.557,21.333-21.333,21.333s-21.333-9.557-21.333-21.333c0-58.816,47.851-106.667,106.667-106.667
              c11.776,0,21.333,9.557,21.333,21.333S267.781,191.937,256.005,191.937z"/>
          </g>
        </g>
      </g>
      </svg>
      </label>
      <label class='academic__sublist-checkbox academic__sublist-checkbox--favorite ${i.word === word ? 'active' : ''} ${i.disabled ? 'checked' : ''}'>
        <input type='checkbox' ${i.disabled ? 'checked' : ''} name=''>
        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
<g>
	<path d="M256,34.7L235.1,45L307,190.7c3.4,6.8,10,11.6,17.5,12.7l114.2,16.7l-82.6,80.5c-5.5,5.3-8,13.1-6.7,20.6l19.5,113.6
		l-102.1-53.7c-6.7-3.5-14.9-3.5-21.7,0l-102.1,53.7l19.5-113.6c1.3-7.5-1.2-15.3-6.7-20.6l-82.6-80.5l114.2-16.7
		c7.5-1.1,14.1-5.9,17.5-12.7L276.9,45L256,34.7L235.1,45L256,34.7l-20.9-10.3l-66.5,134.7L19.9,180.8c-8.7,1.3-16,7.4-18.8,15.8
		c-2.7,8.4-0.4,17.7,5.9,23.9l107.6,104.8L89.2,473.4c-1.5,8.7,2.1,17.6,9.3,22.8c7.1,5.2,16.7,5.9,24.5,1.8L256,428l133,69.9
		c7.8,4.1,17.4,3.4,24.5-1.8c7.1-5.2,10.8-14.1,9.3-22.8l-25.4-148.1L505,220.5c6.3-6.2,8.6-15.4,5.9-23.9
		c-2.7-8.4-10-14.6-18.8-15.8l-148.7-21.7L276.9,24.4c-3.9-7.9-12-13-20.9-13c-8.8,0-17,5.1-20.9,13L256,34.7z"/>
</g>
</svg>

      </label>
      <span>${i.word}</span>
      </li>`
      )
      .join('');

    const navButtonsHTML = `<button class='btn-nav btn-prev'>Prev</button><button class='btn-nav btn-next'>Next</button>`;

    document.querySelector('.app__main').innerHTML = `
    <div class='academic'>
      <div class="academic__header">
        <h1 class='academic__word' style="color: ${colorSelected}">
            &ldquo;${word}&rdquo;
        </h1>
        <div class="academic__actions">
            <button class="btn-favorite">Favorite</button>
            <button class="btn-remembered">Remembered</button>
        </div>
      </div>
      <div class='academic__sublist ${settings.showCheckbox ? 'show-checkbox' : ''}'>
        <header>
          <h4 class='academic__sublist-title'><strong>Sublist:</strong> ${sublist} (${fullWordlist.filter((e) => e.sublist === sublist).length} words)</h4>
          <button class='academic__sublist-btn tooltip'>
            <i class="gg-list"></i>
            <i class="gg-close-r"></i>
            <span class="tooltiptext tooltiptext--open">
              Show list of words
            </span>
          </button>
          <button class="academic__sublist-btn academic__sublist-reset tooltip" style="visibility: ${wordlist.filter((e) => e.sublist === sublist && e.disabled === true).length > 0 ? 'visible' : 'hidden'}">
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
      <div class="academic__nav">
        ${navButtonsHTML}
      </div>
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
        const element = showingMode === 'sublist' ? wordlist.find((i) => i.word === text) : fullWordlist.find((i) => i.word === text);
        currentWordIndex = showingMode === 'sublist' ? wordlist.indexOf(element) : fullWordlist.indexOf(element);
        console.log(currentWordIndex);
        let { word, phonetics, meanings, sublist } = element;
        renderData(word, phonetics, meanings, sublist);
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

        !fullWordlist.filter((e) => e.sublist === sublist && e.disabled === true).length ? (document.querySelector('.academic__sublist-reset').style.visibility = 'hidden') : (document.querySelector('.academic__sublist-reset').style.visibility = 'visible');

        localStorage.ACADEMIC_WORDLIST = JSON.stringify(fullWordlist);
      });
    });

    document.querySelector('.btn-remembered').addEventListener('click', function (e) {
      e.preventDefault();
      const totalIndex = fullWordlist.indexOf(wordlist[currentWordIndex]);
      if (fullWordlist[totalIndex].disabled) {
        fullWordlist[totalIndex].disabled = false;
      } else {
        fullWordlist[totalIndex].disabled = true;
      }
      localStorage.ACADEMIC_WORDLIST = JSON.stringify(fullWordlist);
      document.querySelector(`.academic__sublist li[data-value=${word}]`).classList.toggle('remembered');
    });

    document.querySelector('.academic__sublist-btn').addEventListener('click', function (e) {
      e.preventDefault();
      this.classList.toggle('active');
      document.querySelector('.academic__sublist').classList.toggle('active');
    });

    document.querySelector('.academic__sublist-reset').addEventListener('click', function (e) {
      confirmShow('Are you sure to uncheck all the words?', function () {
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
      });
    });

    function checkDisabledButtons() {
      if (showingMode === 'sublist' ) {
        if (currentWordIndex === wordlist.length - 1) {
          document.querySelector('.btn-next').classList.add('disabled');
        } else {
          document.querySelector('.btn-next').classList.remove('disabled');
        }
        if (wordlist[0].word === word) {
          document.querySelector('.btn-prev').classList.add('disabled');
        } else {
          document.querySelector('.btn-prev').classList.remove('disabled');
        }
      } else {
        if (currentWordIndex === fullWordlist.length - 1) {
          document.querySelector('.btn-next').classList.add('disabled');
        } else {
          document.querySelector('.btn-next').classList.remove('disabled');
        }
        if (fullWordlist[0].word === word) {
          document.querySelector('.btn-prev').classList.add('disabled');
        } else {
          document.querySelector('.btn-prev').classList.remove('disabled');
        }
      }
    }

    document.querySelector('.btn-prev').addEventListener('click', function (e) {
      e.preventDefault();
      if (this.classList.contains('disabled')) return;
      currentWordIndex--;
      console.log(currentWordIndex);
      let { word, phonetics, meanings, sublist } = showingMode === 'sublist' ? wordlist[currentWordIndex] : fullWordlist[currentWordIndex];
      renderData(word, phonetics, meanings, sublist);
    });
    document.querySelector('.btn-next').addEventListener('click', function (e) {
      e.preventDefault();
      if (this.classList.contains('disabled')) return;
      currentWordIndex++;
      console.log(currentWordIndex);
      let { word, phonetics, meanings, sublist } = showingMode === 'sublist' ? wordlist[currentWordIndex] :  fullWordlist[currentWordIndex];
      renderData(word, phonetics, meanings, sublist);
    });

    checkDisabledButtons();
  };

  inlineStyle();
  renderData(word, phonetics, meanings, sublist);
};

export default main;
