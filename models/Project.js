const mongoose = require('mongoose');

// Define the schema for the Project model
const projectSchema = new mongoose.Schema({
    title: String,
    subtitle: String,
    description: String,
    projectUrl: String,
    languages: [String], // Assuming languages is an array of strings
    coverPhoto: String,
    images: [
        {
            url: String,
            alt: String,
        },
    ],
});

// Create the Project model
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
