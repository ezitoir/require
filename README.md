

## How To Work
This package sets the require function so that if you want to load non-native models, it will automatically use the base path or jconfig.json settings.


## Installation

```bash

npm install ezito-require

```
## Priority to add and call

```js
require("fs"); // or other native module
require("react"); // node_modules dir
require("src/deps/toString"); // local source of base path directory
require("./ ....") /* relative dir require  AND */
require("@/*") /* jsconfig.js */
```

## Usage

```js
require("ezito-require");

// using process.cwd() base path and join to this path
require("src/deps/toString.js");



//jsconfig.json
/*{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/data~" : ["./src/deps/data"]
    }
  }
}*/
requrie("@/deps/toString.js");
// OR
require("@/data~/keywords.js");

```

```js
require("ezito-require");
// resolve file of directory
require.resolve("react");
require.resolve("src");
require.resolve("@/src/deps");

```
## Comment
```bash
require.resolveDir resolve exists directory path
```

```js
require("ezito-require");
// resolve file of directory
const react_path =  require.resolve("react" , true);
const src_path = require.resolve("src" , true);
require.resolve("@/src/deps" , true );

// resolve file of directory
require.resolve("react" , { dir : true });
require.resolve("src" , { dir : true });
require.resolve("@/src/deps" , { dir : true });

```


## Option

```bash
if you set the error value in the option to false, resolve will return an array with the error value and the file path
```

```js
require("ezito-require");
// resolve file of directory

// If dir exists, the error is null and vice versa
const [ erorr , react_path] =  require.resolve("react" , { error : false , dir : true });
const [ error , src_path] = require.resolve("src" , { error : false });
const [ error , deps_path] =require.resolve("@/src/deps" , { dir : true , erorr : false} );

```
