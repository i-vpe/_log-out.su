const dialog = document.querySelector('[data-dialog]');
document.querySelectorAll('[data-dialog-open]').forEach((button) => button.addEventListener('click', () => dialog.showModal()));
document.querySelector('[data-dialog-close]').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
document.querySelector('[data-request-form]').addEventListener('submit', (event) => {
  event.preventDefault();
  const note = document.querySelector('[data-form-note]');
  note.textContent = 'Заявка не отправлена: локальная версия не подключена к обработчику данных.';
});
