import { loadQuestions } from './data.js';
import { renderProblem } from './renderer.js';
import { validateProblem } from './utils.js';

// 应用根节点：所有文本内容都渲染到这个容器。
const app = document.getElementById('app');

// 轻量状态：只保存当前题目、用户所选切牌、以及答案信息。
const state = {
  problems: [],
  currentIndex: 0,
  problem: null,
  selection: '',
  answer: { correct_discards: [], explanation: '' }
};

// 统一挂载函数：每次状态变化后都重新渲染一次文本界面。
function mount() {
  if (!state.problem) return;
  app.innerHTML = `<pre>${renderProblem(state.problem, state)}</pre>`;
  bindChoices();
  bindNavigation();
  bindJump();
}

// 绑定所有可点击手牌链接（data-discard），点击即视为切出该牌。
function bindChoices() {
  app.querySelectorAll('a[data-discard]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      state.selection = link.dataset.discard || '';
      mount();
    });
  });
}


function jumpToProblem(inputValue) {
  const targetNumber = Number.parseInt(inputValue, 10);
  if (!Number.isInteger(targetNumber)) return;

  const nextIndex = targetNumber - 1;
  const next = state.problems[nextIndex];
  if (!next) return;

  state.currentIndex = nextIndex;
  state.problem = next.problem;
  state.answer = next.answer;
  state.selection = '';
  mount();
}

// 绑定题目切换链接：支持上一题 / 下一题并重新渲染。
function bindNavigation() {
  app.querySelectorAll('a[data-nav]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const direction = link.dataset.nav;
      const nextIndex = direction === 'prev' ? state.currentIndex - 1 : state.currentIndex + 1;
      const next = state.problems[nextIndex];
      if (!next) return;

      state.currentIndex = nextIndex;
      state.problem = next.problem;
      state.answer = next.answer;
      state.selection = '';
      mount();
    });
  });
}



function bindJump() {
  const input = app.querySelector('input[data-jump-input]');
  const button = app.querySelector('button[data-jump-button]');
  if (!input || !button) return;

  button.addEventListener('click', () => {
    jumpToProblem(input.value);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    jumpToProblem(input.value);
  });
}
// 初始化流程：加载数据 -> 取第一题 -> 校验 -> 首次渲染。
async function init() {
  try {
    const { problems } = await loadQuestions();
    const first = problems?.[0];
    if (!first) {
      app.textContent = '暂无题目数据。';
      return;
    }

    state.problems = problems;
    state.currentIndex = 0;
    state.problem = first.problem;
    state.answer = first.answer;

    // 先做最基础的牌数一致性检查，避免脏数据进入渲染逻辑。
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
