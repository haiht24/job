var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var employerSchema = new Schema({
    eplId: {type: Number, required: true, unique: true},
    name: String,
    emailsContact: String,
    about: String,
    // jobs: Array,
    logo: String,
    banner: String,
    etc: String,
    urlAllJobs: String,
    url: String,
    inserted: {type: Number, default: 0},
    sjbId: {type: Number, default: 0},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// check exist epl
employerSchema.pre('save', function(next) {
    var self = this;
    EmployerModel.find({eplId : self.eplId}, function (err, docs) {
        if (!docs.length){
            next();
        }else{
            console.log('Employer exists: ', self.name);
            // next(new Error("Employer exists!"));
        }
    });
});
var EmployerModel = mongoose.model('Employers', employerSchema);
module.exports = EmployerModel;