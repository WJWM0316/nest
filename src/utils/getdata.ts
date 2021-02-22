import { getObjType,rgbTohex } from './utils';
import { dynamicArrayCompute } from './dynamicArray';

export function getdatabyselectionD(d, range) {
    if (range == null || range["row"] == null || range["row"].length == 0) {
        return [];
    }
    
    let dynamicArray_compute = dynamicArrayCompute(global['sheet']["dynamicArray"]);
    let data = [];

    if(d==null){
        return data;
    }

    for (let r = range["row"][0]; r <= range["row"][1]; r++) {
        if(d[r] == null){
            continue;
        }

        let row = [];

        for (let c = range["column"][0]; c <= range["column"][1]; c++) {
            let value;
            
            if((r + "_" + c) in dynamicArray_compute){
                value = dynamicArray_compute[r + "_" + c];
            }
            else{
                value = d[r][c];
            }

            row.push(value);
        }

        data.push(row);
    }

    return data;
}



//Get the value of the cell
export function getcellvalue(r, c, data?, type?) {
    if (type == null) {
        type = "v";
    }

    if (data == null) {
        data = global['sheet'].data;
    }

    let d_value;

    if (r != null && c != null) {
        d_value = data[r][c];
    }
    else if (r != null) {
        d_value = data[r];
    }
    else if (c != null) {
        let newData = data[0].map(function(col, i) {
            return data.map(function(row) {
                return row[i];
            })
        });
        d_value = newData[c];
    }
    else {
        return data;
    }

    let retv = d_value;

    if(getObjType(d_value) == "object"){
        retv = d_value[type];
        if(type == "f") {
            retv = d_value["v"];
        }
        else if(d_value && d_value.ct && d_value.ct.t == 'd') {
            retv = d_value.m;
        }
    }

    if(retv == undefined){
        retv = null;
    }

    return retv;
}
