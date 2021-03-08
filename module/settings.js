const settings = async () => {
  let settings = {
    color: "#2dbe60",
    sublist: "0",
    quizSublist: "0",
    amount: "10",
    showCheckbox: false
  };

  if (localStorage.ACADEMIC_WORDLIST_SETTINGS) {
    settings = JSON.parse(localStorage.ACADEMIC_WORDLIST_SETTINGS);
  }

  const sublistSelected = parseInt(settings.sublist) > 0 ? parseInt(settings.sublist) : 0;
  const colorSelected = settings.color ? settings.color : "#2dbe60";
  document.querySelector("#sublist-selector").getElementsByTagName('option')[sublistSelected].selected = 'selected'
  document.querySelector("#color-selector").value = colorSelected;

  document.querySelector("#settings-form").addEventListener('submit', function (e) {
    e.preventDefault();
    settings.sublist = document.querySelector("#sublist-selector").value;
    settings.color = document.querySelector("#color-selector").value;
    localStorage.ACADEMIC_WORDLIST_SETTINGS = JSON.stringify(settings);
  });

  document.querySelector("#color-reset").addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector("#color-selector").value = "#2dbe60";
    settings.color = "#2dbe60";
  });

};
export { settings } ;