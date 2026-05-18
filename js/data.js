export async function loadQuestions() {
  const response = await fetch('./data/questions.json', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('题目数据加载失败');
  }
  return response.json();
}
