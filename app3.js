const express = require('express');
const app = express();
const fs = require("fs");
const path = require('path');
const cp = require('child_process');

const directory = 'video';
const cmd = 'ffmpeg -i rtsp://admin:liana2017@10.12.19.8:554/Streaming/Channels/1802 -c:v libx264 -c:a aac -ac 1 -strict -2 -crf 18 -profile:v baseline -maxrate 400k -bufsize 1835k -pix_fmt yuv420p -hls_time 10 -hls_list_size 6 -hls_wrap 10 -start_number 1 video/output.m3u8'
// var child = cp.exec(cmd, function (err, stdout, stderr) {
//   console.log(err, stdout, stderr)
// })

// var spawn = require('child_process').spawn;

// var ffmpeg = spawn('ffmpeg', ['-i', 'rtsp://admin:liana2017@10.12.19.8:554/Streaming/Channels/1802', '-c:v libx264', '-c:a aac', '-ac 1', '-strict -2', '-crf 18', '-profile:v baseline', '-maxrate 400k', '-bufsize 1835k', '-pix_fmt yuv420p', '-hls_time 10', '-hls_list_size 6', '-hls_wrap 10', '-start_number 1', 'video/output.m3u8']);

// const ffmpeg = require('fluent-ffmpeg');

app.listen(8000);

app.get('/1', function (req, res) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
  res.send(req.url + " hello " + req.headers["user-agent"]);
  cp.exec(cmd, {uid:1}, function (err, stdout, stderr) {
    console.log(err, stdout, stderr)
  })
  // ffmpeg.stderr.on('data', function () {
  //   console.log(data);
  //   ffmpeg.stdin.setEncoding('utf8');
  //   ffmpeg.stdin.write('q');
  //   process.exit();
  // });
  // ffmpeg('rtsp://login:password@1.1.1.1:554/Streaming/Channels/1802', { timeout: 432000 }).addOptions([
  // '-c:v libx264',
  // '-c:a aac',
  // '-ac 1',
  // '-strict -2',
  // '-crf 18',
  // '-profile:v baseline',
  // '-maxrate 400k',
  // '-bufsize 1835k',
  // '-pix_fmt yuv420p',
  // '-hls_time 10',
  // '-hls_list_size 6',
  // '-hls_wrap 10',
  // '-start_number 1'
  //   ]).output('video/output.m3u8').on('end', callback).run()
});
app.get('/2', function (req, res) {
  res.send(req.url + " bye " + req.headers["user-agent"]);
  ffmpeg.stdin.setEncoding('utf8');
  ffmpeg.stdin.write('q');
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), err => {
        if (err) throw err;
      });
    }
  });
})

// function callback() {
//   console.log("ok")
// };