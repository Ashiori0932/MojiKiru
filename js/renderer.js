// 牌编码 -> Unicode 麻将牌字符映射。
const tileToUnicode = {
  '1m': '🀇', '2m': '🀈', '3m': '🀉', '4m': '🀊', '5m': '🀋', '6m': '🀌', '7m': '🀍', '8m': '🀎', '9m': '🀏',
  '1p': '🀙', '2p': '🀚', '3p': '🀛', '4p': '🀜', '5p': '🀝', '6p': '🀞', '7p': '🀟', '8p': '🀠', '9p': '🀡',
  '1s': '🀐', '2s': '🀑', '3s': '🀒', '4s': '🀓', '5s': '🀔', '6s': '🀕', '7s': '🀖', '8s': '🀗', '9s': '🀘',
  '1z': '🀀', '2z': '🀁', '3z': '🀂', '4z': '🀃', '5z': '🀆', '6z': '🀅', '7z': '🀄︎'
};

// 副露类型中文名称映射。
const openSetTypeLabel = {
  chii: '吃',
  pon: '碰',
  open_kan: '明杠',
  closed_kan: '暗杠',
  added_kan: '加杠'
};

// 方位映射。
const windLabel = { east: '东', south: '南', west: '西', north: '北' };

// 把牌编码格式化为“图形(编码)”便于兼顾可视与可检索。
function tileLabel(tile) {
  return `${tileToUnicode[tile] ?? '□'}`;
}

// 门前牌渲染为纯文字链接，点击后由 main.js 的事件绑定处理。
function linkedTileLabel(tile) {
  return `<a href="#" data-discard="${tile}">${tileLabel(tile)}</a>`;
}

// 副露输出格式：[类型|来源] 牌组
function setLabel(set) {
  const textTiles = (set.tiles ?? []).map(tileLabel).join(' ');
  return `[${openSetTypeLabel[set.type] ?? set.type}|来源:${set.from}] ${textTiles}`;
}

// 纯文本渲染主函数：返回完整页面文本块。
export function renderProblem(problem, state) {
  const linkedConcealed = problem.hand.concealed.map((tile) => linkedTileLabel(tile)).join('  ');
  const openSets = problem.hand.open_sets.length
    ? problem.hand.open_sets.map((set) => setLabel(set)).join('\n')
    : '(无副露)';

  // 未作答时显示说明；作答后显示判定与解析。
  const answerBlock = state.selection
    ? [
        '-------------------- 判定与解析 --------------------',
        `你的选择  : ${tileLabel(state.selection)}`,
        `参考答案  : ${state.answer.correct_discards.map(tileLabel).join(' / ')}`,
        `判定结果  : ${state.answer.correct_discards.includes(state.selection) ? '正确' : '可再思考'}`,
        '解析内容  :',
        `${state.answer.explanation}`,
        '----------------------------------------------------'
      ].join('\n')
    : [
        '-------------------- 作答说明 ----------------------',
        '直接点击上方【手牌(门前)】中的任意一张牌，即视为打出该牌。',
        '----------------------------------------------------'
      ].join('\n');

  return [
    '====================================================',
    '                 日麻何切 TXT 模式                 ',
    '====================================================',
    `题号        : ${problem.id}`,
    `场次        : ${windLabel[problem.game_phase]}场 ${problem.round}局`,
    `自风        : ${windLabel[problem.self_position]}`,
    `巡目        : ${problem.turn}`,
    `宝牌指示牌  : ${problem.dora_indicators.map(tileLabel).join('  ')}`,
    '----------------------------------------------------',
    '手牌(门前) [点击即切牌]',
    linkedConcealed,
    '----------------------------------------------------',
    '副露区',
    openSets,
    '----------------------------------------------------',
    `总牌数校验  : ${problem.hand.total_tiles_count} 张`,
    '----------------------------------------------------',
    answerBlock,
    '-------------------- 预留区域 ----------------------',
    '[后续扩展]',
    '- 向听数/受入计算',
    '- 多题切换与目录索引',
    '- 牌理标签(进攻/防守/平衡)',
    '===================================================='
  ].join('\n');
}
