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
 * 红宝牌映射（0x → 红5x）
 *************************************************/
const AKA_TILES = {
    '0m': '5m',
    '0p': '5p',
    '0s': '5s'
};

function normalizeAkaTile(tile) {
    return AKA_TILES[tile] ?? tile;
}

function isAkaTile(tile) {
    return tile in AKA_TILES;
}

/*************************************************
 * 基础牌面渲染
 *************************************************/
function renderTile(tile) {
    const displayTile = normalizeAkaTile(tile);
    const unicode = TILE_UNICODE[displayTile] ?? TILE_BACK;

    if (isAkaTile(tile)) {
        return `<span class="tile-glyph aka">${unicode}</span>`;
    }

    return `<span class="tile-glyph">${unicode}</span>`;
}
function renderLinkedTile(tile) {
    return `<a class="tile-link" href="#" data-discard="${tile}" title="打出 ${tile}">${renderTile(tile)}</a>`;
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
                `<span class="meld-tile meld-tile-called" title="${tile}">${renderTile(tile)}</span><span class="meld-spacer-small"></span>`
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
function renderAnswerSection(state) {
    if (!state.selection) {
        return '';
    }

    return `
        <section class="ascii-table answer-table" aria-label="答案解析">
            <div class="ascii-row">
                <div class="ascii-cell label">你的选择</div>
                <div class="ascii-cell value">${renderTile(state.selection)}</div>
            </div>
            <div class="ascii-row">
                <div class="ascii-cell label">参考答案</div>
                <div class="ascii-cell value">${state.answer.correct_discards.map(renderTile).join('<span class="answer-separator">/</span>')}</div>
            </div>
            <div class="ascii-row ascii-row-wide">
                <div class="ascii-cell label">解析</div>
                <div class="ascii-cell value explanation">${state.answer.explanation}</div>
            </div>
        </section>`;
}

function renderNavigation(state) {
    const prev = state.currentIndex > 0
        ? '<a href="#" data-nav="prev">[上一题]</a>'
        : '<span class="nav-placeholder">[上一题]</span>';
    const next = state.currentIndex < state.problems.length - 1
        ? '<a href="#" data-nav="next">[下一题]</a>'
        : '<span class="nav-placeholder">[下一题]</span>';

    return `${prev}<span class="nav-gap">··</span>${next}`;
}

function renderProblemCatalog(state) {
    return state.problems
        .map(({ problem }) => `<a href="#" data-problem-id="${problem.id}">[${problem.id}]</a>`)
        .join('');
}

function renderShell({ title, toolbar = '', children }) {
    return `
        <div class="terminal-page">
            <header class="page-header ascii-table">
                <div class="ascii-cell title">文切 / MojiKiru</div>
                <div class="ascii-cell muted">点击手牌切牌</div>
                <nav class="ascii-cell toolbar" aria-label="页面导航">${toolbar}</nav>
            </header>
            ${children}
        </div>`;
}

/*************************************************
 * 主渲染函数
 *************************************************/
export function renderProblem(problem, state) {
    if (state.catalogMode) {
        const backToProblem = state.problem
            ? '<a href="#" data-action="back-to-current">[返回]</a>'
            : '';

        return renderShell({
            toolbar: backToProblem,
            children: `
                <section class="ascii-table catalog-table" aria-label="题单">
                    <div class="ascii-cell section">题单</div>
                    <div class="ascii-cell catalog-grid">${renderProblemCatalog(state)}</div>
                </section>`
        });
    }

    const concealedTiles = problem.hand.concealed
        .map(renderLinkedTile)
        .join('');

    const openMelds = problem.hand.open_sets.length
        ? problem.hand.open_sets
            .map(set => `<span class="meld-set">${renderMeld(set)}</span>`)
            .join('')
        : '<span class="muted">无</span>';

    return renderShell({
        toolbar: `<a href="#" data-action="catalog">[题单]</a>${renderNavigation(state)}`,
        children: `
            <section class="ascii-table meta-table" aria-label="题目信息">
                <div class="ascii-cell label">题目</div>
                <div class="ascii-cell value">${problem.id}</div>
                <div class="ascii-cell label">局面</div>
                <div class="ascii-cell value">${WIND_LABEL[problem.game_phase]}${problem.round}局</div>
                <div class="ascii-cell label">自风</div>
                <div class="ascii-cell value">${WIND_LABEL[problem.self_position]}家</div>
                <div class="ascii-cell label">巡目</div>
                <div class="ascii-cell value">${problem.turn}巡目</div>
            </section>

            <section class="ascii-table board-table" aria-label="牌面">
                <div class="ascii-cell label">宝牌指示</div>
                <div class="ascii-cell tile-line dora-line">${renderDoraIndicators(problem.dora_indicators)}</div>
                <div class="ascii-cell label">手牌</div>
                <div class="ascii-cell tile-line hand-line">${concealedTiles}</div>
                <div class="ascii-cell label">副露</div>
                <div class="ascii-cell tile-line meld-line">${openMelds}</div>
            </section>
            ${renderAnswerSection(state)}`
    });
}
