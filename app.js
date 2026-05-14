const STORAGE_KEY = 'sei-kanji-pwa-state-v1';
const START_BGM_SRC = './assets/audio/start-bgm.mp3';

const app = document.querySelector('#app');
const audio = new Audio();
const bgm = new Audio(START_BGM_SRC);
bgm.loop = true;
bgm.volume = 0.46;

let data = null;
let state = {
  screen: 'start',
  index: 0,
  revealed: false,
  learned: [],
  musicOn: false,
};

init();

async function init() {
  data = await fetch('./data/words.json', { cache: 'no-cache' }).then((response) => response.json());
  state = { ...state, ...loadState() };
  render();
  registerServiceWorker();
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setScreen(screen) {
  state.screen = screen;
  state.revealed = false;
  saveState();
  render();
}

function setStudyIndex(index) {
  state.index = Math.max(0, Math.min(index, data.words.length - 1));
  state.screen = 'study';
  state.revealed = false;
  saveState();
  render();
}

async function playAudio(src) {
  if (!src) return;
  audio.pause();
  audio.src = src;
  audio.currentTime = 0;
  await audio.play().catch(() => {});
}

async function toggleStartMusic() {
  state.musicOn = !state.musicOn;
  saveState();
  await syncStartMusic();
  render();
}

async function syncStartMusic() {
  if (state.screen === 'start' && state.musicOn) {
    await bgm.play().catch(() => {
      state.musicOn = false;
      saveState();
    });
    return;
  }

  bgm.pause();
  bgm.currentTime = 0;
}

function currentWord() {
  return data.words[state.index] || data.words[0];
}

function goTo(offset) {
  state.index = (state.index + offset + data.words.length) % data.words.length;
  state.revealed = false;
  saveState();
  render();
}

function toggleLearned(wordId) {
  const learned = new Set(state.learned);
  if (learned.has(wordId)) {
    learned.delete(wordId);
  } else {
    learned.add(wordId);
  }
  state.learned = [...learned];
  saveState();
  render();
}

function resetProgress() {
  state.index = 0;
  state.revealed = false;
  state.learned = [];
  saveState();
  render();
}

function render() {
  if (!data) return;
  app.dataset.screen = state.screen;
  app.innerHTML = state.screen === 'start'
    ? renderStart()
    : state.screen === 'review'
      ? renderReview()
      : state.screen === 'settings'
        ? renderSettings()
        : renderStudy();
  bindEvents();
  void syncStartMusic();
}

function renderStart() {
  return `
    <section class="start-screen">
      <div class="start-shade"></div>
      <nav class="start-top-actions" aria-label="开始菜单">
        <button class="asset-menu-button" data-action="start" type="button" aria-label="开始游戏">
          <img src="./assets/menu/start.png" alt="" />
        </button>
        <button class="asset-menu-button" data-action="review" type="button" aria-label="单词复习">
          <img src="./assets/menu/review.png" alt="" />
        </button>
        <button class="asset-menu-button ${state.musicOn ? 'playing' : ''}" data-action="music" type="button" aria-label="${state.musicOn ? '关闭音乐' : '播放音乐'}" aria-pressed="${state.musicOn}">
          <img src="./assets/menu/music.png" alt="" />
        </button>
        <button class="asset-menu-button" data-action="settings" type="button" aria-label="设置">
          <img src="./assets/menu/settings.png" alt="" />
        </button>
      </nav>
    </section>
  `;
}

function renderStudy() {
  const word = currentWord();
  const learned = state.learned.includes(word.id);
  const progress = Math.round(((state.index + 1) / data.words.length) * 100);
  return `
    <section class="study-screen">
      <header class="study-topbar">
        <button class="text-button" data-action="home" type="button">首页</button>
        <div>
          <strong>${data.unit.title} 字词卡</strong>
          <span>${state.index + 1} / ${data.words.length}</span>
        </div>
        <button class="text-button" data-action="review" type="button">复习</button>
      </header>

      <div class="progress-bar" aria-hidden="true">
        <i style="width: ${progress}%"></i>
      </div>

      <article class="word-card">
        <p class="card-label">今日单词</p>
        <h2>${word.kanji}</h2>
        <p class="kana">${word.kana}</p>
        <p class="romaji">${word.romaji}</p>

        <div class="audio-row">
          <button data-action="word-audio" type="button">播放单词</button>
          <button data-action="sentence-audio" type="button">播放例句</button>
        </div>

        <div class="answer ${state.revealed ? 'visible' : ''}">
          <strong>${word.meaning}</strong>
          <p>${word.note}</p>
        </div>

        <button class="reveal-button" data-action="reveal" type="button">
          ${state.revealed ? '收起释义' : '查看释义'}
        </button>
      </article>

      <section class="example-card">
        <span>例句</span>
        <p>${word.example}</p>
        <small>${word.exampleCn}</small>
      </section>

      <footer class="study-actions">
        <button data-action="prev" type="button">上一个</button>
        <button class="${learned ? 'marked' : ''}" data-action="learned" type="button">
          ${learned ? '已标记' : '标记会了'}
        </button>
        <button data-action="next" type="button">下一个</button>
      </footer>
    </section>
  `;
}

function renderReview() {
  const learnedSet = new Set(state.learned);
  const learnedWords = data.words.filter((word) => learnedSet.has(word.id));
  const reviewWords = learnedWords.length ? learnedWords : data.words;
  const scopeLabel = learnedWords.length ? '已标记' : '全部单词';

  return `
    <section class="review-screen">
      <header class="study-topbar">
        <button class="text-button" data-action="home" type="button">首页</button>
        <div>
          <strong>单词复习</strong>
          <span>${scopeLabel} · ${reviewWords.length} 个</span>
        </div>
        <button class="text-button" data-action="reset" type="button">重置</button>
      </header>

      <section class="review-hero">
        <p class="card-label">REVIEW</p>
        <h2>${state.learned.length}/${data.words.length}</h2>
        <p>${learnedWords.length ? '复习已标记的单词' : '还没有标记，先复习全部单词'}</p>
      </section>

      <div class="review-list">
        ${reviewWords.map((word) => {
          const index = data.words.findIndex((item) => item.id === word.id);
          const learned = learnedSet.has(word.id);
          return `
            <button class="review-item ${learned ? 'learned' : ''}" data-action="open-word" data-index="${index}" type="button">
              <span class="review-kanji">${word.kanji}</span>
              <span class="review-kana">${word.kana}</span>
              <small>${word.meaning}</small>
            </button>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

function renderSettings() {
  return `
    <section class="settings-screen">
      <header class="study-topbar">
        <button class="text-button" data-action="home" type="button">首页</button>
        <div>
          <strong>设置</strong>
          <span>声音与进度</span>
        </div>
        <button class="text-button" data-action="review" type="button">复习</button>
      </header>

      <section class="settings-card">
        <p class="card-label">SETTINGS</p>
        <h2>学习设置</h2>
        <button class="setting-action" data-action="intro" type="button">试听单词总览</button>
        <button class="setting-action danger" data-action="reset" type="button">清空学习标记</button>
        <p>当前词库：${data.words.length} 个「生」字相关单词。</p>
      </section>
    </section>
  `;
}

function bindEvents() {
  app.querySelectorAll('[data-action]').forEach((element) => {
    element.addEventListener('click', async () => {
      const action = element.dataset.action;
      const word = currentWord();
      if (action === 'start') {
        setScreen('study');
        await playAudio(currentWord().wordAudio);
      }
      if (action === 'review') setScreen('review');
      if (action === 'settings') setScreen('settings');
      if (action === 'music') await toggleStartMusic();
      if (action === 'intro') await playAudio(data.unit.introAudio);
      if (action === 'home') setScreen('start');
      if (action === 'reset') resetProgress();
      if (action === 'open-word') {
        setStudyIndex(Number(element.dataset.index));
        await playAudio(currentWord().wordAudio);
      }
      if (action === 'word-audio') await playAudio(word.wordAudio);
      if (action === 'sentence-audio') await playAudio(word.sentenceAudio);
      if (action === 'reveal') {
        state.revealed = !state.revealed;
        saveState();
        render();
      }
      if (action === 'learned') toggleLearned(word.id);
      if (action === 'prev') goTo(-1);
      if (action === 'next') goTo(1);
    });
  });
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
