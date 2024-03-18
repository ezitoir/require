
const fs = require("fs");
const is_file = function (file) {
    try {
        try {
            var stat = fs.statSync(file, { throwIfNoEntry: false });
        } catch (e) {
            if (e && (e.code === 'ENOENT' || e.code === 'ENOTDIR')) return false;
            throw e;
        }
        return !!stat && (stat.isFile() || stat.isFIFO());
    } catch (error) {
        return false;
    }  
};

module.exports = is_file;