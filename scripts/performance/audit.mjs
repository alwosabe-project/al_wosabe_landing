import fs from 'node:fs/promises';
import path from 'node:path';
import { importTool, reportDirectory, chromeExecutable } from './tooling.mjs';
const { default: lighthouse } = await importTool('lighthouse');
const { launch } = await importTool('chrome-launcher');
const [base='https://alwosabifortrading.com',label='before',repeats='3']=process.argv.slice(2);
const dir=path.join(reportDirectory,label);await fs.mkdir(dir,{recursive:true});
const launchChrome=()=>launch({chromePath:chromeExecutable,chromeFlags:['--headless=new','--no-first-run','--disable-extensions','--disable-gpu']});
const summaries=[];
for(const route of (label==='stage1'||label==='stage2'?['/ar']:label==='before-root'?['/']:['/ar','/']))for(const mode of (label==='stage1'||label==='stage2'?['mobile']:['mobile','desktop']))for(let i=1;i<=Number(repeats);i++){
 const chrome=await launchChrome();
 let result;try {result=await lighthouse(base+route,{port:chrome.port,output:'html',logLevel:'error',...(mode==='desktop'?{formFactor:'desktop',screenEmulation:{mobile:false,width:1350,height:940,deviceScaleFactor:1,disabled:false},throttling:{rttMs:40,throughputKbps:10240,cpuSlowdownMultiplier:1}}:{} )});}finally{await chrome.kill();}
 const {lhr,artifacts}=result; const name=`${route==='/ar'?'ar':'root'}-${mode}-${i}`;
 await fs.writeFile(path.join(dir,name+'.html'),result.report);await fs.writeFile(path.join(dir,name+'.json'),JSON.stringify(lhr));
 if(i===1){if(artifacts.Trace)await fs.writeFile(path.join(dir,name+'.trace.json'),JSON.stringify(artifacts.Trace));if(artifacts.DevtoolsLog)await fs.writeFile(path.join(dir,name+'.devtools.json'),JSON.stringify(artifacts.DevtoolsLog));}
 const row={name,url:lhr.finalDisplayedUrl,version:lhr.lighthouseVersion,browser:lhr.environment.hostUserAgent,error:lhr.runtimeError,score:lhr.categories.performance.score,accessibility:lhr.categories.accessibility.score,seo:lhr.categories.seo.score,metrics:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','speed-index','total-blocking-time','cumulative-layout-shift','server-response-time'].map(k=>[k,{value:lhr.audits[k]?.numericValue,error:lhr.audits[k]?.errorMessage}])),failed:Object.entries(lhr.audits).filter(([,a])=>a.score===0).map(([id,a])=>({id,title:a.title,details:a.details}))};summaries.push(row);console.log(JSON.stringify({...row,failed:row.failed.map(x=>x.id)}));await fs.writeFile(path.join(dir,'summary.json'),JSON.stringify(summaries,null,2));
}
