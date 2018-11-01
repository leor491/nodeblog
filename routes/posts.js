'use strict';

var express = require('express');
var router = express.Router();

var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

var multer = require('multer');
var upload = multer({dest:'./uploads'});



router.get('/add', function(req, res, next) {
	var categories = db.get('categories');
	categories.find({}, {}, function(err, categories){
		res.render('addpost', {
			title:'Add Post',
			categories
		});
	})
});

router.post('/add', upload.single('mainimg'), function(req, res, next) {
	var {title, category, body, author} = req.body;
	var date = new Date();

	//old way?
	var mainimage = req.file ? req.file.filename : 'noimage.jpg';

	req.checkBody('title', 'Title field is required').notEmpty();
	req.checkBody('category', 'Category field is required').notEmpty();
	req.checkBody('body', 'Body field is required').notEmpty();
	req.checkBody('author', 'Author field is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('addpost', {
			errors
		});
	} else {
		var posts = db.get('posts');
		posts.insert({
			title,
			body,
			category,
			date,
			author,
			mainimage
		}, function(err, post){
			if(err){
				res.send('err');
			} else {
				req.flash('success', 'Post Added');
				res.location('/');
				res.redirect('/');
			}
		});
	}

});

router.post('/add_comment', function(req, res, next) {
	var {name, email, body, postid} = req.body;
	var commentdate = new Date();

	req.checkBody('name', 'name field is required').notEmpty();
	req.checkBody('email', 'Category field is required but never displayed').notEmpty();
	req.checkBody('email', 'Category field is not valid').isEmail();
	req.checkBody('body', 'Body field is required').notEmpty();
	req.checkBody('postid', 'id field is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
        req.flash('errors', '1 or more validation errors.');
        res.location(`/posts/show/${postid}`);
        res.redirect(`/posts/show/${postid}`);
	} else {
		var posts = db.get('posts');
		var comment = {name, email, body, commentdate};

		posts.update({
			"_id": postid
		}, {
			$push: {
				"comments": comment
			}
		}, function(err, doc){
			if(err){
				console.error(err);
			} else {
				req.flash('success', 'Comment Added');
				res.location(`/posts/show/${postid}`);
				res.redirect(`/posts/show/${postid}`);
			}
		});
	}
});

router.get('/show/:id', function(req, res, next) {
	var posts = db.get('posts');
	posts.findOne({'_id': req.params.id}, function(err,post){
		res.render('show',{
			post
		});
	});
});

module.exports = router;
