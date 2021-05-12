const killProcess = ({
    pid,
    signal = 'SIGTERM',
} = {}) => {
    try{
        let x = true;
        process.kill(pid, signal);
        do {
            try {
                process.kill(pid, 0);
            } catch (e) {
                x = false;
                return console.log('process kill 3 ', e);
            }
        } while (x)
    }catch(e2){
        return console.log('process exist ',e2 )
    }
};
killProcess({
    pid: 10416
});