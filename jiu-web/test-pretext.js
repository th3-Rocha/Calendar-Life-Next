const pt = require('@chenglou/pretext');
const FONT = '12px monospace';
const textString = '■'.repeat(29200);

try {
  const p = pt.prepareWithSegments(textString, FONT);
  console.log("Prepared!", p.widths.length);
  const layout = pt.layoutWithLines(p, 800, 14);
  console.log("Laid out!", layout.lineCount);
} catch (e) {
  console.error("Error:", e);
}
