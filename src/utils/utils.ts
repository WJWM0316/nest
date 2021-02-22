import numeral from 'numeral';
export const error = {
  v: "#VALUE!",    //错误的参数或运算符
  n: "#NAME?",     //公式名称错误
  na: "#N/A",      //函数或公式中没有可用数值
  r: "#REF!",      //删除了由其他公式引用的单元格
  d: "#DIV/0!",    //除数是0或空单元格
  nm: "#NUM!",     //当公式或函数中某个数字有问题时
  nl: "#NULL!",    //交叉运算符（空格）使用不正确
  sp: "#SPILL!"    //数组范围有其它值
}

//获取数据类型
function getObjType (obj) {
  let toString = Object.prototype.toString;

  let map = {
      '[object Boolean]': 'boolean',
      '[object Number]': 'number',
      '[object String]': 'string',
      '[object Function]': 'function',
      '[object Array]': 'array',
      '[object Date]': 'date',
      '[object RegExp]': 'regExp',
      '[object Undefined]': 'undefined',
      '[object Null]': 'null',
      '[object Object]': 'object'
  }
  return map[toString.call(obj)];
}

// import method from '../global/method';

/**
 * Common tool methods
 */

/**
 * Determine whether a string is in standard JSON format
 * @param {String} str 
 */
function isJsonString(str) {
    try {
        if (typeof JSON.parse(str) == "object") {
            return true;
        }
    }
    catch (e) { }
    return false;
}


//获取当前日期时间
function getNowDateTime(format) {
    let now : any = new Date();
    let year : any = now.getFullYear();  //得到年份
    let month : any = now.getMonth();  //得到月份
    let date : any = now.getDate();  //得到日期
    let day : any = now.getDay();  //得到周几
    let hour : any = now.getHours();  //得到小时
    let minu : any = now.getMinutes();  //得到分钟
    let sec : any = now.getSeconds();  //得到秒

    month = month + 1;
    if (month < 10) month = "0" + month;
    if (date < 10) date = "0" + date;
    if (hour < 10) hour = "0" + hour;
    if (minu < 10) minu = "0" + minu;
    if (sec < 10) sec = "0" + sec;

    let time = '';

    //日期
    if(format == 1) {
        time = year + "-" + month + "-" + date;
    }
    //日期时间
    else if(format == 2) {
        time = year + "-" + month + "-" + date+ " " + hour + ":" + minu + ":" + sec;
    }

    return time;
}

//颜色 16进制转rgb
function hexToRgb(hex) {
    let color = [], rgb = [];
    hex = hex.replace(/#/, "");

    if (hex.length == 3) { // 处理 "#abc" 成 "#aabbcc"
        let tmp = [];

        for (let i = 0; i < 3; i++) {
            tmp.push(hex.charAt(i) + hex.charAt(i));
        }

        hex = tmp.join("");
    }

    for (let i = 0; i < 3; i++) {
        color[i] = "0x" + hex.substr(i + 2, 2);
        rgb.push(parseInt(color[i]));
    }

    return 'rgb(' + rgb.join(",") + ')';
};

//颜色 rgb转16进制
function rgbTohex(color) {
    let rgb;

    if (color.indexOf("rgba") > -1) {
        rgb = color.replace("rgba(", "").replace(")", "").split(',');
    }
    else {
        rgb = color.replace("rgb(", "").replace(")", "").split(',');
    }

    let r = parseInt(rgb[0]);
    let g = parseInt(rgb[1]);
    let b = parseInt(rgb[2]);

    let hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

    return hex;
};

//列下标  字母转数字
function ABCatNum(a) {
    if(a==null || a.length==0){
        return NaN;
    }
    var str=a.toLowerCase().split("");
    var num=0;
    var al = str.length;
    var getCharNumber = function(charx){
        return charx.charCodeAt() -96;
    };
    var numout = 0;
    var charnum = 0;
    for(var i = 0; i < al; i++){
        charnum = getCharNumber(str[i]);
        numout += charnum * Math.pow(26, al-i-1);
    };
    // console.log(a, numout-1);
    if(numout==0){
        return NaN;
    }
    return numout-1;
};

//列下标  数字转字母
function chatatABC(n) {
    var orda = 'a'.charCodeAt(0); 
   
    var ordz = 'z'.charCodeAt(0); 
   
    var len = ordz - orda + 1; 
   
    var s = ""; 
   
    while( n >= 0 ) { 
   
        s = String.fromCharCode(n % len + orda) + s; 
   
        n = Math.floor(n / len) - 1; 
   
    } 
   
    return s.toUpperCase(); 
};

//数组去重
function ArrayUnique(dataArr) {
    let result = [];
    let obj = {};
    if (dataArr.length > 0) {
        for (let i = 0; i < dataArr.length; i++) {
            let item = dataArr[i];
            if (!obj[item]) {
                result.push(item);
                obj[item] = 1;
            }
        }
    }
    return result
}

//是否有中文
function hasChinaword(s) {
  let patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
  
  if (!patrn.exec(s)) {
      return false;
  }
  else {
      return true;
  }
}
function isdatetime(s) {
  if (s == null || s.toString().length < 5) {
      return false;
  } else if (checkDateTime(s)) {
      return true;
  } else {
      return false;
  }

  function checkDateTime(str) {
      var reg1 = /^(\d{4})-(\d{1,2})-(\d{1,2})(\s(\d{1,2}):(\d{1,2})(:(\d{1,2}))?)?$/;
      var reg2 = /^(\d{4})\/(\d{1,2})\/(\d{1,2})(\s(\d{1,2}):(\d{1,2})(:(\d{1,2}))?)?$/;

      if (!reg1.test(str) && !reg2.test(str)) {
          return false;
      }

      var year : any = RegExp.$1,
          month : any = RegExp.$2,
          day : any = RegExp.$3;

      if (year < 1900) {
          return false;
      }

      if (month > 12) {
          return false;
      }

      if (day > 31) {
          return false;
      }

      if (month == 2) {
          if (new Date(year, 1, 29).getDate() == 29 && day > 29) {
              return false;
          } else if (new Date(year, 1, 29).getDate() != 29 && day > 28) {
              return false;
          }
      }

      return true;
  }
}
function isdatatype(s) {
  let type = "string";

  if (isdatetime(s)) {
      type = "date";
  }
  else if (!isNaN(parseFloat(s)) && !hasChinaword(s)) {
      type = "num";
  }

  return type;
}

//数字格式
function numFormat(num, type?) {
    if (num == null || isNaN(parseFloat(num)) || hasChinaword(num) || num == -Infinity || num == Infinity) {
        return null;
    }

    let floatlen = 6, ismustfloat = false;
    if (type == null || type == "auto") {
        if (num < 1) {
            floatlen = 6;
        }
        else {
            floatlen = 1;
        }
    }
    else {
        if (isdatatype(type) == "num") {
            floatlen = parseInt(type);
            ismustfloat = true;
        }
        else {
            floatlen = 6;
        }
    }

    let format = "", value = null;
    for (let i = 0; i < floatlen; i++) {
        format += "0";
    }

    if (!ismustfloat) {
        format = "[" + format + "]";
    }

    if (num >= 1e+21) {
        value = parseFloat(numeral(num).value());
    }
    else {
        value = parseFloat(numeral(num).format("0." + format));
    }

    return value;
}

function transformRangeToAbsolute(txt1){
    if(txt1 ==null ||txt1.length==0){
        return null;
    }

    let txtArray = txt1.split(",");
    let ret = "";
    for(let i=0;i<txtArray.length;i++){
        let txt = txtArray[i];
        let txtSplit = txt.split("!"), sheetName="", rangeTxt="";
        if(txtSplit.length>1){
            sheetName = txtSplit[0];
            rangeTxt = txtSplit[1];
        }
        else{
            rangeTxt = txtSplit[0];
        }

        let rangeTxtArray = rangeTxt.split(":");

        let rangeRet = "";
        for(let a=0;a<rangeTxtArray.length;a++){
            let t = rangeTxtArray[a];

            let row = t.replace(/[^0-9]/g, "");
            let col = t.replace(/[^A-Za-z]/g, "");
            let rangeTT = ""
            if(col!=""){
                rangeTT += "$" + col;
            }

            if(row!=""){
                rangeTT += "$" + row;
            }

            rangeRet+=rangeTT+":";
        }

        rangeRet = rangeRet.substr(0, rangeRet.length-1);

        ret += sheetName + rangeRet + ",";
    }

    return ret.substr(0, ret.length-1); 
}



/**
 * 监控对象变更
 * @param {*} data 
 */

const createProxy = (data, k, callback) => {
    if(!data.hasOwnProperty(k)){ 
        console.info('No %s in data',k);
        return; 
    };

    if (getObjType(data) === 'object') {
        if (getObjType(data[k]) === 'object' || getObjType(data[k]) === 'array') {
            defineObjectReactive(data, k, data[k], callback)
        } else {
            defineBasicReactive(data, k, data[k], callback)
        }
    }
}
  
function defineObjectReactive(obj, key, value, callback) {
    // 递归
    obj[key] = new Proxy(value, {
      set(target, property, val, receiver) {
        
          setTimeout(() => {
            callback(target, property, val, receiver);
          }, 0);

        return Reflect.set(target, property, val, receiver)
      }
    })
}
  
function defineBasicReactive(obj, key, value, callback) {
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: false,
      get() {
        return value
      },
      set(newValue) {
        if (value === newValue) return
        console.log(`发现 ${key} 属性 ${value} -> ${newValue}`)

        setTimeout(() => {
            callback(value,newValue);
        }, 0);

        value = newValue

      }
    })
}

/**
 * Remove an item in the specified array
 * @param {array} array Target array 
 * @param {string} item What needs to be removed
 */
function arrayRemoveItem(array, item) {
    array.some((curr, index, arr)=>{
        if(curr === item){
            arr.splice(index, 1);
            return curr === item;
        }
    })
}

//是否是空值
function isRealNull(val) {
  if(val == null || val.toString().replace(/\s/g, "") == ""){
      return true;
  }
  else{
      return false;
  }
}

//是否是纯数字
function isRealNum(val) {
  if(val == null || val.toString().replace(/\s/g, "") === ""){
      return false;
  }

  if(typeof val == "boolean"){
      return false;
  }

  if(!isNaN(val)){
      return true;
  }
  else{
      return false;
  }
}

//是否是错误类型
function valueIsError(value) {
  let isError = false;

  for(let x in error){
      if(value == error[x]){
          isError = true;
          break;
      }
  }

  return isError;
}

export {
    isdatetime,
    numFormat,
    isJsonString,
    hasChinaword,
    getObjType,
    getNowDateTime,
    hexToRgb,
    rgbTohex,
    ABCatNum,
    chatatABC,
    ArrayUnique,
    transformRangeToAbsolute,
    createProxy,
    arrayRemoveItem,
    isRealNull,
    isRealNum,
    valueIsError
}