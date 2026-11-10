import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function arg(name,fallback){const i=process.argv.indexOf(name);return i<0?fallback:process.argv[i+1];}
const directory=path.resolve(root,arg('--dir','dist'));
if(!directory.startsWith(root+path.sep))throw Error('Preview directory must be inside the website folder');
const mount=arg('--base-path','').replace(/\/+$/,'');
const port=Number(arg('--port','4173'));
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid port');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp4':'video/mp4','.bib':'text/plain; charset=utf-8','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const server=http.createServer((request,response)=>{
  try{
    if(!['GET','HEAD'].includes(request.method)){response.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
    const requestUrl=new URL(request.url,'http://127.0.0.1');
    let pathname=decodeURIComponent(requestUrl.pathname);
    if(mount&&pathname===mount){response.writeHead(301,{Location:mount+'/'}).end();return;}
    if(mount&&!pathname.startsWith(mount+'/')){response.writeHead(404).end('Not found');return;}
    if(mount)pathname=pathname.slice(mount.length);
    if(pathname.split('/').some(part=>part==='..'||part.startsWith('.'))){response.writeHead(403).end('Forbidden');return;}
    let file=path.resolve(directory,'.'+pathname);
    if(!file.startsWith(directory+path.sep)&&file!==directory){response.writeHead(403).end();return;}
    if(fs.existsSync(file)&&fs.statSync(file).isDirectory()){
      if(!pathname.endsWith('/')){response.writeHead(301,{Location:mount+pathname+'/'}).end();return;}
      file=path.join(file,'index.html');
    }
    let status=200;
    if(!fs.existsSync(file)||!fs.statSync(file).isFile()){file=path.join(directory,'404.html');status=404;}
    if(!fs.existsSync(file)){response.writeHead(404).end('Not found');return;}
    const size=fs.statSync(file).size;
    const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'};
    const range=request.headers.range;
    let start=0,end=size-1;
    if(range&&status===200){
      const match=/^bytes=(\d*)-(\d*)$/.exec(range);
      if(!match){response.writeHead(416,{'Content-Range':'bytes */'+size}).end();return;}
      if(match[1]){start=Number(match[1]);if(match[2])end=Number(match[2]);}
      else if(match[2])start=Math.max(0,size-Number(match[2]));
      if(start>end||start>=size){response.writeHead(416,{'Content-Range':'bytes */'+size}).end();return;}
      end=Math.min(end,size-1);status=206;headers['Content-Range']='bytes '+start+'-'+end+'/'+size;
    }
    headers['Content-Length']=Math.max(0,end-start+1);
    response.writeHead(status,headers);
    if(request.method==='HEAD'){response.end();return;}
    fs.createReadStream(file,{start,end}).on('error',()=>response.destroy()).pipe(response);
  }catch{response.writeHead(400).end('Bad request');}
});
server.listen(port,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:'+port+mount+'/'));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
