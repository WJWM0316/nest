class ExcelTemplate {
  // 生成模板
  create(data, oldData, config) {
    // 计算表头占据的行数
    let findStartRow = () => {
      let maxRow = 1
      data.forEach((item, index) => {
        if (item.description && item.description.trim()) {
          if (item.description.includes('：')) {
            if (item.description.split('：').length + 1 > maxRow) maxRow = item.description.split('：').length + 1
          } else {
            if (maxRow === 1) maxRow = 2
          }
        }
      })
      return maxRow
    }

    let allRowNum = findStartRow() + 1, // 起始行
      sheet: any = { // sheet 初始化初级
        calcChain: [],
        celldata: [],
        startRowNum: allRowNum,
        data: [],
        config: {
          merge: {},
          borderInfo: []
        },
        dataVerification: {},
        requiredcolumn: [], // 必填列
        frozen: {}
      },
      cell = { // 初始化表格数据
        bg: null,
        bl: 0,
        ct: {
          fa: "General",
          t: "n"
        },
        fc: "#000000",
        fs: 10,
        ht: 0,
        it: 0,
        vt: 0,
        lo: 0,
        v: '',
        m: ''
      },
      allColumn = 0, // 总列数
      mergeCell = [], // 需要合并的单元格集合
      mergeCellTYpe = [] // 合并成一个单元格的 单元格类型集合

    // 设置了隐藏列 直接过滤掉
    let newData = data.filter(item => item.hide !== 'Y')

    // 遍历基础单元格
    for (let i = 0; i < allRowNum; i++) {
      sheet.data[i] = []
      for (let j = 0; j < newData.length; j++) {
        sheet.data[i][j] = { ...cell }
      }
    }

    // 模板数据同步到新生成的表格里
    if (oldData) {
      // 同步整个config配置
      if (oldData.config) {
        if (oldData.config.merge) oldData.config.merge = {}
        if (oldData.config.authority) oldData.config.authority = {}
        if (oldData.config.borderInfo) oldData.config.borderInfo = []
        sheet.config = { ...sheet.config, ...oldData.config }
      }

      // 同步数据验证配置
      if (oldData.dataVerification) {
        sheet.dataVerification = oldData.dataVerification
      }

      if (oldData.celldata && oldData.celldata.length > 0) {
        // 同步表头以外的单元格数据
        oldData.celldata.forEach((item) => {
          if (!sheet.data[item.r]) sheet.data[item.r] = []
          if (item.r >= allRowNum - 1) {
            item.v.lo = 0
            sheet.data[item.r][item.c] = item.v
          }
        })
      }
    }

    // 开始遍历数据源
    newData.forEach((item, index) => {
      let cellData: any = {
        ...cell
      }

      allColumn++

      // 如果设置了必填项且没有设置数据验证
      if (item.required === 'Y') {
        sheet.requiredcolumn.push(index)
      }

      // 配置数据验证
      if (item.dataValidation) {
        sheet.dataVerification[`${allRowNum - 1}_${index}`] = item.dataVerification
      }

      // 需要合并单元格的数据
      if (item.description && item.description.trim()) {
        if (!item.description.includes('：')) {
          item.level = 1
          item.allLevel = 2
          item.parent = item.description + `_level${item.level}`
          item.cellName = item.description
          if (!mergeCellTYpe.some(res => item.parent === res.parent)) {
            mergeCellTYpe.push(item)
          }
          mergeCell.push(item)
        } else {
          let section = item.description.split('：')
          item.allLevel = section.length + 1
          for (let i = 0; i <= section.length - 1; i++) {
            let iData = {
              ...item
            }
            iData.level = i + 1
            iData.parent = item.description + `_level${iData.level}`
            iData.cellName = section[i]
            if (!mergeCellTYpe.some(res => iData.parent === res.parent)) {
              mergeCellTYpe.push(iData)
            }
            mergeCell.push(iData)
          }
        }
      } else {
        // 只有一级表头先赋值， 且先合并单元格
        item.level = 1
        cellData = {
          ...cellData,
          ...{
            v: item.title,
            m: item.title,
            bg: "#4496e1",
            fc: "#ffffff",
            lo: 0
          }
        }
        if (item.required === 'Y') {
          if (item.title.includes('(*)') || item.title.includes('（*）')) item.title = item.title.trim().slice(3, item.title.length)
          cellData = {
            ...cellData, ...{
              ct: {
                s: [{
                  "fc": "#ff0000",
                  "fs": 10,
                  "cl": 0,
                  "un": 0,
                  "bl": 0,
                  "it": 0,
                  "v": "*"
                }, {
                  "fc": "#ffffff",
                  "fs": 10,
                  "cl": 0,
                  "un": 0,
                  "bl": 0,
                  "it": 0,
                  "v": item.title
                }],
                t: 'inlineStr',
                fa: item.ct && item.ct.fa
              }
            }
          }
          delete cellData.v
          delete cellData.m
        }
        sheet.config.merge[`0_${index}`] = {
          r: 0,
          c: index,
          rs: allRowNum - 1,
          cs: 1
        }
        sheet.config.borderInfo.push({
          rangeType: "range",
          borderType: 'border-left',
          color: '#fff',
          style: 1,
          range: [{
            "row": [0, allRowNum - 2],
            "column": [index, index]
          }]
        })
      }

      // 设置单元格基础属性
      sheet.data[0][index] = { ...cellData, ...{ lo: 1 } }

      // 度量数据靠右，维度数据靠左
      if (item.type === 'measure') {
        sheet.data[allRowNum - 1][index].ht = 2
      } else if (item.type === 'dimension') {
        sheet.data[allRowNum - 1][index].ht = 1
      }

      // 设置表头以下的单元格是否编辑状态
      if (item.edit === 'N') {
        if (config) {
          if (config.templateType !== 'fixed') {
            sheet.data[allRowNum - 1][index].lo = 1
            sheet.data[allRowNum - 1][index].bg = '#cccccc'
          } else {
            sheet.data.forEach((a, i) => {
              if (i >= allRowNum - 1) {
                if (!a[index]) a[index] = { ...cellData }
                a[index].lo = 1
                a[index].bg = '#cccccc'
              }
            })
          }
        }
      }

      // 设置数据格式类型, 存在format才主动设置
      if (item.format) {
        let format = JSON.parse(item.format)
        if (config.templateType !== 'fixed') {
          sheet.data[allRowNum - 1][index].ct = format
        }
      }
    })

    // 多级表头分组
    let tree = []
    for (let i = 0; i <= mergeCellTYpe.length - 1; i++) {
      tree[i] = []
      for (let j = 0; j <= mergeCell.length - 1; j++) {
        if (mergeCell[j].level === 1) {
          if (mergeCell[j].cellName === mergeCellTYpe[i].cellName) {
            tree[i].push(mergeCell[j])
          }
        } else {
          if (mergeCell[j].parent === mergeCellTYpe[i].parent) {
            tree[i].push(mergeCell[j])
          }
        }
      }
    }

    // 多级表头单元格生成 并设置样式跟值等
    for (let i of tree) {
      let curRow = i[0].level - 1,
        curCol = i[0].columnNum - 1,
        level = i[0].level,
        allLevel = i[0].allLevel,
        size = i.length
      for (let j of i) {
        sheet.data[j.level - 1][j.columnNum - 1] = {
          ...cell,
          ...{
            v: j.cellName,
            m: j.cellName,
            bg: "#4496e1",
            fc: "#fff",
            lo: 1
          }
        }
        if (j.level + 1 === j.allLevel) {
          let cellObj: any = {
            ...cell,
            ...{
              v: j.title,
              m: j.title,
              bg: "#4496e1",
              fc: "#fff",
              lo: 1
            }
          }
          if (j.required === 'Y') {
            if (j.title.includes('(*)') || j.title.includes('（*）')) j.title = j.title.trim().slice(3, j.title.length)
            cellObj = {
              ...cellObj, ...{
                ct: {
                  s: [{
                    "fc": "#ff0000",
                    "fs": 10,
                    "cl": 0,
                    "un": 0,
                    "bl": 0,
                    "it": 0,
                    "v": "*"
                  }, {
                    "fc": "#ffffff",
                    "fs": 10,
                    "cl": 0,
                    "un": 0,
                    "bl": 0,
                    "it": 0,
                    "v": j.title
                  }],
                  t: 'inlineStr',
                  fa: cell.ct.fa
                }
              }
            }
            delete cellObj.v
            delete cellObj.m
          }
          if (!sheet.data[j.level]) sheet.data[j.level] = []
          sheet.data[j.level][j.columnNum - 1] = { ...cellObj }

          sheet.config.borderInfo.push({
            rangeType: "range",
            borderType: 'border-bottom',
            color: '#eee',
            style: 1,
            range: [{
              "row": [j.level - 1, j.level - 1 + (allRowNum - allLevel)],
              "column": [j.columnNum, j.columnNum - 1 + size - 1]
            },]
          }, {
            rangeType: "range",
            borderType: 'border-left',
            color: '#eee',
            style: 1,
            range: [{
              "row": [j.level, allRowNum - allLevel + curRow],
              "column": [j.columnNum - 1, j.columnNum - 1]
            },]
          })
          sheet.config.merge[`${j.level}_${j.columnNum - 1}`] = {
            r: j.level,
            c: j.columnNum - 1,
            rs: allRowNum - allLevel,
            cs: 1
          }
        }
      }
      sheet.config.merge[`${curRow}_${curCol}`] = {
        r: curRow,
        c: curCol,
        rs: 1,
        cs: size
      }
      sheet.config.borderInfo.push({
        rangeType: "range",
        borderType: 'border-bottom',
        color: '#eee',
        style: 1,
        range: [{
          "row": [curRow, curRow],
          "column": [curCol, curCol + size - 1]
        }]
      }, {
        rangeType: "range",
        borderType: 'border-left',
        color: '#eee',
        style: 1,
        range: [{
          "row": [curRow, curRow],
          "column": [curCol, curCol]
        }]
      })
    }

    // 转化成初始化需要的数据
    let ret = [];
    for (let r = 0; r < sheet.data.length; r++) {
      for (let c = 0; c < sheet.data[0].length; c++) {
        if (!sheet.data[r] || !sheet.data[r][c]) {
          continue;
        }
        ret.push({
          r: r,
          c: c,
          v: sheet.data[r][c]
        });
      }
    }
    sheet.celldata = ret

    // 设置保护表
    sheet.config.authority = {
      algorithmName: "None",
      allowRangeList: [],
      selectLockedCells: 1, //选定锁定单元格
      selectunLockedCells: 1, //选定解除锁定的单元格
      formatCells: 1, //设置单元格格式
      formatColumns: 1, //设置列格式
      formatRows: 1, //设置行格式
      insertColumns: 0, //插入列
      insertRows: 1, //插入行
      insertHyperlinks: 1, //插入超链接
      deleteColumns: 0, //删除列
      deleteRows: 1, //删除行
      sort: 1, //排序
      filter: 1, //使用自动筛选
      usePivotTablereports: 1, //使用数据透视表和报表
      editObjects: 1, //编辑对象
      editScenarios: 1, //编辑方案
      sheet: 1, //如果为1或true，则该工作表受到保护；如果为0或false，则该工作表不受保护。
      hintText: "", //弹窗提示的文字
      saltValue: null, //密码解密的盐参数，为一个自己定的随机数值
    }

    // 设置公式链
    sheet.calcChain = []
    sheet.data.forEach((item, index) => {
      if (index >= sheet.startRowNum - 1) {
        item.forEach((a, i) => {
          if (a.hasOwnProperty('f') && a.f) {
            sheet.calcChain.push({
              r: index,
              c: i,
              index: oldData.index,
              times: 0,
              fun: [true, 0, a.f]
            })
          }
        })
      }

    })

    // 模板数据没列宽就设置默认列宽
    if (!oldData || (oldData && oldData.config && !oldData.config.columnlen)) {
      sheet.config.columnlen = {}
      sheet.data[sheet.startRowNum - 1].forEach((item, index) => {
        sheet.config.columnlen[index] = 120
      })
    }

    // 设置冻结行列和起始行列属性
    sheet.frozen = {}
    if (config) {
      if (config.frozenRow > 0 && config.frozenColumn > 0) {
        sheet.frozen = {
          range: {
            column_focus: config.frozenColumn - 1,
            row_focus: config.frozenRow - 1
          },
          type: 'rangeBoth'
        }
      } else if (config.frozenRow > 0 && config.frozenColumn === 0) {
        sheet.frozen = {
          range: {
            column_focus: 0,
            row_focus: config.frozenRow - 1
          },
          type: 'rangeRow'
        }
      } else if (config.frozenRow === 0 && config.frozenColumn > 0) {
        sheet.frozen = {
          range: {
            column_focus: config.frozenColumn - 1,
            row_focus: 0
          },
          type: 'rangeColumn'
        }
      }
      if (config.startRowNum) sheet.startRowNum = config.startRowNum
      if (config.startColNum) sheet.startColNum = config.startColNum
    }

    console.log(sheet, '生成的表数据')
    return sheet
  }

  //拓展luckysheet数据, 主要遍历公式链、数据验证、单元格格式公式、边框等数据
  extendData(data, hasData) {
    data.forEach(sheet => {
      console.time(`组装<${sheet.name}>数据结构`)

      if (sheet.celldata && sheet.celldata.length > 0) {
        sheet.celldata.forEach(item => {
          if (item && item.v && !item.v.hasOwnProperty('lo')) item.v.lo = 0
        })
      }
      if (sheet.sheetType === 'fixed') return
      let rowNum = sheet.row - sheet.startRowNum + 1,
        calcChain = [],
        dataVerification = {},
        column = sheet.column,
        borderInfo = sheet.config && sheet.config.borderInfo || []

      // 组装公式链
      for (let i = 0; i < rowNum; i++) {
        // 拼接公式链
        if (sheet.calcChain && sheet.calcChain.length > 0) {
          // 判断是否到了需要拼装公式的行
          for (let j = 0; j < sheet.calcChain.length; j++) {
            calcChain.push({ r: sheet.calcChain[j].r + i, c: sheet.calcChain[j].c, index: sheet.calcChain[j].index })
          }
        }
        // 数据验证
        if (sheet.dataVerification && JSON.stringify(sheet.dataVerification) !== '{}') {
          for (let j in sheet.dataVerification) {
            let value = sheet.dataVerification[j]
            let a = j.split('_'),
              r = parseInt(a[0]),
              c = parseInt(a[1])
            dataVerification[`${r + i}_${c}`] = value
          }
        }
      }

      sheet = this.extendCellData(sheet, hasData)

      // 组装边框
      for (let i = 0; i < column; i++) {
        borderInfo.push({
          "rangeType": "range",
          "borderType": "border-all",
          "style": "1",
          "color": "#eee",
          "range": [{
            "row": [sheet.startRowNum - 1, rowNum + 1],
            "column": [i, i]
          }]
        })
      }
      sheet.calcChain = calcChain
      sheet.dataVerification = dataVerification
      if (!sheet.config) sheet.config = {}
      sheet.config.borderInfo = borderInfo
      console.timeEnd(`组装<${sheet.name}>数据结构`)
    })
    return data
  }

  // 组装celldata
  extendCellData(sheet, hasData) {
    let sheetData : any = []// 二维数组
    console.time(`组装<${sheet.name || ''}>celldata`)
    // 根据起始行对应的单元格来设置其他单元格
    let setCell = (i, startCell) => {
      i.v = { ...startCell, ...i.v }
      // 组装公式链
      if (startCell && startCell.f) {
        let a = /[A-Z]+[1-9]+/g,
          b = startCell.f.match(a),
          c = [...new Set(b)]
        for (let j = 0; j < c.length; j++) {
          let d: any = c[j]
          i.v.f = i.v.f.replace(new RegExp(d, "gm"), d.replace(/[1-9]+/g, '', 1) + (i.r + 1))
          i.v.v = ''
          i.v.m = ''
        }
      }
      return i
    }
    for (let i of sheet.celldata) {
      if (!sheetData[i.r]) sheetData[i.r] = []
      sheetData[i.r][i.c] = { ...i.v }
      // 需要组装的行
      if (i.r > sheet.startRowNum - 1) {
        // 起始行单元格
        let startCell = sheetData[sheet.startRowNum - 1][i.c]
        // 如果是标记了红色的单元格就不补全了
        if (startCell && startCell.bg && startCell.bg === '#ff0000') delete startCell.bg
        let a = setCell(i, startCell)
        sheetData[i.r][i.c] = a.v
      }
    }
    let blank = []
    // 导入的数据存在空白行
    sheetData[sheet.startRowNum].forEach((item, index) => {
      if (item === null) {
        blank.push(index)
      }
    })
    for (let i = 0; i < sheetData[sheet.startRowNum].length; i++) {
      if (!sheetData[sheet.startRowNum][i]) {
        blank.push(i)
      }
    }
    for (let i = 0; i < sheetData.length; i++) {
      if (i > sheet.startRowNum - 1) {
        for (let j of blank) {
          let id = null
          let a = (sheetData[i].find(item => Boolean(item.id)))
          if (a) id = a.id
          sheetData[i][j] = { ...sheetData[sheet.startRowNum - 1][j], ...{ v: '', m: '', id } }
          delete sheetData[i][j].f
          let cell = setCell({ r: i, c: j, v: sheetData[i][j] }, sheetData[sheet.startRowNum - 1][j])
          sheet.celldata.push(cell)
        }
      }
    }
    console.timeEnd(`组装<${sheet.name || ''}>celldata`)
    if (hasData) sheet.data = sheetData
    return sheet
  }

  //是否是空值
  isRealNull(val) {
    if (val == null || val.toString().replace(/\s/g, "") == "") {
      return true;
    } else {
      return false;
    }
  }
  //是否是纯数字
  isRealNum(val) {
    if (val == null || val.toString().replace(/\s/g, "") === "") {
      return false;
    }

    if (typeof val == "boolean") {
      return false;
    }

    if (!isNaN(val)) {
      return true;
    } else {
      return false;
    }
  }
  // 是否日期时间
  isdatetime(s) {
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

      var year: any = RegExp.$1,
        month: any = RegExp.$2,
        day: any = RegExp.$3;

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
}
export default new ExcelTemplate()
