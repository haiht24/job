var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var jobSchema = new Schema({
    employerId: Number,
    jobId: {type: Number},
    title: String,
    description: String,
    location: String,
    date: String,
    type: String,
    vwa: String,
    specialty: String,
    url: String,
    inserted: {type: Number, default: 0},
    sjbId: {type: Number, default: 0},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

jobSchema.pre('save', function(next) {
    var self = this;
    if(self.jobId){
        JobModel.find({jobId : self.jobId}, function (err, docs) {
            if (typeof docs !== 'undefined' && docs.length === 0){
                next();
            }else{
                console.log('Job exists: ', self.title);
            }
        });
    }else{
        JobModel.find({url : self.url}, function (err, docs) {
            if (typeof docs !== 'undefined' && docs.length === 0){
                next();
                console.log('new url inserted %s', self.url);
            }else{
                console.log('url exists: ', self.url);
            }
        });
    }

});
var JobModel = mongoose.model('Jobs-2', jobSchema);
module.exports = JobModel;