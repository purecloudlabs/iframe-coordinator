import component from "iframe-coordinator/client.js";

let worker = component.start();

const TOAST_LEVELS = ['info', 'success', 'error']

document.addEventListener('DOMContentLoaded', () => {
  let toastBtnEl = document.querySelector('button.toast');
  toastBtnEl.addEventListener('click', () => {
    let options = {
      title: 'Hello iframe World',
      // Custom, App-specific props here
      custom: {
        level: TOAST_LEVELS[Math.round(Math.random() * 2)]
      }
    };

    worker.requestToast(`From ${toastBtnEl.getAttribute('data-component-name')}`, options);
  });
});

