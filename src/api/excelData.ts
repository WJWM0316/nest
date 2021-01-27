const httpRequest = require('./index')

// 获取模板配置列表数据
export const getExcelConfigData = (data, req, res) => {
  return httpRequest({
    method: 'GET',
    url: '/epm-configuration/budconfsheetcolumn/getAllSheetColumn',
    data,
    req,
    res
  })
}

// 获取工作簿excel模板数据
export const getExcelData = (data, req, res) => {
  return httpRequest({
    method: 'POST',
    url: '/epm-configuration/sheetTemplate/getSheetList',
    data,
    req,
    res
  })
}

// 获取模板
export const getConfigSheet = (data, req, res) => {
  return httpRequest({
    method: 'POST',
    url: '/epm-configuration/budconfsheet/list',
    data,
    req,
    res
  })
}

// 获取节点数据
export const getNodeData = (data, req, res) => {
  return httpRequest({
    method: 'POST',
    url: '/epm-configuration/sheetTemplate/getSheetEditList',
    data,
    req,
    res
  })
}