const express = require('express');
const app = express();
const fapp = express();
const http = require('http');
const server = http.createServer(app);
const {
    Server
} = require("socket.io");
const io = new Server(server);

const fsx = require("fs-extra");
const fs = require("fs");
const path = require('path');
const cp = require('child_process');
const psTree = require('ps-tree');
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


function start(zalFromSocket) {
    zal = `zal${zalFromSocket}`;
    try {
        refreshFolder(`${directory}/${directoryView}/${directoryTr}/${zal}/`);
        var cmd = `ffmpeg -i ${conf[zal]} -c:v libx264 -c:a aac -ac 1 -strict -2 -crf 18 -profile:v baseline -maxrate 400k -bufsize 1835k -pix_fmt yuv420p -hls_time 10 -hls_list_size 6 -hls_wrap 10 -start_number 1 ${directory}/${directoryView}/${directoryTr}/${zal}/index.m3u8`;
        if ((zalFromSocket < 5) && (asd[zal] == undefined)) {
            asd[zal] = cp.exec(cmd, function (err, stdout, stderr) {
                if (err) {
                    console.log(err);
                } else if (stdout) {
                    console.log(stdout);
                } else if (stderr) {
                    console.log(stderr)
                }
            })
            let pid = asd[zal].pid
            psTree(pid, function (err, children) {
                asd[zal].ppid = asd[zal].pid;
                asd[zal].pid = +children[0].PID;
            });
            console.log(asd[zal].pid);
            state[zal] = true;
            console.log(state);
            io.emit('start', `${zal} start streaming`);
        }else if ((zalFromSocket < 5) && (asd[zal] != undefined)) {
            io.emit('error', `translation in ${zal} is plaing`);
        } else {
            io.emit('error', `check zal, ${zal} is exist`);
        }
    } catch (err) {
        console.log(err)
    }
}

function partialStop(zal) {
    asd[zal] = null;
    state[zal] = false;
    refreshFolder(`${directory}/${directoryView}/${directoryTr}/${zal}/`)
    io.emit('stop', `${zal} stop streaming`);
}

function killProcess({
    pid,
    signal = 'SIGTERM',
} = {}) {
    try {
        let x = true;
        process.kill(pid, signal);
        do {
            try {
                process.kill(pid, 0);
            } catch (e) {
                x = false;
                partialStop(zal);
                return console.log('process kill 3 ', e);
            }
        } while (x);
    } catch (e2) {
        partialStop(zal);
        return console.log('process exist ', e2)
    }
};

function stop(zalFromSocket) {
    zal = `zal${zalFromSocket}`;
    try {

        if ((zalFromSocket < 5) && (asd[zal] != undefined)) {
            console.log(asd[zal].pid);
            killProcess({
                pid: asd[zal].pid,
            });
        } else if ((zalFromSocket > 5) && (asd[zal] != undefined)) {
            io.emit('error', `check zal, ${zal} is exist`);
        } else {
            io.emit('error', `stream from ${zal} is exist`);
        }
    } catch (err) {
        console.log(err)
    }
}

fapp.listen(9000);

app.use('/', express.static(__dirname + `/${directory}`));
app.get('/z:id', function (req, res) {
    zal = req.params.id;
    res.status(200).sendFile(path.join(__dirname + `/${directory}` + `/z${zal}.html`));
});
fapp.use('/', express.static(__dirname + `/${directory}/${directoryView}`));
fapp.get('/', function (req, res) {
    res.status(200).sendFile(path.join(__dirname + `/${directory}/${directoryView}/` + `index.html`));
});

io.on('connection', (socket) => {
    console.log('client connected');
    socket.on('connection',(zal)=>{
        io.emit('connection',status[`zal${zal}`])
    })
    socket.on('start', (zal) => {
        console.log('message START from zal: ' + zal);
        start(zal);
    });
    socket.on('stop', (zal) => {
        console.log('message STOP from zal: ' + zal);
        stop(zal);
    });
});

server.listen(8000, () => {
    console.log('listening on *:8000');
});