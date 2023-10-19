const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const dbURI = 'mongodb+srv://Sanurauf:Rauf123@portfolios.yawwhjg.mongodb.net/?retryWrites=true&w=majority'

// Connect to the MongoDB database
mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
  });
  
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

// Serve static files from the 'public' directory
app.use(express.static(__dirname + '/public'));

// Set up static route to serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Define the Project schema
const projectSchema = new mongoose.Schema({
    title: String,
    subtitle: String,
    description: String,
    projectUrl: String,
    languages: [String],
    coverPhoto: String,
    images: [
        {
            url: String,
            alt: String,
        },
    ],
});

// Create a Project model
const Project = mongoose.model('Project', projectSchema);



// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public', 'uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Sample data
const data = {
    yourName: "Abdulla Rauf",
    yourProfession: "Software Developer",
    yourInterests: "Creating application , Web designing UI/UX Designing",
    yearsOfExperience: "one year ",
    yourField: "Information Technologies",
    somethingILove: "Designing great userinterface to web and app",
    yourMission: "Launch my own buiness",
    hobbiesOrInterests: "Playing crickets , football and drawing some designs",
    contact: {
        email: "abdullarauf297@gmail.com",
        phone: "+91 8589019102",
        address: "676523, Karuvarakundu,Kerala , India"
    }
};

// Set the view engine to EJS (you need to have EJS installed)
app.set('view engine', 'ejs');

// Define the route for the home page
app.get('/', async (req, res) => {
    try {
        const projects = await Project.find();
        res.render('index', { projects, data });
    } catch (error) {
        console.error('Error fetching project data:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Define a route for submitting a contact form
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const MessageSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String
});

const Message = mongoose.model('Message', MessageSchema);

app.post('/submit', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            throw new Error('Please fill in all fields.');
        }

        const newMessage = new Message({
            name,
            email,
            message
        });

        await newMessage.save();

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.render('index', { data, errorMessage: error.message });
    }
});

// Define a route for displaying projects
app.get('/projects', async (req, res) => {
    try {
        const projects = await Project.find();

        // Construct the image URLs for projects
        const projectsWithImageURLs = projects.map(project => {
            return {
                ...project._doc,
                images: project.images.map(image => {
                    return {
                        ...image,
                        url: path.join('/uploads', image.url) // Construct the image URL here
                    };
                }),
                coverPhoto: path.join('/uploads', project.coverPhoto) // Construct the cover photo URL here
            };
        });

        res.render('projects', { projects: projectsWithImageURLs, data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Define a route for displaying project descriptions
app.get('/projects/:projectId', async (req, res) => {
    try {
        const projectId = req.params.projectId; // Extract the project ID from the URL
        const project = await Project.findById(projectId);

        if (!project) {
            // Handle the case where the project with the specified ID is not found
            return res.status(404).send('Project not found');
        }

        res.render('description', { project });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


// Define a route for adding new projects
app.post('/admin/add', upload.fields([
    { name: 'coverPhoto', maxCount: 1 },
    { name: 'images', maxCount: 5 }
]), async (req, res) => {
    try {
        const { title, subtitle, description, projectUrl, languages } = req.body;
        const coverPhoto = req.files['coverPhoto'][0];
        const additionalImages = req.files['images'].map((file) => ({
            url: `/uploads/${file.filename}`,
            alt: 'Image Alt Text',
        }));

        const project = new Project({
            title,
            subtitle,
            description,
            projectUrl,
            languages,
            coverPhoto: `/uploads/${coverPhoto.filename}`,
            images: additionalImages,
        });

        await project.save();
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
