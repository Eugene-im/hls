const express = require('express');
const app = express();
const fs = require("fs");
const path = require('path');
const cp = require('child_process');

const directory = 'video';
const streamsUrl = {};
streamsUrl.zal1 = 'rtsp://admin:liana2017@10.12.19.8:554/Streaming/Channels/1802';
streamsUrl.zal2 = 'rtsp://admin:liana2017@10.12.19.8:554/Streaming/Channels/1702';
streamsUrl.zal3 = 'rtsp://admin:liana2017@10.12.19.8:554/Streaming/Channels/1602';
streamsUrl.zal4 = 'rtsp://admin:liana2017@10.12.19.8:554/Streaming/Channels/1502';
const cmd = 'ffmpeg -i ' + streamsUrl.zal1 + ' -c:v libx264 -c:a aac -ac 1 -strict -2 -crf 18 -profile:v baseline -maxrate 400k -bufsize 1835k -pix_fmt yuv420p -hls_time 10 -hls_list_size 6 -hls_wrap 10 -start_number 1 video/output.m3u8'
var asd;

app.listen(8000);


app.get('/1', function (req, res) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  } else {
    deleteFolder();
  }
  res.send(req.url + " hello " + req.headers["user-agent"]);
  asd = cp.exec(cmd, function (err, stdout, stderr) {
    if (err) {
      console.log(err)
    }
  })
});


app.get('/2', function (req, res) {
  res.send(req.url + " bye " + req.headers["user-agent"]);
  asd.stdin.write('q');
  asd.on('exit', function () {
    asd = null;
    deleteFolder();
  })
})

function deleteFolder() {
  if (fs.existsSync(directory)) {
    fs.readdirSync(directory).forEach((file, index) => {
      const curPath = path.join(directory, file);
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(directory);
  }
}