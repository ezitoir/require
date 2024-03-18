

function to_posix(path) { return (path || "").replace(/\\/g , "/")};

module.exports = to_posix;