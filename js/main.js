import { loadQuestions } from './data.js';
import { renderProblem } from './renderer.js';
import { validateProblem } from './utils.js';

const app = document.getElementById('app');

const state = {
  problem: null,
  selection: '',
  answer: { correct_discards: [], explanation: '' }
};

function mount() {
  if (!state.problem) return;
  app.innerHTML = `<pre>${renderProblem(state.problem, state)}</pre>`;
  bindChoices();
}

function bindChoices() {
  app.querySelectorAll('a[data-discard]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      state.selection = link.dataset.discard || '';
      mount();
    });
  });
}

async function init() {
  try {
    const { problems } = await loadQuestions();
    const first = problems?.[0];
    if (!first) {
      app.textContent = '暂无题目数据。';
      return;
    }

    state.problem = first.problem;
    state.answer = first.answer;

    if (!validateProblem(state.problem)) {
      app.textContent = '题目数据格式异常：总牌数校验不通过。';
      return;
    }

    mount();
  } catch (error) {
    app.textContent = `初始化失败：${error.message}`;
  }
}

init();
