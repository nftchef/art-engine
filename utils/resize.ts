/**
 * This script helps to resize your images in the
 * `build/images` folder for the `displayUri` and
 * `thumbnailUri` in Tezos metadata.
 */

// @ts-expect-error TS(2580): Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const sharp = require("sharp");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'fs'.
const fs = require("fs");
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'path'.
const path = require("path");

// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'isLocal'.
const isLocal = typeof process.pkg === "undefined";
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'basePath'.
const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'imagesDir'... Remove this comment to see the full error message
const imagesDir = `${basePath}/build/images`;
// @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'tezosConfi... Remove this comment to see the full error message
const tezosConfig = require(`${basePath}/Tezos/tezos_config.js`);

const resizeImagePath = {
  displayUri: path.join(basePath, "build/displayUri/"),
  thumbnailUri: path.join(basePath, "build/thumbnailUri/"),
};

function getAllImages(dir: any) {
  if (!fs.existsSync(imagesDir)) {
    console.log(`Images folder doesn't exist.`);
    return;
  }

  const images = fs
    .readdirSync(imagesDir)
    .filter((item: any) => {
      let extension = path.extname(`${dir}${item}`);
      if (extension == ".png" || extension == ".jpg") {
        return item;
      }
    })
    .map((i: any) => ({
    filename: i,
    path: `${dir}/${i}`
  }));

  return images;
}

function renderResizedImages(images: any, path: any, sizeW: any, sizeH: any) {
  /**
   * images: A list of images.
   * path: Path to render the resized images.
   * sizeH: Height of resized images.
   * sizeW: Width of resized images.
   */
  if (!fs.existsSync(path)) {
    console.log(`Images folder doesn't exist.`);
    return;
  }
  if (!path.endsWith("/")) {
    path += `/`;
  }

  images.forEach((image: any) => {
    const newPath = `${path}${image.filename}`;
    console.log(`Converting ${image.path}`);
    sharp(image.path)
      .resize(sizeW, sizeH)
      .toFile(newPath, (err: any, info: any) => {
        if (!err) {
          console.log(`✅ Rendered ${newPath}.`);
        } else {
          console.error(`Got error ${err}`);
        }
      });
  });
}

const createPath = (path: any) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
    return path;
  } else {
    console.log(`${path} already exists.`);
  }
};
console.log(tezosConfig.size);

function transformForTez(images: any) {
  // Converting for the `displayUri`.
  createPath(resizeImagePath.displayUri);
  console.log("------------> Display", resizeImagePath.displayUri);
  renderResizedImages(
    images,
    resizeImagePath.displayUri,
    tezosConfig.size.displayUri.width,
    tezosConfig.size.displayUri.height
  );

  createPath(resizeImagePath.thumbnailUri);

  console.log("------------> Thumbnail", resizeImagePath.thumbnailUri);
  renderResizedImages(
    images,
    resizeImagePath.thumbnailUri,
    tezosConfig.size.thumbnailUri.width,
    tezosConfig.size.thumbnailUri.height
  );
  console.log(`Done!`);
}

const images = getAllImages(imagesDir);
console.log(`Images list`);
console.table(images);
transformForTez(images);
