'use strict';

const debug = require('debug');
const debugInfo = debug('module:info');

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');

// -GitHub 認証のための処理----------------------------------------
var session = require('express-session');
var passport = require('passport');
var GitHubStrategy = require('passport-github2').Strategy;
var GITHUB_CLIENT_ID = 'b8f5aebffc72210cea55';
var GITHUB_CLIENT_SECRET = 'c6b4d59fcd0ff616a9366aa987ed607f83c74ae5';
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});
passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:8000/auth/github/callback'
},
  function(accessToken, refreshToken, profile, done){
    process.nextTick(function(){
      return done(null, profile);
    });
  }
));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var firstRouter = require('./routes/first');

var app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret:'a827a5b5cdec9ef3', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/first', firstRouter);
// GitHub への認証を行うための処理をGETで /auth/github にアクセスした際に行うもの
// リクエストが行われた際の処理もなにもしない関数として登録
app.get('/auth/github',
  passport.authenticate('github', {
    scope: ['user:email']
  }),
  function (req, res) {});
// 認証が失敗した際にはサイドログインを促す /login にリダイレクトする
app.get('/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/login'
  }),
  function (req, res) {
    res.redirect('/');
  });
// passport-twitter 用

app.get('/login', function(req, res){
  res.render('login'); // /login にGETでアクセスがあった時に login.pug を描写する
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/'); // /logout にGETでアクセスがあった時にログアウトを実施し、/ のドキュメントルートへリダイレクトさせる
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
