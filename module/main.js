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
    var css = `.academic__sublist ul:before {border-bottom-color: ${colorSelected};}
    .academic__sublist.active header {color: ${colorSelected}}
    .audio-btn {background: ${colorSelected}}
    .audio-btn:hover {background: ${colorSelected}; opacity: 0.85}`,
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
    // Filter unique IPA - keep first occurrence of each IPA
    const uniquePhonetics = phonetics.filter((item, index, self) => 
      index === self.findIndex((p) => p.text === item.text)
    );
    
    const phoneticsHTML = uniquePhonetics
      .map(
        (e, idx) => `
      <li class='academic__phonetics-item'>
        <p><strong>IPA:</strong><span>&nbsp;${e.text}</span></p>
        <button class="audio-btn" data-word="${word}" data-ipa="${e.text}" data-idx="${idx}">🔊 Listen</button>
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

    // Generate all sublists options
    const allSublists = [...new Set(fullWordlist.map(e => e.sublist))].sort((a, b) => a - b);
    const currentSublist = sublist || 0;
    const sublistOptions = allSublists.map(s => {
      const count = fullWordlist.filter(e => e.sublist === s).length;
      const selected = s === currentSublist ? 'selected' : '';
      return `<option value="${s}" ${selected}>Sublist ${s} (${count} words)</option>`;
    }).join('');

    // Filter words for sublist display - if sublist is 0 (All), show all words
    const displaySublist = currentSublist === 0 ? allSublists : [currentSublist];
    const sublistHTML = wordlist.filter(e => displaySublist.includes(e.sublist)).map((i) => `<li>${i.word}</li>`).join("");

    document.body.innerHTML = `
    <div class='academic'>
      <h1 class='academic__word' style="color: ${colorSelected}">
         &ldquo;${word}&rdquo;
      </h1>
      <div class='academic__sublist'>
        <header>
          <select class='academic__sublist-select' id="sublistSelect">
            ${sublistOptions}
          </select>
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

    // Handle sublist selection change
    document.getElementById('sublistSelect').addEventListener('change', function(e) {
      const selectedSublist = parseInt(e.target.value);
      
      // Update wordlist based on selection
      if (selectedSublist === 0) {
        wordlist = fullWordlist;
      } else {
        wordlist = fullWordlist.filter((e) => e.sublist === selectedSublist);
      }
      
      // Pick new random word from filtered list
      const newWord = wordlist[Math.floor(Math.random() * wordlist.length)];
      renderData(newWord.word, newWord.phonetics, newWord.meanings, newWord.sublist);
    });

    // Toggle sublist visibility
    document.querySelector('.academic__sublist-btn').addEventListener('click', function(e) {
      e.preventDefault();
      this.classList.toggle('active');
      document.querySelector('.academic__sublist').classList.toggle('active');
    });

    document.querySelectorAll('.academic__sublist li').forEach(item => {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        const text = this.innerText;
        const element = wordlist.find(i => i.word === text);
        renderData(element.word, element.phonetics, element.meanings, element.sublist);
      });
    });

    // Audio playback handler using Web Speech API
    let isPlaying = false;
    document.querySelectorAll('.audio-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const word = this.getAttribute('data-word');
        
        // Check if speech synthesis is available
        if (!window.speechSynthesis) {
          this.textContent = '❌ Not supported';
          return;
        }
        
        // If currently playing, don't allow any click
        if (isPlaying) {
          return;
        }
        
        isPlaying = true;
        this.textContent = '⏳ Loading...';
        
        const utterThis = new SpeechSynthesisUtterance(word);
        utterThis.lang = 'en-US';
        utterThis.rate = 0.9;
        
        // Try to find a good English voice
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => v.lang.startsWith('en-US')) || 
                        voices.find(v => v.lang.startsWith('en-GB')) ||
                        voices.find(v => v.lang.startsWith('en'));
        if (enVoice) {
          utterThis.voice = enVoice;
        }
        
        utterThis.onstart = () => {
          this.textContent = '🔊 Playing...';
        };
        
        utterThis.onend = () => {
          this.textContent = '🔊 Listen';
          isPlaying = false;
        };
        
        utterThis.onerror = (e) => {
          console.error('Speech error:', e);
          this.textContent = '❌ Error';
          isPlaying = false;
          setTimeout(() => { this.textContent = '🔊 Listen'; }, 2000);
        };
        
        // Load voices first if not available
        if (voices.length === 0) {
          window.speechSynthesis.addEventListener('voiceschanged', () => {
            const updatedVoices = window.speechSynthesis.getVoices();
            const updatedEnVoice = updatedVoices.find(v => v.lang.startsWith('en-US')) || 
                                   updatedVoices.find(v => v.lang.startsWith('en-GB'));
            if (updatedEnVoice) {
              utterThis.voice = updatedEnVoice;
            }
            window.speechSynthesis.speak(utterThis);
          }, { once: true });
        } else {
          window.speechSynthesis.speak(utterThis);
        }
      });
    });

  };

  inlineStyle();
  renderData(word, phonetics, meanings, sublist);

};

export default main;