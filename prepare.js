var defaultDir = './json-files/';
function createNeededFiles() {
    var files = [
        'link-employers-will-get-jobs.json',
        'link-jobs-will-crawl.json',
        'arrayEplInserted.json',
        'existed-employers-in-SJB.json',
        'array-jobs-will-add-to-SmartJobBoard.json',
        'existed-jobs-in-SJB.json',
        'trackingJobsInserted.json'
    ];
    var fs = require('node-fs');
    for(var i = 0; i < files.length; i++){
        var f = files[i];
        f = defaultDir + f;
        fs.stat(f, function(err, stat) {
            if(err === null) {
                console.log('File exists');
            } else if(err.code === 'ENOENT') {
                // file does not exist
                fs.writeFile(f, '[]');
            } else {
                console.log('Some other error: ', err.code);
            }
        });
    }
}
createNeededFiles();