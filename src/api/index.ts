const request = require('request')
function httpRequest({method, url, data, req, res}) {
  let host = process.env.API_HOST
  let headers = req.headers
	delete headers.host
  delete headers.Host
	var requestUrl = host + url;
	if (method === 'GET' && data && JSON.stringify(data) !== "{}") {
		requestUrl = `${requestUrl}?`
		for (var i in data) {
			requestUrl = `${requestUrl}&${i}=${data[i]}`
		}
  }
  console.log(requestUrl, data)
	return new Promise(function (resolve, reject) {
		request({
			url: requestUrl,
      method,
      headers,
			form: data
		}, function (err, response, body) {
			if (!err && response) {
				try {
          var putData = JSON.parse(body)
					resolve(putData)
				}
				catch(err) {
				  res.send([requestUrl, err, response, body, '兄嘚接口報錯了'])
				}
			} else {
				res.send([requestUrl, err, response, body, '兄嘚接口報錯了'])
      }
		})
	})
}
module.exports = httpRequest;