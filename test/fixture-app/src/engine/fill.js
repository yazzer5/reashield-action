const { patchMatch } = require("./patchmatch");
function applyContentAwareFill(image, mask) {
  return patchMatch(image, mask, { iterations: 5, patchSize: 7, searchRadius: 32 });
}
module.exports = { applyContentAwareFill };
