var http = require('http');
var fs = require('fs');
let url = require('url');
let qs = require('querystring');

let templateHTML = function(title, list, body, control){
    return `
        <!doctype html>
        <html>
        <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
        </head>
        <body>
        <h1><a href="/">WEB</a></h1>
        ${list}
        ${control}
        ${body}
        </body>
        </html>`
}

let templateList = (fileList)=>{
    let list = '<ul>';
    for(let i=0; i<fileList.length; i++){
        list = list + `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`
    }
    list = list + '</ul>';
    return list;
}
var app = http.createServer(function(request,response){
    var _url = request.url;
    let queryData = url.parse(_url, true).query;
    var title = queryData.id;
    let pathName = url.parse(_url, true).pathname;

    if(pathName === '/'){
        if(queryData.id === undefined){
            fs.readdir('./data', (err,fileList)=>{
               let title = 'Welcome';
               let description = 'Hello NodeJS'
               let list = templateList(fileList);
               let template = templateHTML(title, list, `<h2>${title}</h2>${description}`,
               `<a href="/create">create</a>`
               );
               response.writeHead(200);
               response.end(template);
               //console.log(__dirname + url);
               //response.end(fs.readFileSync(__dirname + _url));
            })         
        }
        else{
            fs.readdir('./data', (err,fileList)=>{
                fs.readFile(`data/${queryData.id}`,'utf8', (err,description)=>{
                    let list = templateList(fileList);
                    let template = templateHTML(title, list, 
                        `<h2>${title}</h2>${description}`,
                        `<a href="/create">create</a> 
                        <a href="/update?id=${title}">update</a>
                        <form action="/delete_process" method="post">
                            <input type="hidden" name="id" 
                            value="${title}">
                            <input type="submit" value="delete">
                        </form>`
                        );
                    response.writeHead(200);
                    response.end(template);
                    //console.log(__dirname + url);
                    //response.end(fs.readFileSync(__dirname + _url));
                })
            })
        
        }
    }
    else if(pathName === '/create'){
        if(queryData.id === undefined){
            fs.readdir('./data', (err,fileList)=>{
               let title = 'WEB - create';
               let list = templateList(fileList);
               let template = templateHTML(title, list,`
                <form action="/create_process" method="post"> 
                <p><input type="text" name="title" placeholder="title"></p> 
                <p>
                    <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
                </form>
                `);
               response.writeHead(200);
               response.end(template);
            })         
        }
    }
    else if(pathName === '/create_process'){
        let body = '';
        request.on('data', (data)=>{
            body = body + data;
        });
        request.on('end', ()=>{
            let post = qs.parse(body);
            let title = post.title;
            let description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf8', (err)=>{
                response.writeHead(302, {Location:`/?id=${title}`});
                response.end('success');
            })
        });
        
    }
    else if(pathName === '/update'){
        fs.readdir('./data', (err,fileList)=>{
            fs.readFile(`data/${queryData.id}`,'utf8', (err,description)=>{
                let list = templateList(fileList);
                let template = templateHTML(title, list, 
                    `
                    <form action="/update_process" method="post"> 
                    <input type="hidden" name="id" value="${title}">
                    <p><input type="text" name="title" placeholder="title" value="${title}"></p> 
                    <p>
                        <textarea name="description" placeholder="description">${description}</textarea>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                    </form>
                    `,
                    `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
                    );
                response.writeHead(200);
                response.end(template);
                //console.log(__dirname + url);
                //response.end(fs.readFileSync(__dirname + _url));
            })
        })
    }
    else if(pathName === '/update_process'){
        let body = '';
        request.on('data', (data)=>{
            body = body + data;
        });
        request.on('end', ()=>{
            let post = qs.parse(body);
            let id = post.id;
            let title = post.title;
            let description = post.description;
            fs.rename(`data/${id}`,`data/${title}`, (err)=>{
                fs.writeFile(`data/${title}`, description, 'utf8', (err)=>{
                    response.writeHead(302, {Location:`/?id=${title}`});
                    response.end('success');
                })
            })
        });
    }
    else if(pathName === '/delete_process'){
        let body = '';
        request.on('data', (data)=>{
            body = body + data;
        });
        request.on('end', ()=>{
            let post = qs.parse(body);
            let id = post.id;
            fs.unlink(`data/${id}`, (err)=>{
                response.writeHead(302, {Location:`/`});
                response.end();
            })
        });
    }
    else{
        response.writeHead(404);
        response.end('Not found !!!!!!!');
    }
    
 
});
app.listen(3000);