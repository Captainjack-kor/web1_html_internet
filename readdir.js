let testFolder = './data';
console.log(testFolder);
console.log('1');
let fs = require('fs');

fs.readdir(testFolder, (err,fileList)=>{
    console.log(fileList);
})