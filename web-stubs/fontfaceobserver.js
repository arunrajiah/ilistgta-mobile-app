// Web stub for fontfaceobserver — resolves immediately so fonts don't block web dev testing.
// The @font-face CSS rule is still injected by expo-font; the browser loads the font
// asynchronously. Icons render correctly once the font file arrives.
function FontFaceObserver(family, options) {
  this.family = family;
}
FontFaceObserver.prototype.load = function (text, timeout) {
  return Promise.resolve();
};
module.exports = FontFaceObserver;
module.exports.default = FontFaceObserver;
