const tileToUnicode = {
  '1m': '🀇', '2m': '🀈', '3m': '🀉', '4m': '🀊', '5m': '🀋', '6m': '🀌', '7m': '🀍', '8m': '🀎', '9m': '🀏',
  '1p': '🀙', '2p': '🀚', '3p': '🀛', '4p': '🀜', '5p': '🀝', '6p': '🀞', '7p': '🀟', '8p': '🀠', '9p': '🀡',
  '1s': '🀐', '2s': '🀑', '3s': '🀒', '4s': '🀓', '5s': '🀔', '6s': '🀕', '7s': '🀖', '8s': '🀗', '9s': '🀘',
  '1z': '🀀', '2z': '🀁', '3z': '🀂', '4z': '🀃', '5z': '🀆', '6z': '🀅', '7z': '🀄'
};

const openSetTypeLabel = {
  chii: '吃',
  pon: '碰',
  open_kan: '明杠',
  closed_kan: '暗杠',
  added_kan: '加杠'
};

const windLabel = { east: '东', south: '南', west: '西', north: '北' };

function tileLabel(tile) {
  return `${tileToUnicode[tile] ?? '□'}(${tile})`;
}

function setLabel(set) {
  const textTiles = (set.tiles ?? []).map(tileLabel).join(' ');
  return `[${openSetTypeLabel[set.type] ?? set.type}|来源:${set.from}] ${textTiles}`;
}

function uniqueChoices(tiles) {
  return [...new Set(tiles)];
}

export function renderProblem(problem, state) {
  const choices = uniqueChoices(problem.hand.concealed);
  const choiceLinks = choices.map((tile) => `<a href="#" data-discard="${tile}">切 ${tileLabel(tile)}</a>`).join(' ｜ ');
  const openSets = problem.hand.open_sets.length
    ? problem.hand.open_sets.map((set) => setLabel(set)).join('\n')
    : '(无副露)';

  const answerBlock = state.selection
    ? `\n----- 判定 -----\n你的选择: ${tileLabel(state.selection)}\n参考答案: ${state.answer.correct_discards.map(tileLabel).join(' / ')}\n判定结果: ${state.answer.correct_discards.includes(state.selection) ? '正确' : '可再思考'}\n解析:\n${state.answer.explanation}\n`
    : '\n(请选择一张要切出的牌，查看答案与解析)\n';

  return `日麻何切 TXT\n========================================\n题号: ${problem.id}\n场次: ${windLabel[problem.game_phase]}场 ${problem.round}局\n自风: ${windLabel[problem.self_position]}\n巡目: ${problem.turn}\n宝牌指示牌: ${problem.dora_indicators.map(tileLabel).join(' ')}\n\n手牌(门前):\n${problem.hand.concealed.map(tileLabel).join(' ')}\n\n副露区:\n${openSets}\n\n总牌数校验: ${problem.hand.total_tiles_count} 张\n\n----- 何切作答区 -----\n${choiceLinks}\n${answerBlock}\n----- 预留区域 -----\n[后续扩展]\n- 向听数/受入计算\n- 多题切换与目录索引\n- 牌理标签(进攻/防守/平衡)\n`;
}
