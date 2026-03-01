import { ACADEMIC_WORDLIST_ENDPOINT } from "./datafetching.js";

const getKnownWords = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem("knownWords") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading knownWords:", error);
    return [];
  }
};

const getWordlist = async () => {
  try {
    if (localStorage.ACADEMIC_WORDLIST) {
      const cached = JSON.parse(localStorage.ACADEMIC_WORDLIST);
      if (Array.isArray(cached)) {
        return cached;
      }
    }
  } catch (error) {
    console.error("Error reading cached wordlist:", error);
  }

  const res = await fetch(ACADEMIC_WORDLIST_ENDPOINT, {
    headers: {
      accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status}`);
  }

  const wordlist = await res.json();
  localStorage.ACADEMIC_WORDLIST = JSON.stringify(wordlist);
  return Array.isArray(wordlist) ? wordlist : [];
};

const knownPage = async () => {
  const knownPageElement = document.getElementById("knownPage");
  const loadingElement = document.getElementById("loading");
  const knownCountElement = document.getElementById("knownCount");
  const knownListElement = document.getElementById("knownList");

  let knownWords = getKnownWords();
  let wordlist = [];

  try {
    wordlist = await getWordlist();
  } catch (error) {
    console.error("Error reading wordlist:", error);
  }

  if (wordlist.length === 0) {
    knownCountElement.textContent = "0";
    knownListElement.innerHTML =
      '<p class="no-words">Error: Could not load wordlist. Please visit index.html first.</p>';
    loadingElement.hidden = true;
    knownPageElement.hidden = false;
    return;
  }

  const knownWordsLower = knownWords.map((w) => w.toLowerCase().trim());
  const knownDetails = wordlist
    .filter((w) => knownWordsLower.includes(w.word.toLowerCase().trim()))
    .sort((a, b) => {
      if (a.sublist !== b.sublist) {
        return a.sublist - b.sublist;
      }
      return a.word.localeCompare(b.word);
    });

  knownCountElement.textContent = String(knownWords.length);

  if (knownDetails.length === 0) {
    knownListElement.innerHTML =
      '<p class="no-words">No words marked as known yet.</p>';
  } else {
    knownListElement.innerHTML = knownDetails
      .map(
        (w) => `
          <div class="known-item">
            <span class="known-word">${w.word}</span>
            <span class="known-sublist">Sublist ${w.sublist}</span>
            <button class="remove-known" data-word="${w.word}" aria-label="Remove from known" title="Remove from known">&times;</button>
          </div>
        `
      )
      .join("");
  }

  document.querySelectorAll(".remove-known").forEach((btn) => {
    btn.addEventListener("click", function () {
      const wordToRemove = this.getAttribute("data-word");
      knownWords = knownWords.filter((w) => w !== wordToRemove);
      localStorage.setItem("knownWords", JSON.stringify(knownWords));
      location.reload();
    });
  });

  loadingElement.hidden = true;
  knownPageElement.hidden = false;
};

export default knownPage;
