// 牌编码 -> Unicode 麻将牌字符映射。
const tileToUnicode = {
  '1m': '🀇\uFE0E', '2m': '🀈\uFE0E', '3m': '🀉\uFE0E', '4m': '🀊\uFE0E',
  '5m': '🀋\uFE0E', '6m': '🀌\uFE0E', '7m': '🀍\uFE0E', '8m': '🀎\uFE0E', '9m': '🀏\uFE0E',
  
  '1p': '🀙\uFE0E', '2p': '🀚\uFE0E', '3p': '🀛\uFE0E', '4p': '🀜\uFE0E',
  '5p': '🀝\uFE0E', '6p': '🀞\uFE0E', '7p': '🀟\uFE0E', '8p': '🀠\uFE0E', '9p': '🀡\uFE0E',
  
  '1s': '🀐\uFE0E', '2s': '🀑\uFE0E', '3s': '🀒\uFE0E', '4s': '🀓\uFE0E',
  '5s': '🀔\uFE0E', '6s': '🀕\uFE0E', '7s': '🀖\uFE0E', '8s': '🀗\uFE0E', '9s': '🀘\uFE0E',
  
  '1z': '🀀\uFE0E', '2z': '🀁\uFE0E', '3z': '🀂\uFE0E', '4z': '🀃\uFE0E',
  '5z': '🀆\uFE0E', '6z': '🀅\uFE0E', '7z': '🀄\uFE0E'   // 去掉原来可能自带的变体选择器，统一格式
};

const openSetTypeLabel = { chii: '吃', pon: '碰', open_kan: '明杠', closed_kan: '暗杠', added_kan: '加杠' };
const windLabel = { east: '东', south: '南', west: '西', north: '北' };

function tileLabel(tile) {
  return `${tileToUnicode[tile] ?? '□'}`;
}

function linkedTileLabel(tile) {
  return `<a class="tile-link" href="#" data-discard="${tile}" title="打出 ${tile}">${tileLabel(tile)}</a>`;
}

function setLabel(set) {
  const textTiles = (set.tiles ?? []).map(tileLabel).join(' ');
  return `[${openSetTypeLabel[set.type] ?? set.type}|来源:${set.from}] ${textTiles}`;
}

function kvLine(label, value) {
  return `<span class="label">${label.padEnd(10, ' ')}</span>: <span class="value">${value}</span>`;
}

export function renderProblem(problem, state) {
  const linkedConcealed = problem.hand.concealed.map((tile) => linkedTileLabel(tile)).join('  ');
  const openSets = problem.hand.open_sets.length
    ? problem.hand.open_sets.map((set) => `<span class="value">${setLabel(set)}</span>`).join('\n')
    : '<span class="muted">(无副露)</span>';

  const answerBlock = state.selection
    ? [
        '<span class="sep">-------------------- 判定与解析 --------------------</span>',
        kvLine('你的选择', tileLabel(state.selection)),
        kvLine('参考答案', state.answer.correct_discards.map(tileLabel).join(' / ')),
        kvLine('判定结果', state.answer.correct_discards.includes(state.selection) ? '正确' : '可再思考'),
        '<span class="label">解析内容  </span>:',
        `<span class="value">${state.answer.explanation}</span>`,
        '<span class="sep">----------------------------------------------------</span>'
      ].join('\n')
    : [
        '<span class="sep">-------------------- 作答说明 ----------------------</span>',
        '<span class="muted">直接点击上方【手牌(门前)】中的任意一张牌，即视为打出该牌。</span>',
        '<span class="sep">----------------------------------------------------</span>'
      ].join('\n');

  return [
    '<span class="frame">====================================================</span>',
    '<span class="title">                 日麻何切 TXT 模式                 </span>',
    '<span class="frame">====================================================</span>',
    kvLine('题号', problem.id),
    kvLine('场次', `${windLabel[problem.game_phase]}场 ${problem.round}局`),
    kvLine('自风', windLabel[problem.self_position]),
    kvLine('巡目', problem.turn),
    kvLine('宝牌指示牌', problem.dora_indicators.map(tileLabel).join('  ')),
    '<span class="sep">----------------------------------------------------</span>',
    '<span class="section">手牌(门前) [点击即切牌]</span>',
    linkedConcealed,
    '<span class="sep">----------------------------------------------------</span>',
    '<span class="section">副露区</span>',
    openSets,
    '<span class="sep">----------------------------------------------------</span>',
    kvLine('总牌数校验', `${problem.hand.total_tiles_count} 张`),
    '<span class="sep">----------------------------------------------------</span>',
    answerBlock,
    '<span class="sep">-------------------- 预留区域 ----------------------</span>',
    '<span class="muted">[后续扩展]</span>',
    '<span class="muted">- 向听数/受入计算</span>',
    '<span class="muted">- 多题切换与目录索引</span>',
    '<span class="muted">- 牌理标签(进攻/防守/平衡)</span>',
    '<span class="frame">====================================================</span>'
  ].join('\n');
}
