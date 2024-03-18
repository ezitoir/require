
const fs = require('fs');
const path = require("path"); 
const get_node_modules = require("./deps/node_modules");
const to_posix = require("./deps/to_posix");
const is_file = require("./deps/is_file");
const is_dir = require("./deps/is_dir");
const has = require("./deps/has");
const Module = require("module").Module;
/** @type {Array} */
const builtinModules = Module.builtinModules;
/** @type {Array} */
const builtinModulesNode = Module.builtinModules.map(i => 'node:' + i);
/** @type {function} */
const _resolveFilenameOrg = Module._resolveFilename.bind(Module);

Array.prototype.someVal = function ( callback ){
    for (const iterator of this) {
        if(callback(iterator)) return iterator;
    }
}

Array.prototype.indexOfVal = function ( search ){
    if(this.indexOf(search) > -1) return this[this.indexOf(search)];
    return false;
}






const jsconfig_path = is_file(path.join(process.cwd() , 'jsconfig.json')) ? path.join(process.cwd(), 'jsconfig.json') : null;
const jsconfig = jsconfig_path ? require(jsconfig_path) : null;
const jsconfig_object = (function getJsConfig(jsconfig_has_paths = {}){
    const jsconfig_parse = {};
    if(jsconfig_has_paths)
    for (var key in jsconfig_has_paths) {
        if (Object.hasOwnProperty.call(jsconfig_has_paths, key)) {
            if(key.indexOf("*") > -1){ 
                jsconfig_parse[key.slice(0 , key.indexOf("*"))] = jsconfig_has_paths[key] instanceof Array ? jsconfig_has_paths[key] :[ jsconfig_has_paths[key] ];
                key = key.slice(0 , key.indexOf("*"));
            }
            else {
                jsconfig_parse[key] = jsconfig_has_paths[key] instanceof Array ? jsconfig_has_paths[key] : [jsconfig_has_paths[key]];
            }
    
            var counter = 0 ;
            for (const iterator of jsconfig_parse[key]) {
                var dir = iterator.indexOf("*") > -1 ? iterator.slice(0 , iterator.indexOf("*")) : iterator;
                jsconfig_parse[key][counter] = to_posix(path.join(process.cwd() , dir));
                counter ++;
            }
        }
    }
    return jsconfig_parse;
})(has(jsconfig ? jsconfig : {} , "compilerOptions/paths"));



const new_resolver = function new_resolver (arguments){
    const { dir = false , error = true } = typeof arguments[3] == "boolean" ? { dir : arguments[3] } : typeof arguments[3] == "object" ? arguments[3] : {};   
    const type = arguments.length > 3 ? "resolve" : "require";
    if( type == "resolve" ){
        if(dir && (is_file(arguments[0]) || is_dir(arguments[0]))){
            if(!error) return [ null , is_file(arguments[0]) ? path.dirname(arguments[0]) : arguments[0]];
            return is_file(arguments[0]) ? path.dirname(arguments[0]) : arguments[0];
        }
        try {
            return _resolveFilenameOrg(...arguments);
        } catch (err) {
            if(!error) return [ err , null ];
            console.error( err);
        }
    }
    return _resolveFilenameOrg(...arguments);
};


function resolver(arguments){
    arguments = Object.entries(arguments).map( item => item[1]);
    arguments.push(arguments[0]);
    arguments[0] = to_posix(arguments[0]);
    /** @type {String} */
    var new_id ;
    /** @type {Array} */
    var node_modules;
    /** @type {Array} */
    var relative = [
        ".",
        "./",
        "/"
    ];
    var is_relative = relative.includes(arguments[0].slice(0 ,2)) || relative.includes(arguments[0].slice(0 ,1));

    /**
     ** native modules
     ** linux and win
     **/
    if((new_id = builtinModules.indexOfVal(arguments[0])) || (new_id = builtinModulesNode.indexOfVal(arguments[0]))){
        new_id = new_id > arguments[0] ? arguments[0] : new_id;
        arguments[0] = new_id;
        return _resolveFilenameOrg(new_id);
    }
    
    
    /**
     ** node_modules folder
     **/
    node_modules = get_node_modules(arguments[0]);
    if(((new_id = node_modules.someVal(is_file)) || (new_id=node_modules.someVal(is_dir))) && !is_relative){
        node_modules = undefined;
        return new_resolver(arguments);
    }
    node_modules = [];
    
    /**
     ** relative folder
     **/
    if(is_relative){
        var join_ = path.join( arguments[1].path , arguments[0]);
        arguments[0] = to_posix(arguments.length > 1 ? is_file(join_) || is_dir(join_) ? join_ : arguments[0]: arguments[0]);
        return new_resolver(arguments);
    }

    if(!is_relative){
        node_modules = [
            to_posix(path.join(process.cwd(), arguments[0])),
            to_posix(path.join(process.cwd(), arguments[0])) + ".js",
            to_posix(path.join(process.cwd(), arguments[0])) + ".json",
            to_posix(path.join(process.cwd(), arguments[0])) + ".node",
        ];
        
        if((new_id = node_modules.someVal(is_file)) || (new_id = node_modules.someVal(is_dir))){
            node_modules = undefined ;
            arguments[0] = to_posix(new_id); 
            return new_resolver(arguments)  ;
        }
        
        
        for (const key in jsconfig_object) {
            if(arguments[0].slice(0 , key.length) == key){
                for(const src of jsconfig_object[key]){
                    node_modules = [
                        to_posix(path.join( src , arguments[0].slice(key.length))),  
                        to_posix(path.join( src , arguments[0].slice(key.length))) + ".js",  
                        to_posix(path.join( src , arguments[0].slice(key.length))) + ".json",  
                        to_posix(path.join( src , arguments[0].slice(key.length))) + ".node",  
                    ];
                }
                if(!node_modules.some(is_file) && !node_modules.some(is_dir) ) continue;
                if((new_id = node_modules.someVal(is_file)) || (new_id=node_modules.someVal(is_dir))) arguments[0] = to_posix(new_id);
                return new_resolver(arguments);
            }
        }
    }

    node_modules = undefined;
    new_id = undefined;
    return _resolveFilenameOrg(...arguments);
};



Module._resolveFilename = function (){
    return resolver.call(Module , arguments);
};



