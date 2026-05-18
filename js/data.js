// 读取题库 JSON。保持接口最小化，便于后续替换为多数据源。
export async function loadQuestions() {
  const response = await fetch('./data/questions.json', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('题目数据加载失败');
  }
  return response.json();
}
