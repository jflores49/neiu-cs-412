let User = require('../models/user').User
const {body, validationResult} = require('express-validator')
const passport = require('passport')

exports.userController = {
    create: async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(e => e.msg + '</br>').join(''))
            res.redirect('/users/register')
        } else {
            try {
                let userParams = getUserParams(req.body)
                let newUser = new User(userParams)
                let user = await User.register(newUser, req.body.password)
                req.flash('success', `${user.fullName}'s account created successfully`)
                res.redirect('/users/login')
            } catch (err) {
                console.log(`Error saving user: ${err.message}`)
                req.flash('error', 'Failed to create user account. Invalid email.')
                res.redirect('back')
            }
        }
    },
    authenticate: async (req, res, next) => {
        await passport.authenticate('local', function (err, user, info) {
            if (err)
                return next(err)
            if (!user) {
                req.flash('error', 'Failed to login')
                return res.redirect('/users/login')
            }
            req.logIn(user, function (err) {
                if (err)
                    return next(err)
                req.flash('success', `${user.fullName} logged in!`)
                return res.redirect('/')
            })
        })(req, res, next);
    },

    loggingOut: async (req, res, next) => {
        try {
            req.logout()
            req.flash('success', 'Successfully logged out')
            res.redirect('/')
        } catch (err) {
            next(err)
        }
    },

    profile: async (req, res, next) => {
        if (req.isAuthenticated()) {
            try {
                res.render('users/myaccount', {
                    isCreate: true,
                    title: 'My Account',
                    styles: ['/stylesheets/style.css', '/stylesheets/style2.css'],
                    tabName: 'Profile',
                    isMyAccountActive: 'active'
                })
            } catch (err) {
                next(err)
            }
        } else {
            req.flash('error', 'Please log in to access page')
            res.redirect('/users/login')
        }
    },

    passwordChange: async (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(e => e.msg + '</br>').join(''))
            res.redirect('/users/myaccount')
        } else {
            try {
                let user = await User.findById({_id: req.user.id.trim()})
                user.changePassword(req.body.password, req.body.newpassword)
                req.flash('success', 'Successfully changed password')
                res.redirect('/')
            } catch (err) {
                next(err)
            }
        }
    },

    editProfile: async (req, res, next) => {
        if (req.isAuthenticated()) {
            try {
                res.render('users/edit_profile', {
                    title: 'Edit Profile',
                    styles: ['/stylesheets/style.css', '/stylesheets/style2.css'],
                    tabName: 'Edit Profile'
                })
            } catch (err) {
                next(err)
            }
        } else {
            req.flash('error', 'Please log in to access page')
            res.redirect('/users/login')
        }
    },

    updateProfile: async (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(e => e.msg + '</br>').join(''))
            res.redirect('/users/edit-profile')
        } else {
            try {
                req.user = await User.findByIdAndUpdate({_id: req.user.id.trim()}, {
                    email: req.body.email,
                    name: {first: req.body.first, last: req.body.last}
                }, {new: true})
                req.flash('success', 'Successfully edited profile')
                res.redirect('/users/myaccount')
            } catch (err) {
                next(err)
            }
        }
    },
}

const getUserParams = body => {
    return {
        name: {
            first: body.first,
            last: body.last
        },
        email: body.email,
        password: body.password
    }
}

exports.registerValidations = [
    body('first')
        .notEmpty().withMessage('First name is required')
        .isLength({min: 2}).withMessage('First name must be at least 2 characters'),
    body('last')
        .notEmpty().withMessage('Last name is required')
        .isLength({min: 2}).withMessage('Last name must be at least 2 characters'),
    body('email')
        .isEmail().normalizeEmail().withMessage('Email is invalid'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({min: 8}).withMessage('Password must be at least 8 characters'),
]

exports.passwordValidations = [
    body('password')
        .notEmpty().withMessage('Current password is incorrect'),
    body('newpassword')
        .notEmpty().withMessage('New Password is required')
        .isLength({min: 8}).withMessage('New Password must be at least 8 characters'),
]

exports.profileValidations = [
    body('first')
        .notEmpty().withMessage('First name is required')
        .isLength({min: 2}).withMessage('First name must be at least 2 characters'),
    body('last')
        .notEmpty().withMessage('Last name is required')
        .isLength({min: 2}).withMessage('Last name must be at least 2 characters'),
    body('email')
        .isEmail().normalizeEmail().withMessage('Email is invalid'),
]