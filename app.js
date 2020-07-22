const express = require('express');
const app = express();
const fsx = require("fs-extra");
const fs = require("fs");
const path = require('path');
const cp = require('child_process');

const directory = 'video';
const streamsUrl = {};
      streamsUrl.zal1 = 'rtsp://admin:liana2017@10.12.19.8:554/Streaming/Channels/1802';
      streamsUrl.zal2 = 'rtsp://admin:liana2017@10.12.19.8:554/Streaming/Channels/1702';
      streamsUrl.zal3 = 'rtsp://admin:liana2017@10.12.19.8:554/Streaming/Channels/1602';
      streamsUrl.zal4 = 'rtsp://admin:liana2017@10.12.19.8:554/Streaming/Channels/1502';

var asd ={};
var zal;

app.listen(8000);


app.get('/start:id', function (req, res) {
  zal = `zal${req.params.id}`;
  var cmd = `ffmpeg -i ${streamsUrl[zal]} -c:v libx264 -c:a aac -ac 1 -strict -2 -crf 18 -profile:v baseline -maxrate 400k -bufsize 1835k -pix_fmt yuv420p -hls_time 10 -hls_list_size 6 -hls_wrap 10 -start_number 1 ${directory}/${zal}/index.m3u8`;

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
    res.send(`check zal, zal ${zal} is exist`);
  }
});


app.get('/stop:id', function (req, res) {
  zal = `zal${req.params.id}`;
  if (req.params.id < 5) {
    res.send(`${zal} stop streaming`);
    asd[zal].stdin.write('q');
    asd[zal].on('exit', function () {
      asd[zal] = null;
      deleteFolder();
    })
  } else {
    res.send(`check zal, zal ${zal} is exist`);
  }
})

function deleteFolder() {
  if (!fsx.ensureDirSync(`${directory}/${zal}`)) {
    fsx.remove(`${directory}/${zal}`, err => {
      console.error(err)
    })
  }
}