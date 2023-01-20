// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'basePath'.
const basePath = process.cwd();
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'createCanv... Remove this comment to see the full error message
const { createCanvas, loadImage } = require("canvas");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'buildDir'.
const buildDir = `${basePath}/build`;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'imageDir'.
const imageDir = `${buildDir}/images`;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'format'.
const { format, preview_gif } = require(`${basePath}/src/config.js`);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'canvas'.
const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");

// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const HashlipsGiffer = require(`${basePath}/modules/HashlipsGiffer.js`);
let hashlipsGiffer: any = null;

const loadImg = async (_img: any) => {
  return new Promise(async (resolve) => {
    const loadedImage = await loadImage(`${_img}`);
    resolve({ loadedImage: loadedImage });
  });
};

// read image paths
const imageList: any = [];
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'rawdata'.
const rawdata = fs.readdirSync(imageDir).forEach((file: any) => {
  imageList.push(loadImg(`${imageDir}/${file}`));
});

const saveProjectPreviewGIF = async (_data: any) => {
  // Extract from preview config
  const { numberOfImages, order, repeat, quality, delay, imageName } =
    preview_gif;
  // Extract from format config
  const { width, height } = format;
  // Prepare canvas
  const previewCanvasWidth = width;
  const previewCanvasHeight = height;

  if (_data.length < numberOfImages) {
    console.log(
      `You do not have enough images to create a gif with ${numberOfImages} images.`
    );
  } else {
    // Shout from the mountain tops
    console.log(
      `Preparing a ${previewCanvasWidth}x${previewCanvasHeight} project preview with ${_data.length} images.`
    );
    const previewPath = `${buildDir}/${imageName}`;

    ctx.clearRect(0, 0, width, height);

    hashlipsGiffer = new HashlipsGiffer(
      canvas,
      ctx,
      `${previewPath}`,
      repeat,
      quality,
      delay
    );
    hashlipsGiffer.start();

    await Promise.all(_data).then((renderObjectArray) => {
      // Determin the order of the Images before creating the gif
      if (order == "ASC") {
        // Do nothing
      } else if (order == "DESC") {
        renderObjectArray.reverse();
      } else if (order == "MIXED") {
        renderObjectArray = renderObjectArray.sort(() => Math.random() - 0.5);
      }

      // Reduce the size of the array of Images to the desired amount
      // @ts-expect-error TS(2345): Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
      if (parseInt(numberOfImages) > 0) {
        renderObjectArray = renderObjectArray.slice(0, numberOfImages);
      }

      renderObjectArray.forEach((renderObject, index) => {
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(
          renderObject.loadedImage,
          0,
          0,
          previewCanvasWidth,
          previewCanvasHeight
        );
        hashlipsGiffer.add();
      });
    });
    hashlipsGiffer.stop();
  }
};

saveProjectPreviewGIF(imageList);
