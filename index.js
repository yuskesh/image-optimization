#!/usr/bin/env node
const argv = require('yargs').argv;
const sharp = require('sharp');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const chalk = require('chalk');
const Table = require('cli-table2');

const origFilePath = argv._[0];
const imageDir = __dirname + '/images';
const tmpPath = imageDir + '/tmp/';
const buildPath = imageDir + '/build';

const RESIZE_PX_TO = 1600;

mkdirp.sync(tmpPath);
mkdirp.sync(buildPath);

if (fs.lstatSync(origFilePath).isDirectory()) {
  var globPath = origFilePath + '/*.jpg';
  glob(globPath, (err, files) => {
    if (err) throw err;
    files.forEach((file) => {
      optimizeImage(file);
    });
  });
} else {
  optimizeImage(origFilePath);
}

const optimizeImage = filePath => {
  const outputFileName = path.basename(filePath, path.extname(filePath)) + '.png';

  const tmpFilePath = tmpPath + '/' + outputFileName;
  const buildFilePath = buildPath + '/' + outputFileName;

  sharp(filePath)
  .rotate()
  .resize(RESIZE_PX_TO, RESIZE_PX_TO)
  .max()
  .toFile(tmpFilePath)
  .catch( err => {
    if (err) throw err;
  })
  .then( () => {
    return imagemin(
      [tmpFilePath],
      buildPath,
      {
        use: [imageminPngquant({
          quality: '80-85',
          speed: 1
        })]
      }
    );
  })
  .then(() => {
    const origFileSize  = fs.lstatSync(filePath).size;
    const tmpFileSize   = fs.lstatSync(tmpFilePath).size;
    const buildFileSize = fs.lstatSync(buildFilePath).size;

    var table = new Table({
      head: ['name', 'state', 'size', 'ratio'],
      colAligns: ['left', 'middle', 'right', 'right']
    });

    table.push(
      [{rowSpan:3, content:outputFileName,vAlign:'center'}, 'original', chalk.green(origFileSize.toLocaleString()), chalk.magenta((1).toFixed(3))],
      ['temporary', chalk.green(tmpFileSize.toLocaleString()), chalk.magenta((tmpFileSize / origFileSize).toFixed(3))],
      ['optimized', chalk.green(buildFileSize.toLocaleString()), chalk.magenta((buildFileSize / origFileSize).toFixed(3))]
    );

    console.log(table.toString());
  });
}
