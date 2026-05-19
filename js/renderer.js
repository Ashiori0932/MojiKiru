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

// 统一的牌背字符
const TILE_BACK = '🀫';

const openSetTypeLabel = { chii: '吃', pon: '碰', open_kan: '明杠', closed_kan: '暗杠', added_kan: '加杠' };
const windLabel = { east: '东', south: '南', west: '西', north: '北' };

function tileLabel(tile) {
  return `<span class="tile-glyph">${tileToUnicode[tile] ?? TILE_BACK}</span>`;
}

function linkedTileLabel(tile) {
  return `<a class="tile-link" href="#" data-discard="${tile}" title="打出 ${tile}">${tileLabel(tile)}</a>`;
}

function setLabel(set) {
  const textTiles = (set.tiles ?? []).map(tileLabel).join(' ');
  return `[${openSetTypeLabel[set.type] ?? set.type}|来源:${set.from}] ${textTiles}`;
}

export function renderProblem(problem, state) {
  const linkedConcealed = problem.hand.concealed.map((tile) => linkedTileLabel(tile)).join('  ');
  const openSets = problem.hand.open_sets.length
    ? problem.hand.open_sets.map((set) => `<span class="value">${setLabel(set)}</span>`).join('\n')
    : '<span class="muted">(无副露)</span>';

  const answerBlock = state.selection
    ? [
        '<span class="sep">-------------------- 判定与解析 --------------------</span>',
        `手牌       : <span class="value">${tileLabel(state.selection)}</span>`,
        `参考手牌   : <span class="value">${state.answer.correct_discards.map(tileLabel).join(' / ')}</span>`,
        `判定结果   : <span class="value">${state.answer.correct_discards.includes(state.selection) ? '正确' : '可再思考'}</span>`,
        '解析内容   :',
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
    `<span class="value">题目${problem.id}</span>`,
    `<span class="value">${windLabel[problem.game_phase]}${problem.round}局 ${windLabel[problem.self_position]}家 ${problem.turn}巡目</span>`,
    `宝牌指示牌 : <span class="value">${problem.dora_indicators.map(tileLabel).join('  ')}</span>`,
    '<span class="sep">----------------------------------------------------</span>',
    '<span class="section">手牌(门前) [点击即切牌]</span>',
    linkedConcealed,
    '<span class="sep">----------------------------------------------------</span>',
    '<span class="section">副露区</span>',
    openSets,
    '<span class="sep">----------------------------------------------------</span>',
    answerBlock,
    '<span class="frame">====================================================</span>'
  ].join('\n');
}
