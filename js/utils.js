// 预留：后续可加入向听数、受入、打点估算等计算工具。
export function validateProblem(problem) {
  const concealed = problem?.hand?.concealed ?? [];
  const openTiles = (problem?.hand?.open_sets ?? []).flatMap((set) => set.tiles ?? []);
  const total = concealed.length + openTiles.length;
  return total === problem?.hand?.total_tiles_count;
}
