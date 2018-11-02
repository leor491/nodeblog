'use strict';

var express = require('express');
var router = express.Router();

var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

router.get('/add', function(req, res, next) {
	res.render('addcategory', {
		title:'Add Category'
	});
});

router.post('/add', function(req, res, next) {
	var {name} = req.body;
	var date = new Date();

	req.checkBody('name', 'Name field is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
        console.error(JSON.stringify(errors));
        //todo
        req.flash('errors', 'Validation Error');
        res.location('/categories/add');
        res.redirect('/categories/add');
	} else {
		var categories = db.get('categories');
		categories.insert({
			name
		}, function(err, post){
			if(err){
				console.error(err);
                req.flash('errors', 'Category Not Added.');
				res.location('/categories/add');
				res.redirect('/categories/add');
			} else {
				req.flash('success', 'Category Added');
				res.location('/');
				res.redirect('/');
			}
		});
	}
});

router.get('/show/:category', function(req, res, next) {
	var posts = db.get('posts');
	posts.find({category: req.params.category}, {}, function(err, posts){
		res.render('index', {
			title: req.params.category,
			posts
		});
	});
});

module.exports = router;
