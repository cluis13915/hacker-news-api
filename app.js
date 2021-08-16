var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var storiesRouter = require('./routes/stories');
var connector = require('./utils/connector');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(connector);
app.use('/', indexRouter);
app.use('/stories', storiesRouter);

module.exports = app;
