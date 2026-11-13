const guide = document.getElementById('guide');
const openGuide = document.getElementById('open-guide');
const questSearch = document.getElementById('quest-search');
const questEntries = [...guide.querySelectorAll('[data-quest]')];
const emptyResult = document.getElementById('quest-empty');
const viewButtons = [...guide.querySelectorAll('[data-guide-view]')];
const chapterButtons = [...guide.querySelectorAll('[data-chapter]')];
const chapterKey = 'langbian-guide-current-chapter';

openGuide.addEventListener('click', () => guide.showModal());
let pressedOutsideGuide = false;
guide.addEventListener('pointerdown', event => {
  pressedOutsideGuide = isOutsideGuide(event);
});
guide.addEventListener('click', event => {
  if (pressedOutsideGuide && isOutsideGuide(event)) guide.close();
  pressedOutsideGuide = false;
});

function isOutsideGuide(event) {
  if (event.target !== guide) return false;
  const { left, right, top, bottom } = guide.getBoundingClientRect();
  return event.clientX < left || event.clientX >= right
    || event.clientY < top || event.clientY >= bottom;
}

for (const element of [guide, openGuide]) {
  for (const eventName of ['keydown', 'keyup', 'mousedown', 'pointerdown', 'pointerup', 'touchend']) {
    element.addEventListener(eventName, event => event.stopPropagation());
  }
}
guide.addEventListener('close', () => {
  const canvas = document.getElementById('nostalgist-canvas');
  if (canvas.tabIndex >= 0) canvas.focus();
});

function showView(view) {
  for (const option of viewButtons) {
    const selected = option.dataset.guideView === view;
    option.setAttribute('aria-pressed', String(selected));
    document.getElementById(option.dataset.guideView).hidden = !selected;
  }
  guide.scrollTop = 0;
}

for (const button of viewButtons) {
  button.addEventListener('click', () => showView(button.dataset.guideView));
}

function normalizeSearch(value) {
  return value.toLocaleLowerCase('vi').normalize('NFD')
    .replace(/\p{M}/gu, '').replaceAll('đ', 'd').trim();
}

function filterChapters() {
  const terms = normalizeSearch(questSearch.value).split(/\s+/);
  for (const entry of questEntries) {
    const text = normalizeSearch(entry.textContent);
    entry.hidden = !terms.every(term => text.includes(term));
  }
  emptyResult.hidden = questEntries.some(entry => !entry.hidden);
}

questSearch.addEventListener('input', filterChapters);

function markChapter(id) {
  for (const button of chapterButtons) {
    button.textContent = 'chuong-' + button.dataset.chapter === id
      ? 'Tiếp tục đọc phần này'
      : 'Mở hướng dẫn phần này';
  }
}

markChapter(localStorage.getItem(chapterKey));

for (const chapter of questEntries) {
  const details = chapter.querySelector('details');
  details.addEventListener('toggle', () => {
    if (!details.open) return;
    localStorage.setItem(chapterKey, chapter.id);
    markChapter(chapter.id);
  });
}

for (const button of chapterButtons) {
  button.addEventListener('click', () => {
    questSearch.value = '';
    filterChapters();
    showView('quests');
    const chapter = document.getElementById('chuong-' + button.dataset.chapter);
    const details = chapter.querySelector('details');
    details.open = true;
    chapter.scrollIntoView({ block: 'start' });
    details.querySelector('summary').focus({ preventScroll: true });
  });
}
