// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const GifEncoder = require("gif-encoder-2");
// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const { writeFile } = require("fs");

class HashLipsGiffer {
  canvas: any;
  ctx: any;
  delay: any;
  fileName: any;
  gifEncoder: any;
  quality: any;
  repeat: any;
  constructor(_canvas: any, _ctx: any, _fileName: any, _repeat: any, _quality: any, _delay: any) {
    this.canvas = _canvas;
    this.ctx = _ctx;
    this.fileName = _fileName;
    this.repeat = _repeat;
    this.quality = _quality;
    this.delay = _delay;
    this.initGifEncoder();
  }

  initGifEncoder = () => {
    this.gifEncoder = new GifEncoder(this.canvas.width, this.canvas.height);
    this.gifEncoder.setQuality(this.quality);
    this.gifEncoder.setRepeat(this.repeat);
    this.gifEncoder.setDelay(this.delay);
  };

  start = () => {
    this.gifEncoder.start();
  };

  add = () => {
    this.gifEncoder.addFrame(this.ctx);
  };

  stop = () => {
    this.gifEncoder.finish();
    const buffer = this.gifEncoder.out.getData();
    writeFile(this.fileName, buffer, (error: any) => {});
    console.log(`Created gif at ${this.fileName}`);
  };
}

// @ts-expect-error TS(2552): Cannot find name 'module'. Did you mean 'MODE'?
module.exports = HashLipsGiffer;
