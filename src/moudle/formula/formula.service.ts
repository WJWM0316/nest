import { Injectable } from '@nestjs/common';
import {getExcelData, getExcelConfigData, getNodeData, saveData} from '../../api/excelData'
import formula from '../../utils/formula'
import {sheetFormula} from '../../utils/sheetFormula'
import excelTemplate from '../../utils/excelTemplate'

let demoDaTa : any = sheetFormula
@Injectable()
export class FormulaService {
  formulaFun(req, res): any {
    getNodeData(req.body, req, res).then(result => {
      result.data = excelTemplate.extendData(result.data, true)
      let sheet = result.data[0]
      console.time('加载公式')
      sheet = formula.execFunctionGroup(sheet)
      console.timeEnd('加载公式')
      let params = {
        sheetData: [],
        flag: "edit",
        excelId: req.body.excelId,
        sheetId: req.body.sheetId
      }
      for (let i = 0; i < sheet.data.length; i++) {
        for (let j = 0; j < sheet.data[i].length; j++) {
          params.sheetData.push(sheet.data[i][j])
        }
      }
      saveData(params, req, res).then(() => {
        res.json({
          httpCode: 200,
          data: sheet,
          msg: '加载公式保存成功'
        })
      })
    })
  } 
}
