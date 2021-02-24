import {
    ACADEMIC_WORDLIST_ENDPOINT
} from "./module/datafetching.js";

const wordListSettings = async () => {
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

    const renderData = (sublist) => {
        const sublistHTML = wordlist.filter((e) => e.sublist === sublist).map((i) => `<li><span>${i.word}</span> <label><input type="checkbox" /></label> <label><input type="checkbox" name='showOnList'/></label></li>`).join("");
        document.querySelector('.settings-word-list__words').innerHTML = sublistHTML;
    }
    
    document.querySelector('#sublist-selector').addEventListener('change', (e) => {
        renderData(parseInt(e.target.value));
    });

    renderData(1);
    
};

wordListSettings();