import { Injectable } from '@nestjs/common';
import { promises } from 'fs';
import {getExcelData, getExcelConfigData} from '../../api/excelData'
var FormData = require('form-data');

const httpRequest = require('../../api/index')

@Injectable()
export class FormulaService {
  getHello(req, res): any {
    let excelData = getExcelData({gridKey: req.query.excelId}, req, res),
      excelCongif = getExcelConfigData(req.query, req, res)
    Promise.all([excelData, excelCongif]).then(result => {
      console.log(result)
    })
  }


  // execFunctionGroup(sheet): any {
  // length

  // let _this = this,
  //     calcChains = sheet.calcChains,
  //     formulaObjects = {};


  // //把修改涉及的单元格存储为对象
  // let updateValueOjects = {}, updateValueArray = [];
  // if (_this.execFunctionExist == null) {
  //   let key = "r" + origin_r + "c" + origin_c + "i" + index;
  //   updateValueOjects[key] = 1;
  // }
  // else {
  //   for (let x = 0; x < _this.execFunctionExist.length; x++) {
  //     let cell = _this.execFunctionExist[x];
  //     let key = "r" + cell.r + "c" + cell.c + "i" + cell.i;
  //     updateValueOjects[key] = 1;
  //   }
  // }

  // let arrayMatchCache = {};
  // let arrayMatch = function (formulaArray, formulaObjects, updateValueOjects, func) {
  //   for (let a = 0; a < formulaArray.length; a++) {
  //     let range = formulaArray[a];
  //     let cacheKey = "r" + range.row[0] + "" + range.row[1] + "c" + range.column[0] + "" + range.column[1] + "index" + range.sheetIndex;
  //     if (cacheKey in arrayMatchCache) {
  //       let amc = arrayMatchCache[cacheKey];
  //       // console.log(amc);
  //       amc.forEach((item) => {
  //         func(item.key, item.r, item.c, item.sheetIndex);
  //       });
  //     }
  //     else {
  //       let functionArr = [];
  //       for (let r = range.row[0]; r <= range.row[1]; r++) {
  //         for (let c = range.column[0]; c <= range.column[1]; c++) {
  //           let key = "r" + r + "c" + c + "i" + range.sheetIndex;
  //           func(key, r, c, range.sheetIndex);
  //           if ((formulaObjects && key in formulaObjects) || (updateValueOjects && key in updateValueOjects)) {
  //             functionArr.push({
  //               key: key,
  //               r: r,
  //               c: c,
  //               sheetIndex: range.sheetIndex
  //             });
  //           }
  //         }
  //       }

  //       if (formulaObjects || updateValueOjects) {
  //         arrayMatchCache[cacheKey] = functionArr;
  //       }
  //     }
  //   }
  // }

  // let existsChildFormulaMatch = {}, ii = 0;

  // //创建公式缓存及其范围的缓存
  // // console.time("1");
  // for (let i = 0; i < calcChains.length; i++) {
  //   let formulaCell = calcChains[i];
  //   let key = "r" + formulaCell.r + "c" + formulaCell.c + "i" + formulaCell.index;
  //   let calc_funcStr = getcellFormula(formulaCell.r, formulaCell.c, formulaCell.index);
  //   if (calc_funcStr == null) {
  //     continue;
  //   }
  //   let txt1 = calc_funcStr.toUpperCase();
  //   let isOffsetFunc = txt1.indexOf("INDIRECT(") > -1 || txt1.indexOf("OFFSET(") > -1 || txt1.indexOf("INDEX(") > -1;
  //   let formulaArray = [];

  //   if (isOffsetFunc) {
  //     this.isFunctionRange(calc_funcStr, null, null, formulaCell.index, null, function (str_nb) {
  //       let range = _this.getcellrange($.trim(str_nb), formulaCell.index);
  //       if (range != null) {
  //         formulaArray.push(range);
  //       }
  //     });
  //   }
  //   else if (!(calc_funcStr.substr(0, 2) == '="' && calc_funcStr.substr(calc_funcStr.length - 1, 1) == '"')) {
  //     //let formulaTextArray = calc_funcStr.split(/==|!=|<>|<=|>=|[,()=+-\/*%&^><]/g);//无法正确分割单引号或双引号之间有==、!=、-等运算符的情况。导致如='1-2'!A1公式中表名1-2的A1单元格内容更新后，公式的值不更新的bug
  //     //解决='1-2'!A1+5会被calc_funcStr.split(/==|!=|<>|<=|>=|[,()=+-\/*%&^><]/g)分割成["","'1","2'!A1",5]的错误情况
  //     let point = 0;//指针
  //     let squote = -1;//双引号
  //     let dquote = -1;//单引号
  //     let formulaTextArray = [];
  //     let sq_end_array = [];//保存了配对的单引号在formulaTextArray的index索引。
  //     let calc_funcStr_length = calc_funcStr.length;
  //     for (let i = 0; i < calc_funcStr_length; i++) {
  //       let char = calc_funcStr.charAt(i);
  //       if (char == "'" && dquote == -1) {
  //         //如果是单引号开始
  //         if (squote == -1) {
  //           if (point != i) {
  //             formulaTextArray.push(...calc_funcStr.substring(point, i).split(/==|!=|<>|<=|>=|[,()=+-\/*%&\^><]/));
  //           }
  //           squote = i;
  //           point = i;
  //         }
  //         else//单引号结束
  //         {
  //           //if (squote == i - 1)//配对的单引号后第一个字符不能是单引号
  //           //{
  //           //    ;//到此处说明公式错误
  //           //}
  //           //如果是''代表着输出'
  //           if (i < calc_funcStr_length - 1 && calc_funcStr.charAt(i + 1) == "'") {
  //             i++;
  //           }
  //           else {//如果下一个字符不是'代表单引号结束
  //             //if (calc_funcStr.charAt(i - 1) == "'") {//配对的单引号后最后一个字符不能是单引号
  //             //    ;//到此处说明公式错误
  //             point = i + 1;
  //             formulaTextArray.push(calc_funcStr.substring(squote, point));
  //             sq_end_array.push(formulaTextArray.length - 1);
  //             squote = -1;
  //             //} else {
  //             //    point = i + 1;
  //             //    formulaTextArray.push(calc_funcStr.substring(squote, point));
  //             //    sq_end_array.push(formulaTextArray.length - 1);
  //             //    squote = -1;
  //             //}
  //           }

  //         }
  //       }
  //       if (char == '"' && squote == -1) {
  //         //如果是双引号开始
  //         if (dquote == -1) {
  //           if (point != i) {
  //             formulaTextArray.push(...calc_funcStr.substring(point, i).split(/==|!=|<>|<=|>=|[,()=+-\/*%&\^><]/));
  //           }
  //           dquote = i;
  //           point = i;
  //         }
  //         else {
  //           //如果是""代表着输出"
  //           if (i < calc_funcStr_length - 1 && calc_funcStr.charAt(i + 1) == '"') {
  //             i++;
  //           }
  //           else {//双引号结束
  //             point = i + 1;
  //             formulaTextArray.push(calc_funcStr.substring(dquote, point));
  //             dquote = -1;
  //           }
  //         }
  //       }
  //     }
  //     if (point != calc_funcStr_length) {
  //       formulaTextArray.push(...calc_funcStr.substring(point, calc_funcStr_length).split(/==|!=|<>|<=|>=|[,()=+-\/*%&\^><]/))
  //     }
  //     //拼接所有配对单引号及之后一个单元格内容，例如["'1-2'","!A1"]拼接为["'1-2'!A1"]
  //     for (let i = sq_end_array.length - 1; i >= 0; i--) {
  //       if (sq_end_array[i] != formulaTextArray.length - 1) {
  //         formulaTextArray[sq_end_array[i]] = formulaTextArray[sq_end_array[i]] + formulaTextArray[sq_end_array[i] + 1];
  //         formulaTextArray.splice(sq_end_array[i] + 1, 1);
  //       }
  //     }
  //     //至此=SUM('1-2'!A1:A2&"'1-2'!A2")由原来的["","SUM","'1","2'!A1:A2","",""'1","2'!A2""]更正为["","SUM","","'1-2'!A1:A2","","",""'1-2'!A2""]

  //     for (let i = 0; i < formulaTextArray.length; i++) {
  //       let t = formulaTextArray[i];
  //       if (t.length <= 1) {
  //         continue;
  //       }

  //       if (t.substr(0, 1) == '"' && t.substr(t.length - 1, 1) == '"' && !_this.iscelldata(t)) {
  //         continue;
  //       }

  //       let range = _this.getcellrange($.trim(t), formulaCell.index);

  //       if (range == null) {
  //         continue;
  //       }

  //       formulaArray.push(range);
  //     }
  //   }

  //   let item = {
  //     formulaArray: formulaArray,
  //     calc_funcStr: calc_funcStr,
  //     key: key,
  //     r: formulaCell.r,
  //     c: formulaCell.c,
  //     index: formulaCell.index,
  //     parents: {},
  //     chidren: {},
  //     color: "w"
  //   }

  //   formulaObjects[key] = item;



  //   // if(isForce){
  //   //     updateValueArray.push(item);
  //   // }
  //   // else{
  //   //     arrayMatch(formulaArray, null, function(key){
  //   //         if(key in updateValueOjects){
  //   //             updateValueArray.push(item);
  //   //         }
  //   //     });
  //   // }

  // }

  // // console.timeEnd("1");

  // // console.time("2");
  // //形成一个公式之间引用的图结构
  // Object.keys(formulaObjects).forEach((key) => {
  //   let formulaObject = formulaObjects[key];
  //   arrayMatch(formulaObject.formulaArray, formulaObjects, updateValueOjects, function (childKey) {
  //     if (childKey in formulaObjects) {
  //       let childFormulaObject = formulaObjects[childKey];
  //       formulaObject.chidren[childKey] = 1;
  //       childFormulaObject.parents[key] = 1;
  //     }
  //     // console.log(childKey,formulaObject.formulaArray);
  //     if (!isForce && childKey in updateValueOjects) {
  //       updateValueArray.push(formulaObject);
  //     }
  //   });

  //   if (isForce) {
  //     updateValueArray.push(formulaObject);
  //   }
  // });

  // // console.log(formulaObjects)
  // // console.timeEnd("2");


  // // console.time("3");
  // let formulaRunList = [];
  // //计算，采用深度优先遍历公式形成的图结构

  // // updateValueArray.forEach((key)=>{
  // //     let formulaObject = formulaObjects[key];


  // // });

  // let stack = updateValueArray, existsFormulaRunList = {};
  // while (stack.length > 0) {
  //   let formulaObject = stack.pop();

  //   if (formulaObject == null || formulaObject.key in existsFormulaRunList) {
  //     continue;
  //   }

  //   if (formulaObject.color == "b") {
  //     formulaRunList.push(formulaObject);
  //     existsFormulaRunList[formulaObject.key] = 1;
  //     continue;
  //   }

  //   let cacheStack = [];
  //   Object.keys(formulaObject.parents).forEach((parentKey) => {
  //     let parentFormulaObject = formulaObjects[parentKey];
  //     if (parentFormulaObject != null) {
  //       cacheStack.push(parentFormulaObject);
  //     }
  //   });


  //   ii++;

  //   if (cacheStack.length == 0) {
  //     formulaRunList.push(formulaObject);
  //     existsFormulaRunList[formulaObject.key] = 1;
  //   }
  //   else {
  //     formulaObject.color = "b";
  //     stack.push(formulaObject);
  //     stack = stack.concat(cacheStack);
  //   }
  // }

  // formulaRunList.reverse();

  // // console.log(formulaObjects, ii)
  // // console.timeEnd("3");

  // // console.time("4");
  // for (let i = 0; i < formulaRunList.length; i++) {
  //   let formulaCell = formulaRunList[i];
  //   if (formulaCell.level == Math.max) {
  //     continue;
  //   }

  //   window.luckysheet_getcelldata_cache = null;
  //   let calc_funcStr = formulaCell.calc_funcStr;

  //   let v = _this.execfunction(calc_funcStr, formulaCell.r, formulaCell.c, formulaCell.index);

  //   _this.groupValuesRefreshData.push({
  //     "r": formulaCell.r,
  //     "c": formulaCell.c,
  //     "v": v[1],
  //     "f": v[2],
  //     "spe": v[3],
  //     "index": formulaCell.index
  //   });

  //   // _this.execFunctionGroupData[u.r][u.c] = value;
  //   _this.execFunctionGlobalData[formulaCell.r + "_" + formulaCell.c + "_" + formulaCell.index] = {
  //     v: v[1],
  //     f: v[2]
  //   };
  // }
  // // console.log(formulaRunList);
  // // console.timeEnd("4");

  // _this.execFunctionExist = null;
  // },
}
