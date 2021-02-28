import {
  ACADEMIC_WORDLIST_ENDPOINT
} from './datafetching.js';

import {
  confirmShow
} from './confirm.js';

const quiz = async () => {
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
  const settings = JSON.parse(localStorage.ACADEMIC_WORDLIST_SETTINGS);

  const quizSublistSelected = parseInt(settings.quizSublist) > 0 ? parseInt(settings.quizSublist) : 0;
  const amountSelected = parseInt(settings.amount) > 0 ? parseInt(settings.amount) : 0;
  document.querySelector("#amount-selector").querySelector(`option[value='${amountSelected}']`).selected = 'selected';
  document.querySelector("#sublist-selector").getElementsByTagName('option')[quizSublistSelected].selected = 'selected';

  document.querySelector('#quiz-settings-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const amount = this.querySelector("#amount-selector").value;
    const quizSublist = this.querySelector("#sublist-selector").value;
    settings.amount = amount;
    settings.quizSublist = quizSublist;

    function resetQuiz() {
      localStorage.ACADEMIC_WORDLIST_SETTINGS = JSON.stringify(settings);
      localStorage.removeItem('QUIZ_WORDLIST');
      localStorage.removeItem('QUIZ_REVIEW');
      chrome.tabs.reload();
    }

    if (localStorage.QUIZ_REVIEW && JSON.parse(localStorage.QUIZ_REVIEW).length > 0 && JSON.parse(localStorage.QUIZ_REVIEW).length !== parseInt(amount)) {
      confirmShow(
        "Are you sure to play again? The current quiz will be reset.",
        function() {
          resetQuiz()
        }
      );
    } else {
      resetQuiz()
    }
  });

  let amount = parseInt(settings.amount);
  if (quizSublistSelected > 0) {
    wordlist = fullWordlist.filter((e) => e.sublist === quizSublistSelected);
  } else {
    wordlist = fullWordlist;
  }
  

  function getRandom(arr, n) {
    var result = new Array(n),
      len = arr.length,
      taken = new Array(len);
    if (n > len)
      throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
      var x = Math.floor(Math.random() * len);
      result[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
  }

  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    while (0 !== currentIndex) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }

  const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  };

  function isCyclic (obj) {
    var seenObjects = [];
  
    function detect (obj) {
      if (obj && typeof obj === 'object') {
        if (seenObjects.indexOf(obj) !== -1) {
          return true;
        }
        seenObjects.push(obj);
        for (var key in obj) {
          if (obj.hasOwnProperty(key) && detect(obj[key])) {
            console.log(obj, 'cycle at ' + key);
            return true;
          }
        }
      }
      return false;
    }
  
    return detect(obj);
  }

  const clone = (obj) => Object.assign({}, obj);
  const renameKey = (object, key, newKey) => {
    const clonedObj = clone(object);
    const targetKey = clonedObj[key];
    delete clonedObj[key];
    clonedObj[newKey] = targetKey;
    return clonedObj;
  };

  let quizWordList;
  let reviewList;

  const quizInit = () => {
    if (localStorage.QUIZ_WORDLIST) {
      quizWordList = JSON.parse(localStorage.QUIZ_WORDLIST);
    } else {
      quizWordList = getRandom(wordlist, amount);
      quizWordList= JSON.parse(JSON.stringify(quizWordList));
      localStorage.QUIZ_WORDLIST = JSON.stringify(quizWordList);
    }

    if (localStorage.QUIZ_REVIEW) {
      reviewList = JSON.parse(localStorage.QUIZ_REVIEW);
    } else {
      reviewList = [];
      localStorage.QUIZ_REVIEW = JSON.stringify(reviewList);
    }
  }

  quizInit();

  const currentQuizIndex = quizWordList.findIndex((e) => e.randomWords === undefined);
  let count = currentQuizIndex === 0 ? 0 : currentQuizIndex === -1 ? quizWordList.length - 1 : currentQuizIndex - 1;
  let {
    word,
    meanings
  } = quizWordList[count];

 

  const renderData = (word, meanings) => {
    let randomRest;

    if (quizWordList[count].randomWords) {
      randomRest = quizWordList[count].randomWords;
    } else {
      randomRest = getRandom(wordlist.filter(e => e.word !== word), 3);
      randomRest= JSON.parse(JSON.stringify(randomRest));
      quizWordList[count].randomWords = randomRest;
      localStorage.QUIZ_WORDLIST = JSON.stringify(quizWordList);
    }

    const quizWords = [quizWordList[count], ...randomRest];
    shuffle(quizWords);
    const randomMeaning = getRandom(meanings, 1);
    const randomdefinition = getRandom(randomMeaning[0].definitions, 1)[0].definition;

    let quizItem;

    if (JSON.parse(localStorage.QUIZ_REVIEW)[count] === undefined) {
      quizItem = `<div class='quiz__item'><h3 class="quiz__definition"><strong>${count + 1}.</strong> &ldquo;${randomdefinition}&rdquo;</h3>
      ${ quizWords.map((e) => `<li class="quiz__answers-item" data-value=${e.word || e.wordName}><label>
      <input type="radio" name='quiz-word' value=${e.word || e.wordName} />
      <i class="gg-radio-checked"></i>
      <span>${e.word || e.wordName}</span>
    </label></li>`).join("")}</div>
      `
    } else {
      quizItem = JSON.parse(localStorage.QUIZ_REVIEW)[count]; 
    }

    document.querySelector('.academic').innerHTML = `
      <div class="quiz">
        <div class="quiz__body">
          <h1>Quiz</h1>
          <p>Please choose the best answer with the definition.</p>
          ${quizItem}
        </div>
        <div class="quiz__footer">
          <button class='btn-next' style='display: ${count === amount - 1 || JSON.parse(localStorage.QUIZ_REVIEW)[count] === undefined ? 'none' : 'inline-block'}'>Next</button>
          <button class='btn-review' style='display: ${quizWordList[amount - 1].quizDefinition !== undefined ? 'inline-block' : 'none'}'>Review</button>
        </div>
        <div class='review-list'></div>
      </div>
   
  `;

    document.querySelectorAll('.quiz__answers-item input').forEach((item) => {
      item.addEventListener('change', function () {
        count < amount - 1 && (document.querySelector('.btn-next').style.display = 'inline-block');
        count === amount - 1 && (document.querySelector('.btn-review').style.display = 'inline-block');
        quizWordList[count].quizDefinition = randomdefinition;
        this.closest('li').classList.add('quiz__answers-item--selected');
        if (this.value === word) {
          document.querySelector('.quiz__definition').classList.add('correct');
          (quizWordList[count].isCorrect === undefined) && item.closest('label').insertAdjacentHTML('afterbegin', `
<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="442.533px" height="442.533px" viewBox="0 0 442.533 442.533" style="enable-background:new 0 0 442.533 442.533;"
	 xml:space="preserve">
<g>
	<path d="M434.539,98.499l-38.828-38.828c-5.324-5.328-11.799-7.993-19.41-7.993c-7.618,0-14.093,2.665-19.417,7.993L169.59,247.248
		l-83.939-84.225c-5.33-5.33-11.801-7.992-19.412-7.992c-7.616,0-14.087,2.662-19.417,7.992L7.994,201.852
		C2.664,207.181,0,213.654,0,221.269c0,7.609,2.664,14.088,7.994,19.416l103.351,103.349l38.831,38.828
		c5.327,5.332,11.8,7.994,19.414,7.994c7.611,0,14.084-2.669,19.414-7.994l38.83-38.828L434.539,137.33
		c5.325-5.33,7.994-11.802,7.994-19.417C442.537,110.302,439.864,103.829,434.539,98.499z"/>
</g></svg>
`);
          (quizWordList[count].isCorrect === undefined) && (quizWordList[count].isCorrect = true);
        } else {
          (quizWordList[count].isCorrect === undefined) && item.closest('label').insertAdjacentHTML('afterbegin', `
          <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
          width="249.499px" height="249.499px" viewBox="0 0 249.499 249.499" style="enable-background:new 0 0 249.499 249.499;"
          xml:space="preserve">
       <g>
         <path d="M7.079,214.851l25.905,26.276c9.536,9.674,25.106,9.782,34.777,0.252l56.559-55.761l55.739,56.548
           c9.542,9.674,25.112,9.782,34.78,0.246l26.265-25.887c9.674-9.536,9.788-25.106,0.246-34.786l-55.742-56.547l56.565-55.754
           c9.667-9.536,9.787-25.106,0.239-34.786L216.52,8.375c-9.541-9.667-25.111-9.782-34.779-0.252l-56.568,55.761L69.433,7.331
           C59.891-2.337,44.32-2.451,34.65,7.079L8.388,32.971c-9.674,9.542-9.791,25.106-0.252,34.786l55.745,56.553l-56.55,55.767
           C-2.343,189.607-2.46,205.183,7.079,214.851z"/>
       </g></svg>
      `);
          (quizWordList[count].isCorrect === undefined) && (quizWordList[count].isCorrect = false);
        }
        document.querySelectorAll('.quiz__answers-item').forEach((element) => {
          if (element.dataset.value === word) {
            element.classList.add('quiz__answers-item--correct');
          } else {
            const el = randomRest.find((e) => e.word === element.dataset.value),
            randomMeaning = getRandom(el.meanings, 1),
            randomdefinition = getRandom(randomMeaning[0].definitions, 1)[0].definition;
            element.insertAdjacentHTML('beforeend', `<p>${randomdefinition}</p>`);
            element.classList.add('quiz__answers-item--incorrect');
          }
          element.style.pointerEvents = 'none';
        });
        localStorage.QUIZ_WORDLIST = JSON.stringify(quizWordList);
        
        const quizItemClone = document.querySelector('.quiz__item').cloneNode(true);
        reviewList.push(quizItemClone.outerHTML);
        localStorage.QUIZ_REVIEW = JSON.stringify(reviewList);
      });
    });

    document.querySelector('.btn-next').addEventListener('click', function() {
      count++;
      renderData(quizWordList[count].word, quizWordList[count].meanings);
    });
    document.querySelector('.btn-review').addEventListener('click', function() {
      const reviewHTML = JSON.parse(localStorage.QUIZ_REVIEW).join("");
      document.querySelector('.quiz__body').innerHTML = '';
      this.remove();
      const scoreHTML = `<h1 class='quiz-score'><label>Score: </label><span class='quiz-score__correct'>${quizWordList.filter(e => e.isCorrect === true).length}</span> / <span class='quiz-score__total'>${quizWordList.length}</span></h1>`;
      document.querySelector('.review-list').insertAdjacentHTML('beforebegin', scoreHTML);
      document.querySelector('.review-list').innerHTML = reviewHTML;
    });
  };

  renderData(word, meanings);
};

export default quiz;