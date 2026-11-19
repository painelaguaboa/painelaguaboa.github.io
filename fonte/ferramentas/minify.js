const es=require('/tmp/esb/node_modules/esbuild');const fs=require('fs');
const items=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
(async()=>{const out=[];for(const it of items){try{const r=await es.transform(it.code,{loader:it.tipo,minify:true,target:it.tipo==='js'?'es2019':undefined,legalComments:'none',charset:'utf8'});out.push(r.code.trim())}catch(e){console.error('ERRO',it.tipo,e.message);process.exit(1)}}fs.writeFileSync(process.argv[3],JSON.stringify(out))})();
