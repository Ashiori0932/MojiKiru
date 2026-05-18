import { loadQuestions } from './data.js';
import { renderProblem } from './renderer.js';
import { validateProblem } from './utils.js';

// 应用根节点：所有文本内容都渲染到这个容器。
const app = document.getElementById('app');

// 轻量状态：只保存当前题目、用户所选切牌、以及答案信息。
const state = {
  problem: null,
  selection: '',
  answer: { correct_discards: [], explanation: '' }
};

// 统一挂载函数：每次状态变化后都重新渲染一次文本界面。
function mount() {
  if (!state.problem) return;
  app.innerHTML = `<pre>${renderProblem(state.problem, state)}</pre>`;
  bindChoices();
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

// 初始化流程：加载数据 -> 取第一题 -> 校验 -> 首次渲染。
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
