/*************************************************
 * 麻将牌 → Unicode 映射
 *************************************************/
const TILE_UNICODE = {
    '1m': '🀇', '2m': '🀈', '3m': '🀉', '4m': '🀊',
    '5m': '🀋', '6m': '🀌', '7m': '🀍', '8m': '🀎', '9m': '🀏',

    '1p': '🀙', '2p': '🀚', '3p': '🀛', '4p': '🀜',
    '5p': '🀝', '6p': '🀞', '7p': '🀟', '8p': '🀠', '9p': '🀡',

    '1s': '🀐', '2s': '🀑', '3s': '🀒', '4s': '🀓',
    '5s': '🀔', '6s': '🀕', '7s': '🀖', '8s': '🀗', '9s': '🀘',

    '1z': '🀀', '2z': '🀁', '3z': '🀂', '4z': '🀃',
    '5z': '🀆', '6z': '🀅', '7z': '🀄'
};

const TILE_BACK = '🀫';
const TILE_BACK_HTML = `<span class="tile-glyph">${TILE_BACK}</span>`;

/*************************************************
 * 风位显示
 *************************************************/
const WIND_LABEL = {
    east: '东',
    south: '南',
    west: '西',
    north: '北'
};

/*************************************************
 * 基础牌面渲染
 *************************************************/
function renderTile(tile) {
    const unicode = TILE_UNICODE[tile] ?? TILE_BACK;
    return `<span class="tile-glyph">${unicode}</span>`;
}

function renderLinkedTile(tile) {
    return `<a class="tile-link" href="#" data-discard="${tile}" title="打出 ${tile}"> ${renderTile(tile)} </a>`;
}

function getCalledTileIndex(set) {
    const size = (set.tiles ?? []).length;
    if (!size) return -1;

    // 默认每组第一张就是触发副露动作的牌。
    if (Number.isInteger(set.called_index) && set.called_index >= 0 && set.called_index < size) {
        return set.called_index;
    }

    if (!set.from) return 0;
    if (set.from === 'left') return 0;
    if (set.from === 'opposite') return 1;
    if (set.from === 'right') return size - 1;
    return 0;
}

/*************************************************
 * 副露（吃 / 碰 / 杠）
 *************************************************/
function renderMeld(set) {
    const calledIndex = getCalledTileIndex(set);

    return (set.tiles ?? [])
        .map((tile, index) => {
            return index === calledIndex ? 
                `<span class="meld-tile meld-tile-called" title="${tile}">${renderTile(tile)}</span>'=<span class="meld-spacer"></span>` 
                : `<span class="meld-tile" title="${tile}">${renderTile(tile)}</span>`;
        })
        .join('');
}

/*************************************************
 * DORA 指示器
 *************************************************/
function renderDoraIndicators(doraTiles) {
    const count = doraTiles.length;
    const visible = doraTiles.map(renderTile).join('');
    const padding = TILE_BACK_HTML.repeat(Math.max(0, 5 - count));

    return TILE_BACK_HTML.repeat(2) + visible + padding;
}

/*************************************************
 * 判定 & 解析区域
 *************************************************/
function renderAnswerSection(problem, state) {
    if (!state.selection) {
        return '';
    }


    return [
        '<span class="sep">----------------------------------------</span>',
        `选择: <span class="value">${renderTile(state.selection)}</span>`,
        `答案: <span class="value">${state.answer.correct_discards.map(renderTile).join(' / ')}</span>`,
        '解析:',
        `<span class="value">${state.answer.explanation}</span>`,
    ].join('\n');
}

/*************************************************
 * 主渲染函数
 *************************************************/
export function renderProblem(problem, state) {
    const concealedTiles = problem.hand.concealed
        .map(renderLinkedTile)
        .join('');

    const openMelds = problem.hand.open_sets.length
        ? problem.hand.open_sets
            .map(set => `<span class="value">${renderMeld(set)}</span>`)
            .join(' ')
        : '';

    const handLine = concealedTiles +
        (openMelds ? '<span class="meld-spacer"></span>' + openMelds : '');


    return [
        '<span class="title">文切：极简文字何切</span>',
        '<span class="frame">====================================================</span>',

        `<span class="value">题目 ${problem.id}（点击手牌切牌）</span>`,
        `<span class="value">${WIND_LABEL[problem.game_phase]}${problem.round}局 ${WIND_LABEL[problem.self_position]}家 ${problem.turn}巡目</span>`,

        renderDoraIndicators(problem.dora_indicators),
        handLine,
        renderAnswerSection(problem, state),
        '<span class="sep">====================================================</span>'
    ].join('\n');
}
