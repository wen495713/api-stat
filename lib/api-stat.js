'use strict'

module.exports = exports = ApiStat;

var status = {};

var top_cast = {cast: 0}, top_len = {length: 0}, all_call = 0, all_len = 0;

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
		var limit = parseInt(req.query.limit) || 5;
		var sort = req.query.sort === 'len'? 'len' : 'call';
		var path = req.query.path || '';
		console.log(status);
		if (path.length < 1) {
			var urls = Object.keys(status);
			urls = urls
				.sort(function(pre, nxt){
					var p_stat = status[pre];
					var n_stat = status[nxt];
					if (sort === 'len') {
						return p_stat.total_out_len < n_stat.total_out_len;
					}else{
						return p_stat.call_num < n_stat.call_num;
					}
				})
				.slice(0, limit)
				.map(function (url) {
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

	app.get('/apistat/top', function(req, res){
		res.json({
			top_cast: top_cast, top_len: top_len,
			all_call: all_call, all_len: all_len
		})
	})
}

ApiStat.limit = 10;

ApiStat.getStatus = function(name){
	return status;
}

function createOnFinishFn(req, res){
	return function(){
		res._startAt = process.hrtime();
		var url = req._parsedUrl.pathname;
		url = url+'_'+req.method;

		var the_status = status[url];
		if (!the_status) {
			the_status = status[url] = {};
			the_status.records = [];
			the_status.total_out_len = 0;
			the_status.call_num = 0;
			the_status.fail = 0;
		}

		var len;
		try{
			len = parseInt(res._headers['content-length']);
		}catch(e){
		}
		var r = {
			code: res.statusCode,
			ip: req._remoteAddress,
			start: req._startTime,
			length: res._contentLength || len || 0,

			query: req.query,
			body: req.body,
		}
		r.cast = (res._startAt[0] - req._startAt[0]) * 1e3 + (res._startAt[1] - req._startAt[1]) * 1e-6;
		r.cast = Math.ceil(r.cast);

		the_status.records.push(r);

		// 记录限制条数
		if (the_status.length > ApiStat.limit) the_status.records = the_status.records.slice(-limit);

		// 该接口 最大延迟
		if (!the_status.most_cast || the_status.most_cast.cast <= r.cast) the_status.most_cast = r;
		// 该接口 最大包体
		if (!the_status.most_length || the_status.most_length.length <= r.length) the_status.most_length = r;

		// 所有接口 最大延迟
		if (top_cast.cast < r.cast) top_cast = r;

		// 所有接口 最大包体
		if (top_len.length < r.length) top_len = r;

		// 调用数
		the_status.call_num++;
		// 失败调用数
		if (r.code !== 200) the_status.fail++;
		// 总流量
		the_status.total_out_len += r.length;
		// 所有接口总调用数
		all_call++;
		// 所有接口总流量
		all_len += r.length;
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