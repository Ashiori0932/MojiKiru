// 牌编码 -> Unicode 麻将牌字符映射。
const tileToUnicode = {
  '1m': '🀇', '2m': '🀈', '3m': '🀉', '4m': '🀊',
  '5m': '🀋', '6m': '🀌', '7m': '🀍', '8m': '🀎', '9m': '🀏',

  '1p': '🀙', '2p': '🀚', '3p': '🀛', '4p': '🀜',
  '5p': '🀝', '6p': '🀞', '7p': '🀟', '8p': '🀠', '9p': '🀡',

  '1s': '🀐', '2s': '🀑', '3s': '🀒', '4s': '🀓',
  '5s': '🀔', '6s': '🀕', '7s': '🀖', '8s': '🀗', '9s': '🀘',

  '1z': '🀀', '2z': '🀁', '3z': '🀂', '4z': '🀃',
  '5z': '🀆', '6z': '🀅', '7z': '🀄'
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
