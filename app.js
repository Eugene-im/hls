const MyEmitter = require('events');
const myEmitter = new MyEmitter();
const express = require('express');
const app = express();
const fapp = express();
const fsx = require("fs-extra");
const fs = require("fs");
const path = require('path');
const cp = require('child_process');
const conf = require('./config.json');

const directory = 'video';
const directoryTr = 'trans';
const directoryView = 'view';

refreshFolder(`${directory}/${directoryView}/${directoryTr}/zal1`)
refreshFolder(`${directory}/${directoryView}/${directoryTr}/zal2`)
refreshFolder(`${directory}/${directoryView}/${directoryTr}/zal3`)
refreshFolder(`${directory}/${directoryView}/${directoryTr}/zal4`)


var asd = {};
var zal;
var state = {
  zal1: false,
  zal2: false,
  zal3: false,
  zal4: false,
};

myEmitter.on('start1', () => {
  state.zal1 = true
});
myEmitter.on('start2', () => {
  state.zal2 = true
});
myEmitter.on('start3', () => {
  state.zal3 = true
});
myEmitter.on('start4', () => {
  state.zal4 = true
});
myEmitter.on('stop1', () => {
  state.zal1 = false
});
myEmitter.on('stop2', () => {
  state.zal2 = false
});
myEmitter.on('stop3', () => {
  state.zal3 = false
});
myEmitter.on('stop4', () => {
  state.zal4 = false
});

app.listen(8000);
fapp.listen(9000);

app.use('/', express.static(__dirname + `/${directory}`));
fapp.use('/', express.static(__dirname + `/${directory}/${directoryView}`));

app.get('/z:id', function (req, res) {
  res.status(200).sendFile(path.join(__dirname + `/${directory}` + `/z${req.params.id}.html`));
});

fapp.get('/', function (req, res) {
  res.status(200).sendFile(path.join(__dirname + `/${directory}/${directoryView}/` + `index.html`));
});

app.get('/start:id', function (req, res) {
  zal = `zal${req.params.id}`;
  try {

    refreshFolder(`${directory}/${directoryView}/${directoryTr}/${zal}/`)

    var cmd = `ffmpeg -i ${conf[zal]} -c:v libx264 -c:a aac -ac 1 -strict -2 -crf 18 -profile:v baseline -maxrate 400k -bufsize 1835k -pix_fmt yuv420p -hls_time 10 -hls_list_size 6 -hls_wrap 10 -start_number 1 ${directory}/${directoryView}/${directoryTr}/${zal}/index.m3u8`;

    if (req.params.id < 5) {


      asd[zal] = cp.exec(cmd, function (err, stdout, stderr) {
        if (err) {
          console.log(err);
        } else if (stdout) {
          console.log(stdout);
        } else if (stderr) {
          console.log(stderr)
        }
      })
      myEmitter.emit(`start${req.params.id}`);
      console.log(state);
      res.status(200).send({
        status: "ok",
        text: `${zal} start streaming`
      });
    } else {
      res.status(400).send(`check zal, ${zal} is exist`);
    }
  } catch (err) {
    console.log(err)
  }
});


app.get('/stop:id', function (req, res) {
  zal = `zal${req.params.id}`;
  try {

    if ((req.params.id < 5) && (asd[zal] != undefined)) {
      res.status(200).send({
        status: "ok",
        text: `${zal} stop streaming`
      });
      asd[zal].stdin.write('q');
      asd[zal].on('exit', function () {
        asd[zal] = null;
      })
      myEmitter.emit(`stop${req.params.id}`);
      setTimeout(refreshFolder, 3000, `${directory}/${directoryView}/${directoryTr}/${zal}/`);
    } else if ((req.params.id > 5) && (asd[zal] != undefined)) {
      res.status(400).send({
        status: "no",
        text: `check zal, ${zal} is exist`
      });
    } else {
      res.status(400).send({
        status: "no",
        text: `stream from ${zal} is exist`
      });
    }
  } catch (err) {
    console.log(err)
  }
})

app.get('/state:id', function (req, res) {
  zal = `zal${req.params.id}`;
  if (state[zal]) {
    res.status(200).send({
      status: "ok",
      text: `stream from ${zal} is plaing`
    });
  } else {
    res.status(400).send({
      status: "no",
      text: `stream from ${zal} exist`
    })
  }
})

function refreshFolder(path) {
  try {

    if (fsx.existsSync(path)) {
      fsx.remove(path, err => {
        if (err) return console.error(err);
        fsx.ensureDir(path)
        .then(() => {
          console.log('success create after remove!')
        })
        .catch(err => {
          console.error(err)
        })
        console.log('success remove!');
      })
    } else {
      fsx.ensureDir(path)
        .then(() => {
          console.log('success create!')
        })
        .catch(err => {
          console.error(err)
        })
    }
  } catch (err) {
    console.log(err)
  }
}