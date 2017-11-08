'use strict';

var debug = require('debug')('http');
var express = require('express');
var app = express();

function createWriteHead(preFn, myFn){
	var fire = false;
	return function wirteHead(){
		if (!fire) {
			myFn.apply(this, arguments);
			fire = true;
		}
		preFn.apply(this, arguments);
	}
}

app.get('/aaa/bbb',(req, res, next) =>{
	function _myfn(){
		debug('res writeHead');
	}
	res.writeHead = createWriteHead(res.writeHead, _myfn);
	debug('middleware');
	req.on('aborted', function(){
		debug('req aborted');
	})
	req.on('close', function(){
		debug('req close');
	})
	res.on('finish', function(){
		// res._headers['content-length']
		debug(res);
		debug('res finish');
	})
	next()
}, (req, res) =>{
	debug('send');
	res.json({ret: 'okk'})
})

app.listen(8000, function(){
	debug('service listen on 8000');
})