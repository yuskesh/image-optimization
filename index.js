#!/usr/bin/env node
const argv = require('yargs').argv;
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');

const filePath = argv._[0];
const tmpPath = __dirname + '/images/tmp/' + path.basename(filePath, path.extname(filePath)) + '.png';

sharp(filePath)
.rotate()
.resize(1600, 1600)
.max()
.toFile(tmpPath)
.catch( err => {
  if (err) throw err;
})
.then( () => {
  return imagemin(
    [tmpPath],
    'images/build',
    {
      use: [imageminPngquant({
        quality: '85-90',
        speed: 1
      })]
    }
  );
})
.then(() => {
  console.log('Images optimized');
});
