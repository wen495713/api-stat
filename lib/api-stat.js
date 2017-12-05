'use strict'

module.exports = exports = ApiStat;

var status = {};

function ApiStat() {

	return function(req, res, next) {
		if (req.url.indexOf('apistat') === -1) {
			req._remoteAddress = getip(req);
			req._startAt = process.hrtime();
			req._startTime = Date.now();

			res.on('finish', createOnFinishFn(req, res))
		}
		next()
	}
}

ApiStat.registMoniter = function(app){

	app.get('/apistat', function(req, res){
		var path = req.query.path || '';
		if (path.length < 1) {
			var urls = Object.keys(status);
			urls = urls.map(function (url) {
				var stat = status[url];
				return [
					url,
					['call', stat.call_num].join(':'),
					['fail', stat.fail].join(':'),
					['len', stat.total_out_len].join(':')
				].join(' - ');
			})
			res.json(urls);
		}else{
			res.json(status[path])
		}
	})
}

ApiStat.limit = 10;

ApiStat.getStatus = function(name){
	return status;
}

function createOnFinishFn(req, res){
	return function(){
		res._startAt = process.hrtime();
		var the_status = status[req.url];
		if (!the_status) {
			the_status = status[req.url] = {};
			the_status.records = [];
			the_status.total_out_len = 0;
			the_status.call_num = 0;
			the_status.fail = 0;
		}
		var r = {
			code: res.statusCode,
			ip: req._remoteAddress,
			start: req._startTime,
			length: res._contentLength
		}
		r.cast = (res._startAt[0] - req._startAt[0]) * 1e3 + (res._startAt[1] - req._startAt[1]) * 1e-6;
		r.cast = Math.ceil(r.cast);

		the_status.records.push(r);

		// 记录限制条数
		if (the_status.length > ApiStat.limit) the_status.records = the_status.records.slice(0, limit);

		// 最大延迟
		if (!the_status.most_cast || the_status.most_cast.cast <= r.cast) the_status.most_cast = r;
		// 最大包体
		if (!the_status.most_length || the_status.most_length.length <= r.length) the_status.most_length = r;

		the_status.call_num++;
		if (r.code !== 200) the_status.fail++;
		the_status.total_out_len += r.length;
	}
}

/**
 * Get request IP address.
 *
 * @private
 * @param {IncomingMessage} req
 * @return {string}
 */

function getip (req) {
  return req.ip ||
    req._remoteAddress ||
    (req.connection && req.connection.remoteAddress) ||
    undefined
}