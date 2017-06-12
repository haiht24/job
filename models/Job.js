var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var jobSchema = new Schema({
    employerId: Number,
    jobId: {type: Number, required: true, unique: true},
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
    JobModel.find({jobId : self.jobId}, function (err, docs) {
        if (typeof docs !== 'undefined' && docs.length === 0){
            next();
        }else{
            console.log('Job exists: ', self.title);
        }
    });
});
var JobModel = mongoose.model('Jobs', jobSchema);
module.exports = JobModel;