import { getObjType, ABCatNum, isRealNull, isRealNum, valueIsError, isdatetime } from './utils';
import { luckysheet_function } from './luckysheet_function';
import { formulaMore } from './formulaMore'
import { Interpreter } from 'eval5';
import { luckysheet_compareWith, luckysheet_getarraydata, luckysheet_getcelldata, luckysheet_parseData, luckysheet_getValue, luckysheet_indirect_check, luckysheet_indirect_check_return, luckysheet_offset_check, luckysheet_calcADPMM, luckysheet_getSpecialReference } from './func';
global['luckysheet_function'] = luckysheet_function
global['luckysheet_getcelldata'] = luckysheet_getcelldata
global['luckysheet_compareWith'] = luckysheet_compareWith
global['luckysheet_getarraydata'] = luckysheet_getarraydata
global['luckysheet_parseData'] = luckysheet_parseData
global['luckysheet_getValue'] = luckysheet_getValue
global['luckysheet_indirect_check'] = luckysheet_indirect_check
global['luckysheet_indirect_check_return'] = luckysheet_indirect_check_return
global['luckysheet_offset_check'] = luckysheet_offset_check
global['luckysheet_calcADPMM'] = luckysheet_calcADPMM
global['luckysheet_getSpecialReference'] = luckysheet_getSpecialReference

const formula = {
  sheet: null,
  execFunctionExist: null,
  cellTextToIndexList: {},
  operator: '==|!=|<>|<=|>=|=|+|-|>|<|/|*|%|&|^',
  operatorjson: null,
  execFunctionGlobalData: {},
  error: {
    v: "#VALUE!",    //错误的参数或运算符
    n: "#NAME?",     //公式名称错误
    na: "#N/A",      //函数或公式中没有可用数值
    r: "#REF!",      //删除了由其他公式引用的单元格
    d: "#DIV/0!",    //除数是0或空单元格
    nm: "#NUM!",     //当公式或函数中某个数字有问题时
    nl: "#NULL!",    //交叉运算符（空格）使用不正确
    sp: "#SPILL!"    //数组范围有其它值
  },
  errorInfo: function (err) {
    return err;
  },
  errorParamCheck: function (thisp, data, i) {
    let type, require;
    if (i < thisp.length) {
      type = thisp[i].type;
      require = thisp[i].require;
    }
    else {
      type = thisp[thisp.length - 1].type;
      require = thisp[thisp.length - 1].require;
    }

    if (require == "o" && (data == null || data == "")) {
      return [true, formulaMore.tipSuccessText];
    }

    if (type.indexOf("all") > -1) {
      return [true, formulaMore.tipSuccessText];
    }
    else {
      if (type.indexOf("range") > -1 && (getObjType(data) == "object" || getObjType(data) == "array")) {
        return [true, formulaMore.tipSuccessText];
      }

      if (type.indexOf("number") > -1 && (isRealNum(data) || getObjType(data) == "boolean")) {
        return [true, formulaMore.tipSuccessText];
      }

      if (type.indexOf("string") > -1 && getObjType(data) == "string") {
        return [true, formulaMore.tipSuccessText];
      }

      if (type.indexOf("date") > -1 && isdatetime(data)) {
        return [true, formulaMore.tipSuccessText];
      }

      return [false, formulaMore.tipParamErrorText];
    }
  },
  classlist: {
    "province": {
      11: "北京",
      12: "天津",
      13: "河北",
      14: "山西",
      15: "内蒙古",
      21: "辽宁",
      22: "吉林",
      23: "黑龙江",
      31: "上海",
      32: "江苏",
      33: "浙江",
      34: "安徽",
      35: "福建",
      36: "江西",
      37: "山东",
      41: "河南",
      42: "湖北",
      43: "湖南",
      44: "广东",
      45: "广西",
      46: "海南",
      50: "重庆",
      51: "四川",
      52: "贵州",
      53: "云南",
      54: "西藏",
      61: "陕西",
      62: "甘肃",
      63: "青海",
      64: "宁夏",
      65: "新疆",
      71: "台湾",
      81: "香港",
      82: "澳门",
      91: "国外"
    }
  },
  //获取一维数组
  getRangeArray: function (range) {
    let rangeNow = [];
    let fmt = "General";

    if (range.length == 1) { //一行
      for (let c = 0; c < range[0].length; c++) {
        if (range[0][c] != null && range[0][c].v) {
          rangeNow.push(range[0][c].v);
          let f = range[0][c].ct.fa;
          fmt = (fmt == "General") ? f : fmt;
        }
        else {
          //若单元格为null或为空，此处推入null（待考虑是否使用"null"）
          rangeNow.push(null);
        }
      }
    }
    else if (range[0].length == 1) { //一列
      for (let r = 0; r < range.length; r++) {
        if (range[r][0] != null && range[r][0].v) {
          rangeNow.push(range[r][0].v);
          let f = range[r][0].ct.fa;
          fmt = (fmt == "General") ? f : fmt;
        }
        else {
          rangeNow.push(null);
        }
      }
    }
    else {
      for (let r = 0; r < range.length; r++) {
        for (let c = 0; c < range[r].length; c++) {
          if (range[r][c] != null && range[r][c].v) {
            rangeNow.push(range[r][c].v);
            let f = range[r][c].ct.fa;
            fmt = (fmt == "General") ? f : fmt;
          }
          else {
            rangeNow.push(null);
          }
        }
      }
    }

    range = rangeNow;

    return [range, fmt];
  },
  //获取二维数组：qksheet格式[[{v,m,ct}] ==> [1]
  getRangeArrayTwo: function (range) {
    let data = [...range];

    if (data.length == 1) { //一行
      for (let c = 0; c < data[0].length; c++) {
        if (data[0][c] instanceof Object) {
          if (data[0][c] != null && data[0][c] instanceof Object && !!data[0][c].m) {
            data[0][c] = data[0][c].m;
          }
          else {
            if (data[0][c] != null && data[0][c] instanceof Object && !!data[0][c].v) {
              data[0][c] = data[0][c].v;
            }
            else {
              data[0][c] = null;
            }
          }
        }
      }
    }
    else if (data[0].length == 1) { //一列
      for (let r = 0; r < data.length; r++) {
        if (data[r][0] instanceof Object) {
          if (data[r][0] != null && data[r][0] instanceof Object && !!data[r][0].m) {
            data[r][0] = data[r][0].m;
          }
          else {
            if (data[r][0] != null && data[r][0] instanceof Object && !!data[r][0].v) {
              data[r][0] = data[r][0].v;
            }
            else {
              data[r][0] = null;
            }
          }
        }
      }
    }
    else {
      for (let r = 0; r < data.length; r++) {
        for (let c = 0; c < data[r].length; c++) {
          if (data[r][c] instanceof Object) {
            if (data[r][c] != null && data[r][c] instanceof Object && !!data[r][c].m) {
              data[r][c] = data[r][c].m;
            }
            else {
              if (data[r][c] != null && data[r][c] instanceof Object && !!data[r][c].v) {
                data[r][c] = data[r][c].v;
              }
              else {
                data[r][c] = null;
              }
            }
          }
        }
      }
    }

    return data;
  },
  acompareb: function (a, b) { //a 与 b比较，b可为含比较符，通配符
    let _this = this;
    let flag = false;

    if (isRealNum(b)) {
      flag = luckysheet_compareWith(a, "==", b);
    }
    else if (typeof (b) == "string") { //条件输入字符串，如：">233"
      if (b.indexOf("*") != -1 || b.indexOf("?") != -1) { // 正则匹配：输入通配符："黑*","白?",以及"白?黑*~*"
        //通配符函数
        return _this.isWildcard(a, b);
      }
      else if (_this.isCompareOperator(b).flag) { //"黑糖"
        let ope = _this.isCompareOperator(b).ope;
        let num = _this.isCompareOperator(b).num;
        flag = luckysheet_compareWith(a, ope, num);
      }
      else {
        flag = luckysheet_compareWith(a, "==", b);
      }
    }

    return flag;
  },
  groupValuesRefreshData: [],
  execFunctionGroup: function (sheet) {
    let _this = this,
      data = sheet.data,
      calcChains = sheet.calcChain,
      index = sheet.index,
      formulaObjects = {}

    _this.sheet = sheet
    _this.index = index

    global['sheet'] = sheet
    global['index'] = index

    //把修改涉及的单元格存储为对象
    let updateValueOjects = {}, updateValueArray = [];


    let key = "r" + undefined + "c" + undefined + "i" + index;
    updateValueOjects[key] = 1;


    let arrayMatchCache = {};
    let arrayMatch = function (formulaArray, formulaObjects, updateValueOjects, func) {
      for (let a = 0; a < formulaArray.length; a++) {
        let range = formulaArray[a];
        let cacheKey = "r" + range.row[0] + "" + range.row[1] + "c" + range.column[0] + "" + range.column[1] + "index" + range.sheetIndex;
        if (cacheKey in arrayMatchCache) {
          let amc = arrayMatchCache[cacheKey];
          amc.forEach((item) => {
            func(item.key, item.r, item.c, item.sheetIndex);
          });
        }
        else {
          let functionArr = [];
          for (let r = range.row[0]; r <= range.row[1]; r++) {
            for (let c = range.column[0]; c <= range.column[1]; c++) {
              let key = "r" + r + "c" + c + "i" + range.sheetIndex;
              func(key, r, c, range.sheetIndex);
              if ((formulaObjects && key in formulaObjects) || (updateValueOjects && key in updateValueOjects)) {
                functionArr.push({
                  key: key,
                  r: r,
                  c: c,
                  sheetIndex: range.sheetIndex
                });
              }
            }
          }

          if (formulaObjects || updateValueOjects) {
            arrayMatchCache[cacheKey] = functionArr;
          }
        }
      }
    }

    //创建公式缓存及其范围的缓存
    for (let i = 0; i < calcChains.length; i++) {
      let formulaCell = calcChains[i];
      let key = "r" + formulaCell.r + "c" + formulaCell.c + "i" + formulaCell.index;
      let calc_funcStr = data[formulaCell.r][formulaCell.c].f
      if (calc_funcStr == null) {
        continue;
      }
      let txt1 = calc_funcStr.toUpperCase();
      let isOffsetFunc = txt1.indexOf("INDIRECT(") > -1 || txt1.indexOf("OFFSET(") > -1 || txt1.indexOf("INDEX(") > -1;
      let formulaArray = [];

      if (isOffsetFunc) {
        this.isFunctionRange(calc_funcStr, null, null, formulaCell.index, null, function (str_nb) {
          let range = _this.getcellrange(str_nb, formulaCell.index, sheet);
          if (range != null) {
            formulaArray.push(range);
          }
        });
      }
      else if (!(calc_funcStr.substr(0, 2) == '="' && calc_funcStr.substr(calc_funcStr.length - 1, 1) == '"')) {
        //let formulaTextArray = calc_funcStr.split(/==|!=|<>|<=|>=|[,()=+-\/*%&^><]/g);//无法正确分割单引号或双引号之间有==、!=、-等运算符的情况。导致如='1-2'!A1公式中表名1-2的A1单元格内容更新后，公式的值不更新的bug
        //解决='1-2'!A1+5会被calc_funcStr.split(/==|!=|<>|<=|>=|[,()=+-\/*%&^><]/g)分割成["","'1","2'!A1",5]的错误情况
        let point = 0;//指针
        let squote = -1;//双引号
        let dquote = -1;//单引号
        let formulaTextArray = [];
        let sq_end_array = [];//保存了配对的单引号在formulaTextArray的index索引。
        let calc_funcStr_length = calc_funcStr.length;
        for (let i = 0; i < calc_funcStr_length; i++) {
          let char = calc_funcStr.charAt(i);
          if (char == "'" && dquote == -1) {
            //如果是单引号开始
            if (squote == -1) {
              if (point != i) {
                formulaTextArray.push(...calc_funcStr.substring(point, i).split(/==|!=|<>|<=|>=|[,()=+-\/*%&\^><]/));
              }
              squote = i;
              point = i;
            }
            else//单引号结束
            {
              //如果是''代表着输出'
              if (i < calc_funcStr_length - 1 && calc_funcStr.charAt(i + 1) == "'") {
                i++;
              }
              else {//如果下一个字符不是'代表单引号结束
                //    ;//到此处说明公式错误
                point = i + 1;
                formulaTextArray.push(calc_funcStr.substring(squote, point));
                sq_end_array.push(formulaTextArray.length - 1);
                squote = -1;
              }

            }
          }
          if (char == '"' && squote == -1) {
            //如果是双引号开始
            if (dquote == -1) {
              if (point != i) {
                formulaTextArray.push(...calc_funcStr.substring(point, i).split(/==|!=|<>|<=|>=|[,()=+-\/*%&\^><]/));
              }
              dquote = i;
              point = i;
            }
            else {
              //如果是""代表着输出"
              if (i < calc_funcStr_length - 1 && calc_funcStr.charAt(i + 1) == '"') {
                i++;
              }
              else {//双引号结束
                point = i + 1;
                formulaTextArray.push(calc_funcStr.substring(dquote, point));
                dquote = -1;
              }
            }
          }
        }
        if (point != calc_funcStr_length) {
          formulaTextArray.push(...calc_funcStr.substring(point, calc_funcStr_length).split(/==|!=|<>|<=|>=|[,()=+-\/*%&\^><]/))
        }
        //拼接所有配对单引号及之后一个单元格内容，例如["'1-2'","!A1"]拼接为["'1-2'!A1"]
        for (let i = sq_end_array.length - 1; i >= 0; i--) {
          if (sq_end_array[i] != formulaTextArray.length - 1) {
            formulaTextArray[sq_end_array[i]] = formulaTextArray[sq_end_array[i]] + formulaTextArray[sq_end_array[i] + 1];
            formulaTextArray.splice(sq_end_array[i] + 1, 1);
          }
        }
        //至此=SUM('1-2'!A1:A2&"'1-2'!A2")由原来的["","SUM","'1","2'!A1:A2","",""'1","2'!A2""]更正为["","SUM","","'1-2'!A1:A2","","",""'1-2'!A2""]

        for (let i = 0; i < formulaTextArray.length; i++) {
          let t = formulaTextArray[i];
          if (t.length <= 1) {
            continue;
          }

          if (t.substr(0, 1) == '"' && t.substr(t.length - 1, 1) == '"' && !_this.iscelldata(t)) {
            continue;
          }

          let range = _this.getcellrange(t, formulaCell.index, sheet);

          if (range == null) {
            continue;
          }

          formulaArray.push(range);
        }
      }

      let item = {
        formulaArray: formulaArray,
        calc_funcStr: calc_funcStr,
        key: key,
        r: formulaCell.r,
        c: formulaCell.c,
        index: formulaCell.index,
        parents: {},
        chidren: {},
        color: "w"
      }

      formulaObjects[key] = item;
    }

    //形成一个公式之间引用的图结构
    Object.keys(formulaObjects).forEach((key) => {
      let formulaObject = formulaObjects[key];
      arrayMatch(formulaObject.formulaArray, formulaObjects, updateValueOjects, function (childKey) {
        if (childKey in formulaObjects) {
          let childFormulaObject = formulaObjects[childKey];
          formulaObject.chidren[childKey] = 1;
          childFormulaObject.parents[key] = 1;
        }
      });
      updateValueArray.push(formulaObject);
    });



    let formulaRunList = [];
    //计算，采用深度优先遍历公式形成的图结构

    let stack = updateValueArray, existsFormulaRunList = {};
    while (stack.length > 0) {
      let formulaObject = stack.pop();

      if (formulaObject == null || formulaObject.key in existsFormulaRunList) {
        continue;
      }

      if (formulaObject.color == "b") {
        formulaRunList.push(formulaObject);
        existsFormulaRunList[formulaObject.key] = 1;
        continue;
      }

      let cacheStack = [];
      Object.keys(formulaObject.parents).forEach((parentKey) => {
        let parentFormulaObject = formulaObjects[parentKey];
        if (parentFormulaObject != null) {
          cacheStack.push(parentFormulaObject);
        }
      });

      if (cacheStack.length == 0) {
        formulaRunList.push(formulaObject);
        existsFormulaRunList[formulaObject.key] = 1;
      }
      else {
        formulaObject.color = "b";
        stack.push(formulaObject);
        stack = stack.concat(cacheStack);
      }
    }

    formulaRunList.reverse();

    for (let i = 0; i < formulaRunList.length; i++) {
      let formulaCell = formulaRunList[i];
      if (formulaCell.level == Math.max) {
        continue;
      }

      let calc_funcStr = formulaCell.calc_funcStr;

      let v = _this.execfunction(calc_funcStr, formulaCell.r, formulaCell.c, formulaCell.index);
      
      _this.groupValuesRefreshData.push({
        "r": formulaCell.r,
        "c": formulaCell.c,
        "v": v[1],
        "f": v[2],
        "spe": v[3],
        "index": formulaCell.index
      });

      _this.execFunctionGlobalData[formulaCell.r + "_" + formulaCell.c + "_" + formulaCell.index] = {
        v: v[1],
        f: v[2]
      };
      sheet.data[formulaCell.r][formulaCell.c]['v'] = v[1]
    }
    
    _this.execFunctionExist = null;
    return sheet
  },
  isWildcard: function (a, b) { //正则匹配通配符: * ? ~* ~?,a目标参数，b通配符
    let _this = this;

    a = a.toString();
    b = b.toString();

    if (_this.isCompareOperator(b).flag) {
      b = _this.isCompareOperator(b).num;
    }

    let str = "";
    for (let i = 0; i < b.length; i++) {
      let v = b.charAt(i);

      if (v == "*") {
        str += ".*";
      }
      else if (v == "?") {
        str += ".";
      }
      else if (v == "~") {
        if (b.charAt(i + 1) == "*") {
          str += "\\*";
          i++;
        }
        else if (b.charAt(i + 1) == "?") {
          str += "\\?";
          i++;
        }
        else {
          str += "~";
        }
      }
      else {
        str += v;
      }
    }

    let reg = new RegExp("^" + str + "$", "g");

    return !!a.match(reg);
  },
  getcellrange: function (txt, index?, sheet?) {
    if (txt == null || txt.length == 0) {
      return;
    } else {
      if (typeof txt === 'string') txt = txt.trim()
    }
    if (!index) index = global['index']
    if (!sheet) sheet = global['sheet']
    let sheettxt = "",
      rangetxt = "",
      sheetIndex = index,
      sheetdata = sheet.data;


    if (txt.indexOf("!") > -1) {
      if (txt in this.cellTextToIndexList) {
        return this.cellTextToIndexList[txt];
      }

      let val = txt.split("!");
      sheettxt = val[0];
      rangetxt = val[1];

      sheettxt = sheettxt.replace(/\\'/g, "'").replace(/''/g, "'");
      if (sheettxt.substr(0, 1) == "'" && sheettxt.substr(sheettxt.length - 1, 1) == "'") {
        sheettxt = sheettxt.substring(1, sheettxt.length - 1);
      }

    }
    else {
      let i = sheetIndex
      if (txt + "_" + i in this.cellTextToIndexList) {
        return this.cellTextToIndexList[txt + "_" + i];
      }
      sheettxt = sheet.name;
      sheetIndex = sheet.index;
      sheetdata = sheet.data;
      rangetxt = txt;
    }

    if (rangetxt.indexOf(":") == -1) {
      let row = parseInt(rangetxt.replace(/[^0-9]/g, "")) - 1;
      let col = ABCatNum(rangetxt.replace(/[^A-Za-z]/g, ""));

      if (!isNaN(row) && !isNaN(col)) {
        let item = {
          "row": [row, row],
          "column": [col, col],
          "sheetIndex": sheetIndex
        };
        this.addToCellIndexList(txt, item);
        return item;
      }
      else {
        return null;
      }
    }
    else {
      let rangetxtArray = rangetxt.split(":");
      let row = [], col = [];
      row[0] = parseInt(rangetxtArray[0].replace(/[^0-9]/g, "")) - 1;
      row[1] = parseInt(rangetxtArray[1].replace(/[^0-9]/g, "")) - 1;
      if (isNaN(row[0])) {
        row[0] = 0;
      }
      if (isNaN(row[1])) {
        row[1] = sheetdata.length - 1;
      }
      if (row[0] > row[1]) {
        return null;
      }
      col[0] = ABCatNum(rangetxtArray[0].replace(/[^A-Za-z]/g, ""));
      col[1] = ABCatNum(rangetxtArray[1].replace(/[^A-Za-z]/g, ""));
      if (isNaN(col[0])) {
        col[0] = 0;
      }
      if (isNaN(col[1])) {
        col[1] = sheetdata[0].length - 1;
      }
      if (col[0] > col[1]) {
        return null;
      }

      let item = {
        "row": row,
        "column": col,
        "sheetIndex": sheetIndex
      };
      this.addToCellIndexList(txt, item);
      return item;
    }
  },
  execfunction: function (txt, r, c, index, isrefresh, notInsertFunc) {
    let _this = this;
    if (txt.indexOf(_this.error.r) > -1) {
      return [false, _this.error.r, txt];
    }

    if (!_this.checkBracketNum(txt)) {
      txt += ")";
    }

    let fp: any = _this.functionParserExe(txt)
    if ((fp.substr(0, 20) == "luckysheet_function." || fp.substr(0, 22) == "luckysheet_compareWith")) {
      _this.functionHTMLIndex = 0;
    }

    if (!_this.testFunction(txt, fp) || fp == "") {
      return [false, _this.error.n, txt];
    }



    let result: any = null;

    try {
      if (fp.indexOf("luckysheet_getcelldata") > -1) {
        let funcg = fp.split("luckysheet_getcelldata('");

        for (let i = 1; i < funcg.length; i++) {
          let funcgStr = funcg[i].split("')")[0];
          let funcgRange = _this.getcellrange(funcgStr);

          if (funcgRange.row[0] < 0 || funcgRange.column[0] < 0) {
            return [true, _this.error.r, txt];
          }

          if (funcgRange.sheetIndex == index && r >= funcgRange.row[0] && r <= funcgRange.row[1] && c >= funcgRange.column[0] && c <= funcgRange.column[1]) {
            return [false, 0, txt];
          }
        }
      }
      result = new Function('return ' + fp)()
      if (r === 3 && c === 65) {
        console.log(result, 111111111111111, fp)
        console.log(luckysheet_getcelldata('AA4'), 222)
      }
      if (typeof (result) == "string") {//把之前的非打印控制字符DEL替换回一个双引号。
        result = result.replace(/\x7F/g, '"');
      }
    }
    catch (e) {
      let err = e;
      //err错误提示处理
      console.log(e, fp);
      err = _this.errorInfo(err);
      result = [_this.error.n, err];
    }

    //公式结果是对象，则表示只是选区。如果是单个单元格，则返回其值；如果是多个单元格，则返回 #VALUE!。
    if (getObjType(result) == "object" && result.startCell != null) {
      if (getObjType(result.data) == "array") {
        result = _this.error.v;
      }
      else {
        if (getObjType(result.data) == "object" && !isRealNull(result.data.v)) {
          result = result.data.v;
        }
        else if (!isRealNull(result.data)) {
          //只有data长或宽大于1才可能是选区
          if (result.cell > 1 || result.rowl > 1) {
            result = result.data;
          }
          else//否则就是单个不为null的没有值v的单元格
          {
            result = 0;
          }
        }
        else {
          result = 0;
        }
      }
    }

    //公式结果是数组，分错误值 和 动态数组 两种情况
    let dynamicArrayItem = null;

    if (getObjType(result) == "array") {
      let isErr = false;

      if (getObjType(result[0]) != "array" && result.length == 2) {
        isErr = valueIsError(result[0]);
      }

      if (!isErr) {
        if (getObjType(result[0]) == "array" && result.length == 1 && result[0].length == 1) {
          result = result[0][0];
        }
        else {
          dynamicArrayItem = { "r": r, "c": c, "f": txt, "index": index, "data": result };
          result = "";
        }
      }
      else {
        result = result[0];
      }
    }
    if (r != null && c != null) {
      if (isrefresh) {
        _this.execFunctionGroup(r, c, result, index);
      }

      if (!notInsertFunc) {
        _this.insertUpdateFunctionGroup(r, c, index);
      }
    }

    if (!!dynamicArrayItem) {
      return [true, result, txt, { type: "dynamicArrayItem", data: dynamicArrayItem }];
    }
    return [true, result, txt];
  },
  testFunction: function (txt, fp) {
    if (txt.substr(0, 1) == "=") {
      return true;
    }
    else {
      return false;
    }
  },
  insertUpdateFunctionGroup: function (r, c, index) {
    let file = this.sheet

    let calcChain = file.calcChain;
    if (calcChain == null) {
      calcChain = [];
    }

    let cc = {
      "r": r,
      "c": c,
      "index": index
    };
    calcChain.push(cc);
    file.calcChain = calcChain;
  },
  checkBracketNum: function (fp) {
    let bra_l = fp.match(/\(/g),
      bra_r = fp.match(/\)/g),
      bra_tl_txt = fp.match(/(['"])(?:(?!\1).)*?\1/g),
      bra_tr_txt = fp.match(/(['"])(?:(?!\1).)*?\1/g);

    let bra_l_len = 0, bra_r_len = 0;
    if (bra_l != null) {
      bra_l_len += bra_l.length;
    }
    if (bra_r != null) {
      bra_r_len += bra_r.length;
    }

    let bra_tl_len = 0, bra_tr_len = 0;
    if (bra_tl_txt != null) {
      for (let i = 0; i < bra_tl_txt.length; i++) {
        let bra_tl = bra_tl_txt[i].match(/\(/g);
        if (bra_tl != null) {
          bra_tl_len += bra_tl.length;
        }
      }
    }

    if (bra_tr_txt != null) {
      for (let i = 0; i < bra_tr_txt.length; i++) {
        let bra_tr = bra_tr_txt[i].match(/\)/g);
        if (bra_tr != null) {
          bra_tr_len += bra_tr.length;
        }
      }
    }

    bra_l_len -= bra_tl_len;
    bra_r_len -= bra_tr_len;

    if (bra_l_len != bra_r_len) {
      return false;
    }
    else {
      return true;
    }
  },
  functionParserExe: function (txt) {
    return this.functionParser(txt);
  },
  operatorPriority: {
    "^": 0,
    "%": 1,
    "*": 1,
    "/": 1,
    "+": 2,
    "-": 2
  },
  functionParser: function (txt, cellRangeFunction) {
    let _this = this;
    if (_this.operatorjson == null) {
      let arr = _this.operator.split("|"),
        op = {};

      for (let i = 0; i < arr.length; i++) {
        op[arr[i].toString()] = 1;
      }

      _this.operatorjson = op;
    }

    if (txt == null) {
      return "";
    }

    if (txt.substr(0, 2) == "=+") {
      txt = txt.substr(2);
    }
    else if (txt.substr(0, 1) == "=") {
      txt = txt.substr(1);
    }

    let funcstack = txt.split("");
    let i = 0,
      str = "",
      function_str = "";

    let matchConfig = {
      "bracket": 0,
      "comma": 0,
      "squote": 0,
      "dquote": 0,
      "compare": 0,
      "braces": 0
    }
    //bracket 0为运算符括号、1为函数括号
    let cal1 = [], cal2 = [], bracket = [];
    let firstSQ = -1;
    while (i < funcstack.length) {
      let s = funcstack[i];

      if (s == "(" && matchConfig.squote == 0 && matchConfig.dquote == 0 && matchConfig.braces == 0) {
        if (str.length > 0 && bracket.length == 0) {
          str = str.toUpperCase();
          if (str.indexOf(":") > -1) {
            let funcArray = str.split(":");
            function_str += "luckysheet_getSpecialReference(true,'" + funcArray[0].trim().replace(/'/g, "\\'") + "', luckysheet_function." + funcArray[1] + ".f(#lucky#";
          }
          else {
            function_str += "luckysheet_function." + str + ".f(";
          }
          bracket.push(1);
          str = "";
        }
        else if (bracket.length == 0) {
          function_str += "(";
          bracket.push(0);
          str = "";
        }
        else {
          bracket.push(0);
          str += s;
        }
      }
      else if (s == ")" && matchConfig.squote == 0 && matchConfig.dquote == 0 && matchConfig.braces == 0) {
        let bt = bracket.pop();

        if (bracket.length == 0) {
          let functionS = _this.functionParser(str, cellRangeFunction);
          if (functionS.indexOf("#lucky#") > -1) {
            functionS = functionS.replace(/#lucky#/g, "") + ")";
          }
          function_str += functionS + ")";
          str = "";
        }
        else {
          str += s;
        }
      }
      else if (s == "{" && matchConfig.squote == 0 && matchConfig.dquote == 0) {
        str += '{';
        matchConfig.braces += 1;
      }
      else if (s == "}" && matchConfig.squote == 0 && matchConfig.dquote == 0) {
        str += '}';
        matchConfig.braces -= 1;
      }
      else if (s == '"' && matchConfig.squote == 0) {

        if (matchConfig.dquote > 0) {
          //如果是""代表着输出"
          if (i < funcstack.length - 1 && funcstack[i + 1] == '"') {
            i++;
            str += "\x7F";//用非打印控制字符DEL替换一下""
          }
          else {
            matchConfig.dquote -= 1;
            str += '"';
          }
        }
        else {
          matchConfig.dquote += 1;
          str += '"';
        }
      }
      else if (s == "'" && matchConfig.dquote == 0) {
        str += "'";

        if (matchConfig.squote > 0) {
          if (firstSQ == i - 1)//配对的单引号后第一个字符不能是单引号
          {
            return "";
          }
          //如果是''代表着输出'
          if (i < funcstack.length - 1 && funcstack[i + 1] == "'") {
            i++;
            str += "'";
          }
          else {//如果下一个字符不是'代表单引号结束
            if (funcstack[i - 1] == "'") {//配对的单引号后最后一个字符不能是单引号
              return "";
            } else {
              matchConfig.squote -= 1;
            }
          }
        }
        else {
          matchConfig.squote += 1;
          firstSQ = i;
        }
      }
      else if (s == ',' && matchConfig.squote == 0 && matchConfig.dquote == 0 && matchConfig.braces == 0) {
        if (bracket.length <= 1) {
          let functionS = _this.functionParser(str, cellRangeFunction);
          if (functionS.indexOf("#lucky#") > -1) {
            functionS = functionS.replace(/#lucky#/g, "") + ")";
          }
          function_str += functionS + ",";
          str = "";
        }
        else {
          str += ",";
        }
      }
      else if (s in _this.operatorjson && matchConfig.squote == 0 && matchConfig.dquote == 0 && matchConfig.braces == 0) {
        let s_next = "";
        let op = _this.operatorPriority;

        if ((i + 1) < funcstack.length) {
          s_next = funcstack[i + 1];
        }
        str = str.trim()
        function_str = function_str.trim()

        if ((s + s_next) in _this.operatorjson) {
          if (bracket.length == 0) {

            if (str.length > 0) {
              cal2.unshift(_this.functionParser(str, cellRangeFunction));
            }
            else if (function_str.length > 0) {
              cal2.unshift(function_str);
            }

            if (cal1[0] in _this.operatorjson) {
              let stackCeilPri = op[cal1[0]];

              while (cal1.length > 0 && stackCeilPri != null) {
                cal2.unshift(cal1.shift());
                stackCeilPri = op[cal1[0]];
              }
            }

            cal1.unshift(s + s_next);

            function_str = "";
            str = "";
          }
          else {
            str += s + s_next;
          }

          i++;
        }
        else {
          if (bracket.length == 0) {
            if (str.length > 0) {
              cal2.unshift(_this.functionParser(str.trim(), cellRangeFunction));
            }
            else if (function_str.length > 0) {
              cal2.unshift(function_str);
            }

            if (cal1[0] in _this.operatorjson) {
              let stackCeilPri = op[cal1[0]];
              stackCeilPri = stackCeilPri == null ? 1000 : stackCeilPri;

              let sPri = op[s];
              sPri = sPri == null ? 1000 : sPri;

              while (cal1.length > 0 && sPri >= stackCeilPri) {
                cal2.unshift(cal1.shift());

                stackCeilPri = op[cal1[0]];
                stackCeilPri = stackCeilPri == null ? 1000 : stackCeilPri;
              }
            }

            cal1.unshift(s);

            function_str = "";
            str = "";
          }
          else {
            str += s;
          }
        }
      }
      else {
        if (matchConfig.dquote == 0 && matchConfig.squote == 0) {
          // str += $.trim(s);
          str += s; //Do not use $.trim(s). When obtaining the worksheet name that contains spaces, you should keep the spaces
        }
        else {
          str += s;
        }
      }

      if (i == funcstack.length - 1) {
        let endstr = "";
        let str_nb = str.trim().replace(/'/g, "\\'");
        if (_this.iscelldata(str_nb) && str_nb.substr(0, 1) != ":") {

          endstr = "luckysheet_getcelldata('" + str_nb + "')";
          if (typeof (cellRangeFunction) == "function") {
            cellRangeFunction(str_nb);
          }

        }
        else if (str_nb.substr(0, 1) == ":") {
          str_nb = str_nb.substr(1);
          if (_this.iscelldata(str_nb)) {
            endstr = "luckysheet_getSpecialReference(false," + function_str + ",'" + str_nb + "')";
          }
        }
        else {
          str = str.trim();

          let regx = /{.*?}/;
          if (regx.test(str) && str.substr(0, 1) != '"' && str.substr(str.length - 1, 1) != '"') {
            let arraytxt = regx.exec(str)[0];
            let arraystart = str.search(regx);
            let alltxt = "";

            if (arraystart > 0) {
              endstr += str.substr(0, arraystart);
            }

            endstr += "luckysheet_getarraydata('" + arraytxt + "')";

            if (arraystart + arraytxt.length < str.length) {
              endstr += str.substr(arraystart + arraytxt.length, str.length);
            }
          }
          else {
            endstr = str;
          }
        }

        if (endstr.length > 0) {
          cal2.unshift(endstr);
        }

        if (cal1.length > 0) {
          if (function_str.length > 0) {
            cal2.unshift(function_str);
            function_str = "";
          }

          while (cal1.length > 0) {
            cal2.unshift(cal1.shift());
          }
        }

        if (cal2.length > 0) {
          function_str = _this.calPostfixExpression(cal2);
        }
        else {
          function_str += endstr;
        }
      }

      i++;
    }
    return function_str;
  },
  iscelldata: function (txt) { //判断是否为单元格格式
    let val = txt.split("!"),
      rangetxt;

    if (val.length > 1) {
      rangetxt = val[1];
    }
    else {
      rangetxt = val[0];
    }

    let reg_cell = /^(([a-zA-Z]+)|([$][a-zA-Z]+))(([0-9]+)|([$][0-9]+))$/g; //增加正则判断单元格为字母+数字的格式：如 A1:B3
    let reg_cellRange = /^(((([a-zA-Z]+)|([$][a-zA-Z]+))(([0-9]+)|([$][0-9]+)))|((([a-zA-Z]+)|([$][a-zA-Z]+))))$/g; //增加正则判断单元格为字母+数字或字母的格式：如 A1:B3，A:A

    if (rangetxt.indexOf(":") == -1) {
      let row = parseInt(rangetxt.replace(/[^0-9]/g, "")) - 1;
      let col = ABCatNum(rangetxt.replace(/[^A-Za-z]/g, ""));

      if (!isNaN(row) && !isNaN(col) && rangetxt.toString().match(reg_cell)) {
        return true;
      }
      else if (!isNaN(row)) {
        return false;
      }
      else if (!isNaN(col)) {
        return false;
      }
      else {
        return false;
      }
    }
    else {
      reg_cellRange = /^(((([a-zA-Z]+)|([$][a-zA-Z]+))(([0-9]+)|([$][0-9]+)))|((([a-zA-Z]+)|([$][a-zA-Z]+)))|((([0-9]+)|([$][0-9]+s))))$/g;

      rangetxt = rangetxt.split(":");

      let row = [], col = [];
      row[0] = parseInt(rangetxt[0].replace(/[^0-9]/g, "")) - 1;
      row[1] = parseInt(rangetxt[1].replace(/[^0-9]/g, "")) - 1;
      if (row[0] > row[1]) {
        return false;
      }

      col[0] = ABCatNum(rangetxt[0].replace(/[^A-Za-z]/g, ""));
      col[1] = ABCatNum(rangetxt[1].replace(/[^A-Za-z]/g, ""));
      if (col[0] > col[1]) {
        return false;
      }

      if (rangetxt[0].toString().match(reg_cellRange) && rangetxt[1].toString().match(reg_cellRange)) {
        return true;
      }
      else {
        return false;
      }
    }
  },
  calPostfixExpression: function (cal) {
    if (cal.length == 0) {
      return "";
    }

    let stack = [];
    for (let i = cal.length - 1; i >= 0; i--) {
      let c = cal[i];
      if (c in this.operatorjson) {
        let s2 = stack.pop();
        let s1 = stack.pop();

        let str = "luckysheet_compareWith(" + s1 + ",'" + c + "', " + s2 + ")";

        stack.push(str);
      }
      else {
        stack.push(c);
      }
    }

    if (stack.length > 0) {
      return stack[0];
    }
    else {
      return "";
    }
  },
  addToCellIndexList: function (txt, infoObj) {
    if (txt == null || txt.length == 0 || infoObj == null) {
      return;
    }
    if (this.cellTextToIndexList == null) {
      this.cellTextToIndexList = {};
    }

    if (txt.indexOf("!") > -1) {
      txt = txt.replace(/\\'/g, "'").replace(/''/g, "'");
      this.cellTextToIndexList[txt] = infoObj;
    }
    else {
      this.cellTextToIndexList[txt + "_" + infoObj.sheetIndex] = infoObj;
    }

  },
  isFunctionRange: function (txt, r, c, index, dynamicArray_compute, cellRangeFunction) {
    let _this = this;

    if (_this.operatorjson == null) {
      let arr = _this.operator.split("|"),
        op = {};

      for (let i = 0; i < arr.length; i++) {
        op[arr[i].toString()] = 1;
      }

      _this.operatorjson = op;
    }

    if (txt.substr(0, 1) == "=") {
      txt = txt.substr(1);
    }

    let funcstack = txt.split("");
    let i = 0,
      str = "",
      function_str = "",
      ispassby = true;

    let matchConfig = {
      "bracket": 0,
      "comma": 0,
      "squote": 0,
      "dquote": 0,
      "compare": 0,
      "braces": 0
    }

    // let luckysheetfile = getluckysheetfile();
    // let dynamicArray_compute = luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["dynamicArray_compute"] == null ? {} : luckysheetfile[getSheetIndex(Store.currentSheetIndex)]["dynamicArray_compute"];

    //bracket 0为运算符括号、1为函数括号
    let cal1 = [], cal2 = [], bracket = [];
    let firstSQ = -1;
    while (i < funcstack.length) {
      let s = funcstack[i];

      if (s == "(" && matchConfig.squote == 0 && matchConfig.dquote == 0 && matchConfig.braces == 0) {
        if (str.length > 0 && bracket.length == 0) {
          str = str.toUpperCase();
          if (str.indexOf(":") > -1) {
            let funcArray = str.split(":");
            function_str += "luckysheet_getSpecialReference(true,'" + funcArray[0].trim().replace(/'/g, "\\'") + "', luckysheet_function." + funcArray[1] + ".f(#lucky#";
          }
          else {
            function_str += "luckysheet_function." + str + ".f(";
          }
          bracket.push(1);
          str = "";
        }
        else if (bracket.length == 0) {
          function_str += "(";
          bracket.push(0);
          str = "";
        }
        else {
          bracket.push(0);
          str += s;
        }
      }
      else if (s == ")" && matchConfig.squote == 0 && matchConfig.dquote == 0 && matchConfig.braces == 0) {
        let bt = bracket.pop();

        if (bracket.length == 0) {
          // function_str += _this.isFunctionRange(str,r,c, index,dynamicArray_compute,cellRangeFunction) + ")";
          // str = "";

          let functionS = _this.isFunctionRange(str, r, c, index, dynamicArray_compute, cellRangeFunction);
          if (functionS.indexOf("#lucky#") > -1) {
            functionS = functionS.replace(/#lucky#/g, "") + ")";
          }
          function_str += functionS + ")";
          str = "";
        }
        else {
          str += s;
        }
      }
      else if (s == "{" && matchConfig.squote == 0 && matchConfig.dquote == 0) {
        str += '{';
        matchConfig.braces += 1;
      }
      else if (s == "}" && matchConfig.squote == 0 && matchConfig.dquote == 0) {
        str += '}';
        matchConfig.braces -= 1;
      }
      else if (s == '"' && matchConfig.squote == 0) {

        if (matchConfig.dquote > 0) {
          //如果是""代表着输出"
          if (i < funcstack.length - 1 && funcstack[i + 1] == '"') {
            i++;
            str += "\x7F";//用DEL替换一下""
          }
          else {
            matchConfig.dquote -= 1;
            str += '"';
          }
        }
        else {
          matchConfig.dquote += 1;
          str += '"';
        }
      }
      else if (s == "'" && matchConfig.dquote == 0) {
        str += "'";

        if (matchConfig.squote > 0) {
          //if (firstSQ == i - 1)//配对的单引号后第一个字符不能是单引号
          //{
          //    代码到了此处应该是公式错误
          //}
          //如果是''代表着输出'
          if (i < funcstack.length - 1 && funcstack[i + 1] == "'") {
            i++;
            str += "'";
          }
          else {//如果下一个字符不是'代表单引号结束
            //if (funcstack[i - 1] == "'") {//配对的单引号后最后一个字符不能是单引号
            //    代码到了此处应该是公式错误
            //} else {
            matchConfig.squote -= 1;
            //}
          }
        }
        else {
          matchConfig.squote += 1;
          firstSQ = i;
        }
      }
      else if (s == ',' && matchConfig.squote == 0 && matchConfig.dquote == 0 && matchConfig.braces == 0) {
        if (bracket.length <= 1) {
          // function_str += _this.isFunctionRange(str, r, c, index,dynamicArray_compute,cellRangeFunction) + ",";
          // str = "";

          let functionS = _this.isFunctionRange(str, r, c, index, dynamicArray_compute, cellRangeFunction);
          if (functionS.indexOf("#lucky#") > -1) {
            functionS = functionS.replace(/#lucky#/g, "") + ")";
          }
          function_str += functionS + ",";
          str = "";
        }
        else {
          str += ",";
        }
      }
      else if (s in _this.operatorjson && matchConfig.squote == 0 && matchConfig.dquote == 0 && matchConfig.braces == 0) {
        let s_next = "";
        let op = _this.operatorPriority;

        if ((i + 1) < funcstack.length) {
          s_next = funcstack[i + 1];
        }
        str = str.trim()
        function_str = function_str.trim()

        if ((s + s_next) in _this.operatorjson) {
          if (bracket.length == 0) {
            if (str.length > 0) {
              cal2.unshift(_this.isFunctionRange(str, r, c, index, dynamicArray_compute, cellRangeFunction));
            }
            else if (function_str.length > 0) {
              cal2.unshift(function_str);
            }

            if (cal1[0] in _this.operatorjson) {
              let stackCeilPri = op[cal1[0]];

              while (cal1.length > 0 && stackCeilPri != null) {
                cal2.unshift(cal1.shift());
                stackCeilPri = op[cal1[0]];
              }
            }

            cal1.unshift(s + s_next);

            function_str = "";
            str = "";
          }
          else {
            str += s + s_next;
          }

          i++;
        }
        else {
          if (bracket.length == 0) {
            if (str.length > 0) {
              cal2.unshift(_this.isFunctionRange(str, r, c, index, dynamicArray_compute, cellRangeFunction));
            }
            else if (function_str.length > 0) {
              cal2.unshift(function_str);
            }

            if (cal1[0] in _this.operatorjson) {
              let stackCeilPri = op[cal1[0]];
              stackCeilPri = stackCeilPri == null ? 1000 : stackCeilPri;

              let sPri = op[s];
              sPri = sPri == null ? 1000 : sPri;

              while (cal1.length > 0 && sPri >= stackCeilPri) {
                cal2.unshift(cal1.shift());

                stackCeilPri = op[cal1[0]];
                stackCeilPri = stackCeilPri == null ? 1000 : stackCeilPri;
              }
            }

            cal1.unshift(s);

            function_str = "";
            str = "";
          }
          else {
            str += s;
          }
        }
      }
      else {
        if (matchConfig.dquote == 0 && matchConfig.squote == 0) {

          str += s.trim();
        }
        else {
          str += s;
        }
      }

      if (i == funcstack.length - 1) {
        let endstr = "";
        let str_nb = str.trim().replace(/'/g, "\\'");
        if (_this.iscelldata(str_nb) && str_nb.substr(0, 1) != ":") {
          // endstr = "luckysheet_getcelldata('" + $.trim(str) + "')";
          endstr = "luckysheet_getcelldata('" + str_nb + "')";
          _this.isFunctionRangeSaveChange(str, r, c, index, dynamicArray_compute);
        }
        else if (str_nb.substr(0, 1) == ":") {
          str_nb = str_nb.substr(1);
          if (_this.iscelldata(str_nb)) {
            endstr = "luckysheet_getSpecialReference(false," + function_str + ",'" + str_nb + "')";
          }
        }
        else {
          str = str.trim();

          let regx = /{.*?}/;
          if (regx.test(str) && str.substr(0, 1) != '"' && str.substr(str.length - 1, 1) != '"') {
            let arraytxt = regx.exec(str)[0];
            let arraystart = str.search(regx);
            let alltxt = "";

            if (arraystart > 0) {
              endstr += str.substr(0, arraystart);
            }

            endstr += "luckysheet_getarraydata('" + arraytxt + "')";

            if (arraystart + arraytxt.length < str.length) {
              endstr += str.substr(arraystart + arraytxt.length, str.length);
            }
          }
          else {
            endstr = str;
          }
        }

        if (endstr.length > 0) {
          cal2.unshift(endstr);
        }

        if (cal1.length > 0) {
          if (function_str.length > 0) {
            cal2.unshift(function_str);
            function_str = "";
          }

          while (cal1.length > 0) {
            cal2.unshift(cal1.shift());
          }
        }

        if (cal2.length > 0) {
          function_str = _this.calPostfixExpression(cal2);
        }
        else {
          function_str += endstr;
        }
      }

      i++;
    }
    _this.checkSpecialFunctionRange(function_str, r, c, index, dynamicArray_compute, cellRangeFunction);
    return function_str;
  },
  checkSpecialFunctionRange: function (function_str, r, c, index, dynamicArray_compute, cellRangeFunction) {
    if (function_str.substr(0, 30) == "luckysheet_getSpecialReference" || function_str.substr(0, 20) == "luckysheet_function.") {
      if (function_str.substr(0, 20) == "luckysheet_function.") {
        let funcName = function_str.split(".")[1];
        if (funcName != null) {
          funcName = funcName.toUpperCase();
          if (funcName != "INDIRECT" && funcName != "OFFSET" && funcName != "INDEX") {
            return;
          }
        }
      }
      try {
        let str = new Function("return " + function_str)();

        if (str instanceof Object && str.startCell != null) {
          str = str.startCell;
        }
        let str_nb = str.trim();
        if (this.iscelldata(str_nb)) {
          if (typeof (cellRangeFunction) == "function") {
            cellRangeFunction(str_nb);
          }
        }
      }
      catch {

      }
    }
  },
  isFunctionRangeSaveChange: function (str, r, c, index, dynamicArray_compute) {
    let _this = this;
    if (r != null && c != null) {
      let range = _this.getcellrange(str.trim(), index);
      if (range == null) {
        return;
      }
      let row = range.row,
        col = range.column,
        sheetIndex = range.sheetIndex;

      if ((r + "_" + c) in dynamicArray_compute && (index == sheetIndex || index == null)) {
        let isd_range = false;

        for (let d_r = row[0]; d_r <= row[1]; d_r++) {
          for (let d_c = col[0]; d_c <= col[1]; d_c++) {
            if ((d_r + "_" + d_c) in dynamicArray_compute && dynamicArray_compute[d_r + "_" + d_c].r == r && dynamicArray_compute[d_r + "_" + d_c].c == c) {
              isd_range = true;
            }
          }
        }

        if (isd_range) {
          _this.isFunctionRangeSave = _this.isFunctionRangeSave || true;
        }
        else {
          _this.isFunctionRangeSave = _this.isFunctionRangeSave || false;
        }
      }
      else {
        if (r >= row[0] && r <= row[1] && c >= col[0] && c <= col[1] && (index == sheetIndex || index == null)) {
          _this.isFunctionRangeSave = _this.isFunctionRangeSave || true;
        }
        else {
          _this.isFunctionRangeSave = _this.isFunctionRangeSave || false;
        }
      }

    }
    else {
      _this.isFunctionRangeSave = _this.isFunctionRangeSave || false;
    }
  },
  isCompareOperator: function (str) { //判断前一个或者两个字符是否是比较运算符
    str = str.toString();
    let ope = ""; //存放比较运算符
    let num = ""; //截取比较运算符之后的数字用于实际比较
    let strOne = str.substr(0, 1);
    let strTwo = str.substr(1, 1);
    let flag = false;
    let ret;

    if (strOne == ">") {
      if (strTwo == "=") {
        ope = str.substr(0, 2);
        num = str.substr(2);
        flag = true;
      }
      else if (strTwo != "=") {
        ope = str.substr(0, 1);
        num = str.substr(1);
        flag = true;
      }
    }
    else if (strOne == "<") {
      if (strTwo == "=" || strTwo == ">") {
        ope = str.substr(0, 2);
        num = str.substr(2);
        flag = true;
      }
      else if (strTwo != "=" && strTwo != ">") {
        ope = str.substr(0, 1);
        num = str.substr(1);
        flag = true;
      }
    }
    else if (strOne == "=" && strTwo != "=") {
      ope = str.substr(0, 1);
      num = str.substr(1);
      flag = true;
    }

    ret = { "flag": flag, "ope": ope, "num": num };

    return ret;
  },
  //供function/functionImplementation.js的EVALUATE函数调用。
  execstringformula: function (txt, r, c, index) {
    let _this = this;
    return this.execfunction(txt, r, c, index);
  },
  //获得函数里某个参数的值，使用此函数需要在函数中执行luckysheet_getValue方法
  getValueByFuncData: function (value, arg) {
    if (value == null) {
      return null;
    }

    let _this = this;
    console.log(333333333333, value)

    if (getObjType(value) == "array") {
      if (arg == "avg") {
        return luckysheet_function.AVERAGE.f.apply(luckysheet_function.AVERAGE, value);
      }
      else if (arg == "sum") {
        return luckysheet_function.SUM.f.apply(luckysheet_function.SUM, value);
      }
      else {
        return value[0];
        // if (getObjType(value[0]) == "object") {
        //   return luckysheet.mask.getValueByFormat(value[0]);
        // }
        // else {
        //   return value[0];
        // }
      }
    }
    else if (getObjType(value) == "object") {
      return value;
      // return luckysheet.mask.getValueByFormat(value);
    }
    else {
      return value;
    }
  }
}
export default formula;