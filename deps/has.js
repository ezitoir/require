function has( object , key , valueType = undefined ){ 
    var check_keys = [];
    if('object' !== typeof object) return false; 
    if(key.indexOf("/") > -1) check_keys = key.trim().split("/"); else check_keys =  [ key ];
  
    for (const iterator of check_keys) {
        if(Object.prototype.hasOwnProperty.call(object , iterator) == true){
            if( typeof valueType === "function"){
                return valueType(object[iterator])
            }
            else {
                if(typeof valueType !== "undefined"){ 
                    if(typeof object[iterator] === valueType.trim()){
                        object =  object[iterator];
                    }
                    return false;
                }
            }
            object =  object[iterator];
        }
        else {
            return false;
        }
    }

    return object; 
   
}

module.exports = has;