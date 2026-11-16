import http from 'node:http';
const upstream=process.env.PERF_API_URL||'https://api-alwosabe.smartagency-ye.com';
const id='bc533f76-94d5-4c35-9df2-2f598f1e983b';
http.createServer(async(req,res)=>{if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}try{const url=new URL(req.url,'http://127.0.0.1:4100');const locale=url.searchParams.get('locale')||'ar';const product={id,name:locale==='ar'?'إطار اختبار معزول':'Isolated test tire',slug:'qa-tire',shortDescription:'Isolated browser regression fixture',description:'Isolated browser regression fixture',mainImage:{id:'qa-image',url:'/images/hero/hero-warehouse.webp'},primaryCategory:{name:'Tires',slug:'tires'},indexable:false};let data;
if(/^\/api\/v1\/public\/products(?:\/featured)?$/.test(url.pathname)) data={data:[product],meta:{page:1,limit:12,total:1,totalPages:1}};
else if(url.pathname==='/api/v1/public/products/qa-tire')data={data:product};
if(data){res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify(data));return;}
const response=await fetch(upstream+req.url,{signal:AbortSignal.timeout(20000)});console.log(response.status,req.url);res.writeHead(response.status,{'content-type':'application/json'});res.end(Buffer.from(await response.arrayBuffer()));}catch(e){console.log('proxy error',req.url,e.message);res.writeHead(502,{'content-type':'application/json'});res.end('{}');}}).listen(4100,'127.0.0.1',()=>console.log('Isolated read-only fixture proxy: 4100'));
