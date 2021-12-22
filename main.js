const puppeteer = require('puppeteer');
const fs = require('fs');
const { Readable } = require('stream');

const parseDataUrl = (dataUrl) => {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (matches.length !== 3) {
    throw new Error('Could not parse data URL.');
  }
  return { mime: matches[1], buffer: Buffer.from(matches[2], 'base64') };
};

/**
 * @param binary Buffer
 * returns readableInstanceStream Readable
 */
function bufferToStream (binary) {

  const readableInstanceStream = new Readable({
    read () {
      this.push(binary);
      this.push(null);
    }
  });
  return readableInstanceStream;
}

async function generateFamilyTree (jsonData) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Point to a version of go.js, either a local file or one on the web at a CDN
  await page.addScriptTag({
    // url: 'https://unpkg.com/gojs'
    path: 'scripts/go.js'
  });

  await page.addScriptTag({
    path: 'scripts/familyTree.js'
  });

  // Create HTML for the page:
  page.setContent('<div id="myDiagramDiv" style="border: solid 1px blue; width:100%; height:600px;"></div>');

  // Set up a Diagram, and return the result of makeImageData:
  const imageData = await page.evaluate((jsonData) => {
    return init(jsonData);
  }, jsonData);

  // Output the GoJS makeImageData as a .png:
  const { buffer } = parseDataUrl(imageData);
  // fs.writeFileSync('family-tree.png', buffer, 'base64');
  await browser.close();
  return bufferToStream(buffer);
}

module.exports = {
  generateFamilyTree: generateFamilyTree
};

