const express = require('express');
const router = express.Router();
const User = require('../models/users'); // Assuming you have a User model
const multer = require('multer');
const fs = require("fs");
const path = require('path');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

var upload = multer({
    storage: storage,
}).single("image");

router.post('/add', upload, async (req, res) => {
    try {
        if (!req.file) {
            return res.json({ message: 'No file uploaded.', type: 'danger' });
        }

        if (!req.body.name) {
            return res.json({ message: 'Name is required.', type: 'danger' });
        }

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        });

        await user.save();

        req.session.message = {
            type: 'success',
            message: 'User added successfully!'
        };
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.json({ message: 'Failed to add user.', type: 'danger' });
    }
});

router.get('/', async (req, res) => {
    try {
        const users = await User.find().exec();
        res.render('index', {
            title: '',
            users: users,
        });
    } catch (err) {
        console.error(err);
        res.json({ message: err.message });
    }
});

router.get("/add", (req, res) => {
    res.render("add_users", { title: '' });
});

router.get("/edit/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id).exec();
        if (!user) {
            res.redirect('/');
        } else {
            res.render('edit_users', {
                title: "",
                user: user,
            });
        }
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

router.post('/update/:id', upload, async (req, res) => {
    try {
        const id = req.params.id;
        let new_image = '';

        if (req.file) {
            new_image = req.file.filename;

            // Delete the old image if it exists
            if (req.body.old_image) {
                // Add proper path to the unlinkSync function
                fs.unlinkSync(path.join(__dirname, '../uploads', req.body.old_image));
            }
        } else {
            new_image = req.body.old_image;
        }

        // Update the user using findByIdAndUpdate
        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        });

        req.session.message = {
            type: 'success',
            message: 'User updated successfully',
        };
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.json({ message: err.message, type: 'danger' });
    }
});

//delete user route
router.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id).exec();

        if (!user) {
            return res.json({ message: 'User not found.' });
        }

        if (user.image !== "") {
            try {
                fs.unlinkSync(`/uploads/${user.image}`);
            } catch (err) {
                console.log(err);
            }
        }

        await User.findOneAndDelete({ _id: id });

        req.session.message = {
            type: 'success',
            message: 'User deleted successfully!',
        };
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.json({ message: err.message });
    }
});



module.exports = router;
