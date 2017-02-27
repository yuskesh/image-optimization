#!/usr/bin/env node
const argv = require('yargs').argv;
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const chalk = require('chalk');
const Table = require('cli-table');


const origFilePath = argv._[0];
const imageDir = __dirname + '/images';
const tmpPath = imageDir + '/tmp/';
const buildPath = imageDir + '/build';

mkdirp.sync(tmpPath);
mkdirp.sync(buildPath);

const outputFileName = path.basename(origFilePath, path.extname(origFilePath)) + '.png';
const tmpFilePath = tmpPath + '/' + outputFileName;
const buildFilePath = buildPath + '/' + outputFileName;

sharp(origFilePath)
.rotate()
.resize(1600, 1600)
.max()
.toFile(tmpFilePath)
.catch( err => {
  if (err) throw err;
})
.then( () => {
  return imagemin(
    [tmpFilePath],
    //'images/build',
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
  const origFileSize  = fs.statSync(origFilePath).size;
  const tmpFileSize   = fs.statSync(tmpFilePath).size;
  const buildFileSize = fs.statSync(buildFilePath).size;

  /*
  console.log('The Image optimized');
  console.log(`orig file size: ${chalk.green(origFileSize)}`);
  console.log(`tmp  file size: ${chalk.green(tmpFileSize)} ratio: ${chalk.magenta((tmpFileSize / origFileSize).toFixed(3))}`);
  console.log(`opt  file size: ${chalk.green(buildFileSize)} ratio: ${chalk.magenta((buildFileSize / origFileSize).toFixed(3))}`);
  */

  var table = new Table({
    head: ['file', 'size', 'ratio'],
    colAligns: ['middle', 'right', 'right']
  });

  table.push(
    ['original', chalk.green(origFileSize.toLocaleString()), chalk.magenta((1).toFixed(3))],
    ['temporary', chalk.green(tmpFileSize.toLocaleString()), chalk.magenta((tmpFileSize / origFileSize).toFixed(3))],
    ['optimized', chalk.green(buildFileSize.toLocaleString()), chalk.magenta((buildFileSize / origFileSize).toFixed(3))]
  );

  console.log(table.toString());
});
