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
  const AUDIO_ICON = "\u{1F50A}";
  const ERROR_ICON = "\u{274C}";
  const LOADING_ICON = "\u{23F3}";
  const AUDIO_LISTEN_LABEL = `${AUDIO_ICON} Listen`;
  const AUDIO_PLAYING_LABEL = `${AUDIO_ICON} Playing...`;
  const AUDIO_LOADING_LABEL = `${LOADING_ICON} Loading...`;
  const AUDIO_NOT_SUPPORTED_LABEL = `${ERROR_ICON} Not supported`;
  const AUDIO_ERROR_LABEL = `${ERROR_ICON} Error`;
  
  // Load known words from localStorage
  let knownWords = JSON.parse(localStorage.getItem('knownWords') || '[]');
  
  // Filter out known words
  const unknownWords = fullWordlist.filter(w => !knownWords.includes(w.word));
  
  // Use unknownWords as base, then apply sublist filter
  let displayWordlist = unknownWords;
  if (sublistSelected > 0) {
    displayWordlist = unknownWords.filter((e) => e.sublist === sublistSelected);
  }

  const randomize = () => {
    return Math.floor(Math.random() * displayWordlist.length);
  };

  const inlineStyle = () => {
    var css = `.academic__sublist ul:before {border-bottom-color: ${colorSelected};}
    .academic__sublist.active header {color: ${colorSelected}}
    .audio-btn {background: ${colorSelected}}
    .audio-btn:hover {background: ${colorSelected}; opacity: 0.85}
    .known-btn {color: ${colorSelected}; border-color: ${colorSelected}; background: white}
    .known-btn:hover {background: ${colorSelected}; color: white}
    .academic__word {color: ${colorSelected}}
    .academic__stats a {color: ${colorSelected}}`,
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
  } = displayWordlist[randomize()];

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
        <button class="audio-btn" data-word="${word}" data-ipa="${e.text}" data-idx="${idx}">${AUDIO_LISTEN_LABEL}</button>
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
      <div class='academic__header'>
        <h1 class='academic__word' style="color: ${colorSelected}">
           &ldquo;${word}&rdquo;
        </h1>
        <button class="known-btn" id="knownBtn" data-word="${word}">Got it!</button>
      </div>
      <div class='academic__stats'>
        <span><a href="known.html">Known: ${knownWords.length}</a></span>
        <span>Remaining: ${unknownWords.length}</span>
      </div>
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
      
      // Update wordlist based on selection (excluding known words)
      if (selectedSublist === 0) {
        displayWordlist = unknownWords;
      } else {
        displayWordlist = unknownWords.filter((e) => e.sublist === selectedSublist);
      }
      
      // Pick new random word from filtered list
      const newWord = displayWordlist[Math.floor(Math.random() * displayWordlist.length)];
      renderData(newWord.word, newWord.phonetics, newWord.meanings, newWord.sublist);
    });

    // Handle "Mark as known" button
    document.getElementById('knownBtn').addEventListener('click', function() {
      const wordToMark = this.getAttribute('data-word');
      
      // Add to known words
      if (!knownWords.includes(wordToMark)) {
        knownWords.push(wordToMark);
        localStorage.setItem('knownWords', JSON.stringify(knownWords));
      }
      
      // Show next word
      if (displayWordlist.length > 1) {
        const newWord = displayWordlist[Math.floor(Math.random() * displayWordlist.length)];
        renderData(newWord.word, newWord.phonetics, newWord.meanings, newWord.sublist);
      } else {
        alert('Congratulations! You have learned all words in this list!');
      }
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
          this.textContent = AUDIO_NOT_SUPPORTED_LABEL;
          return;
        }
        
        // If currently playing, don't allow any click
        if (isPlaying) {
          return;
        }
        
        isPlaying = true;
        this.textContent = AUDIO_LOADING_LABEL;
        
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
          this.textContent = AUDIO_PLAYING_LABEL;
        };
        
        utterThis.onend = () => {
          this.textContent = AUDIO_LISTEN_LABEL;
          isPlaying = false;
        };
        
        utterThis.onerror = (e) => {
          console.error('Speech error:', e);
          this.textContent = AUDIO_ERROR_LABEL;
          isPlaying = false;
          setTimeout(() => { this.textContent = AUDIO_LISTEN_LABEL; }, 2000);
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
