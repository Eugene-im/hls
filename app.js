const MyEmitter = require('events');
const myEmitter = new MyEmitter();
const express = require('express');
const fapp = express();
const app = express();
const fsx = require("fs-extra");
const fs = require("fs");
const path = require('path');
const cp = require('child_process');
const conf = require('./config.json');

const directory = 'video';
const directoryTr = 'trans';

var options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['m3u', 'mu8'],
  index: false,
  maxAge: '3600',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('Access-Control-Allow-Origin','*')
  }
}

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
fapp.use('/', express.static(__dirname + `/${directory}/${directoryTr}`));
app.get('/z:id', function (req, res) {
  res.status(200).sendFile(path.join(__dirname + `/${directory}` + `/z${req.params.id}.html`));
});
fapp.get('/z:id', function (req, res) {
  res.status(200).sendFile(path.join(__dirname + `/${directory}/${directoryTr}/zal${req.params.id}/index.m3u8`));
});

app.get('/start:id', function (req, res) {
  zal = `zal${req.params.id}`;
  var cmd = `ffmpeg -i ${conf[zal]} -c:v libx264 -c:a aac -ac 1 -strict -2 -crf 18 -profile:v baseline -maxrate 400k -bufsize 1835k -pix_fmt yuv420p -hls_time 10 -hls_list_size 6 -hls_wrap 10 -start_number 1 ${directory}/${directoryTr}/${zal}/index.m3u8`;

  if (req.params.id < 5) {
    if (!fs.existsSync(`${directory}/${directoryTr}/${zal}`)) {
      fsx.mkdirs(`${directory}/${directoryTr}/${zal}`);
    } else {
      deleteFolder(`${directory}/${directoryTr}/${zal}`);
      fsx.mkdirs(`${directory}/${directoryTr}/${zal}`);
    }

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
    res.status(200).send({
      status: "ok",
      text: `${zal} start streaming`
    });
  } else {
    res.status(400).send(`check zal, ${zal} is exist`);
  }

});


app.get('/stop:id', function (req, res) {
  zal = `zal${req.params.id}`;
  if ((req.params.id < 5) && (asd[zal] != undefined)) {
    res.status(200).send({
      status: "ok",
      text: `${zal} stop streaming`
    });
    asd[zal].stdin.write('q');
    asd[zal].on('exit', function () {
      asd[zal] = null;
      deleteFolder(`${directory}/${directoryTr}/${zal}`);
      fsx.mkdirs(`${directory}/${directoryTr}/${zal}`);
    })
    myEmitter.emit(`stop${req.params.id}`);

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
})

app.get('/state:id', function (req, res) {
  zal = `zal${req.params.id}`;
  if (state.zal1) {
    res.status(200).send({
      status: "ok",
      text: `stream from ${zal} is plaing`
    });
  } else if (state.zal2) {
    res.status(200).send({
      status: "ok",
      text: `stream from ${zal} is plaing`
    });
  } else if (state.zal3) {
    res.status(200).send({
      status: "ok",
      text: `stream from ${zal} is plaing`
    });
  } else if (state.zal4) {
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
//path = ;
function deleteFolder(path) {
  if (fsx.existsSync(path)) {
    fsx.remove(path, err => {
      if (err) console.error(err)
    })
  } else {
    console.error("file not exists")
  }
}