import functionlist from './functionlist';
let data = {};
    for (let i = 0; i < functionlist.length; i++) {
        let func = functionlist[i];
        data[func.n] = func;
    }
export const luckysheet_function : any = data
