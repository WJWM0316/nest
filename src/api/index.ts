import { Console } from "console";

const request = require('request')
// let util = require('util');
const iconv = require("iconv-lite");
var BufferHelper = require('bufferhelper');
const http = require('http')
const zlib = require('zlib')
const querystring = require('querystring');

function httpRequest({ method, url, data, req, res }) {
  let host = process.env.API_HOST
  let headers = req.headers
  delete headers.origin
  var requestUrl = host + url;
  if (method === 'GET' && data && JSON.stringify(data) !== "{}") {
    requestUrl = `${requestUrl}?`
    for (var i in data) {
      requestUrl = `${requestUrl}&${i}=${data[i]}`
    }
  }
  headers = {
    ...headers,
    'Content-Type': 'application/json;charset=UTF-8',
    // 'Content-Encoding': 'identity',
    // 'Charset': 'UTF8' // 设置请求字符集编码
  }
  return new Promise(function (resolve, reject) {
    let decodedBody = null
    request({
      encoding: null,
      url: requestUrl,
      method,
      form: JSON.stringify(data),
      headers,
    }, function (err, response, body) {
      if (!err && response) {
        try {
          if (body) {
            body = zlib.unzipSync(body)
            let bufferHelper = new BufferHelper();
            bufferHelper.concat(body);
            decodedBody = iconv.decode(bufferHelper.toBuffer(), 'utf8');
          }
          let putData = JSON.parse(body)
          resolve(putData)
        }
        catch (err) {
          res.json({
            httpCode: 400,
            data: decodedBody,
            response: response,
            err: err
          })
        }
      } else {
        res.json({
          httpCode: 400,
          data: decodedBody,
          response: response,
          err: err
        })
      }
    })
  })

  //   const postData = querystring.stringify({
  //     excelId: '1306501568331317248'
  //   });
  //   console.log(postData)
  //   const options = {
  //     // hostname: 'uatepmportal.midea.com',
  //     host: '10.9.25.51', //process.env.API_HOST,
  //     // host: '10.18.40.115',
  //     port: 8095,
  //     path: url,
  //     method: 'POST',
  //     headers: {
  //       ...headers,
  //       'Content-Type':'application/x-www-form-urlencoded',
  //       'Content-Length': Buffer.byteLength(postData)
  //     }
  //   };
  //   try {
  //   const req0 = http.request(options, (res0) => {
  //     res0.setEncoding('utf8');
  //     let bufferHelper = new BufferHelper();
  //     res0.on('data', (chunk) => {
  //       console.log(`响应主体: ${chunk}`);
  //       res.send(chunk)
  //       // bufferHelper.concat(chunk);
  //       // console.log(bufferHelper.toBuffer())

  //     });
  //     res0.on('end', () => {
  //       // let a = bufferHelper.toBuffer()
  //       // console.log(a, 22)
  //       // let decodedBody = iconv.decode(a, 'GBK');
  //       // console.log(decodedBody, 111)
  //       // console.log('响应中已无数据');
  //     });
  //   });

  //   req0.on('error', (e) => {
  //     console.error(`请求遇到问题: ${e.message}`);
  //   });

  //   // 将数据写入请求主体。
  //   req0.write(postData);
  //   req0.end();
  // } catch(e) {
  //   console.log(e, 11)
  // }
}
module.exports = httpRequest;

