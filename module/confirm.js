const confirmShow = (messenger = 'Are you sure?', yesCallback, cancelCallback) => {
    const confirmBox = `<div class="dialogBox" id="dialogBox">
  <p>${messenger}</p>
  <div class="controls">
  <input type="button" value="Cancel" id="confirm-cancel">
  <input type="button" value="Yes" id="confirm-yes">
  </div>
</div>`;

    document.querySelector('body').insertAdjacentHTML('beforeend', confirmBox);
    document.querySelector('body').classList.add('showModal');

    var dialogBox = document.getElementById('dialogBox'),
      yesButton = document.getElementById('confirm-yes'),
      cancelButton = document.getElementById('confirm-cancel');

    yesButton.onclick = function () {
      typeof yesCallback === 'function' && yesCallback();
      dialogBox.remove();
      document.querySelector('body').classList.remove('showModal');
    };

    cancelButton.onclick = function () {
      typeof cancelCallback === 'function' && cancelCallback();
      dialogBox.remove();
      document.querySelector('body').classList.remove('showModal');
    };
  }

  export { confirmShow } ;