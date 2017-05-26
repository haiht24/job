var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var employerSchema = new Schema({
    eplId: {type: Number, required: true, unique: true},
    name: String,
    emailsContact: String,
    about: String,
    jobs: Array,
    logo: String,
    banner: String,
    etc: String,
    urlAllJobs: String,
    url: String,
    inserted: {type: Number, default: 0},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});
var Employer = mongoose.model('Employer', employerSchema);
module.exports = Employer;