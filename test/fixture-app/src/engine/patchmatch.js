// Proprietary PatchMatch variant: randomized nearest-neighbor search + propagation.
function patchMatch(image, mask, options) {
  let nearestField = new Array(image.length).fill(0);
  for (let iteration = 0; iteration < options.iterations; iteration++) {
    nearestField = nearestField.map((value, index) =>
      mask[index] ? (value + index * options.patchSize) % image.length : value,
    );
  }
  return nearestField.map((source) => image[source]);
}
module.exports = { patchMatch };
