const express = require('express');
const app = express();
const fapp = express();
const fsx = require("fs-extra");
const fs = require("fs");
const path = require('path');
const cp = require('child_process');
const conf = require('./config.json');

const directory = 'video';

var asd = {};
var zal;

app.listen(8000);
fapp.listen(9000);

fapp.use(express.static(directory));

app.get('/start:id', function (req, res) {
  zal = `zal${req.params.id}`;
  var cmd = `ffmpeg -i ${conf[zal]} -c:v libx264 -c:a aac -ac 1 -strict -2 -crf 18 -profile:v baseline -maxrate 400k -bufsize 1835k -pix_fmt yuv420p -hls_time 10 -hls_list_size 6 -hls_wrap 10 -start_number 1 ${directory}/${zal}/index.m3u8`;

  if (req.params.id < 5) {
    if (!fs.existsSync(`${directory}/${zal}`)) {
      fsx.mkdirs(`${directory}/${zal}`);
    } else {
      deleteFolder();
    }
    res.send(`${zal} start streaming`);
    asd[zal] = cp.exec(cmd, function (err, stdout, stderr) {
      if (err) {
        console.log(err)
      }
    })
  } else {
    res.send(`check zal, ${zal} is exist`);
  }
});


app.get('/stop:id', function (req, res) {
  zal = `zal${req.params.id}`;
  if ((req.params.id < 5) && (asd[zal] != undefined)) {
    res.send(`${zal} stop streaming`);
    asd[zal].stdin.write('q');
    asd[zal].on('exit', function () {
      asd[zal] = null;
      deleteFolder();
    })
  } else if ((req.params.id > 5) && (asd[zal] != undefined)) {
    res.send(`check zal, ${zal} is exist`);
  } else {
    res.send(`stream from ${zal} is exist`);
  }
})

function deleteFolder() {
  if (!fsx.ensureDirSync(`${directory}/${zal}`)) {
    fsx.remove(`${directory}/${zal}`, err => {
      if(err) console.error(err)
    })
  }
}