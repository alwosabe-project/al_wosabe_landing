import { requireTool, reportDirectory, chromeExecutable } from './tooling.mjs';
const { chromium } = requireTool('playwright');
const AxeBuilder = requireTool('@axe-core/playwright').default;
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.argv[2]||'http://127.0.0.1:3100';
const dir=`${reportDirectory}/regression`;await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:chromeExecutable,headless:true});
const results=[];const check=async(name,fn)=>{try{const detail=await fn();results.push({name,pass:true,detail});console.log('PASS',name);}catch(e){results.push({name,pass:false,error:e.stack});console.log('FAIL',name,e.message);}};
for(const locale of ['ar','en'])for(const width of [390,1440]){
 await check(`SSR without JS ${locale} ${width}`,async()=>{const context=await browser.newContext({viewport:{width,height:900},javaScriptEnabled:false});try{const p=await context.newPage();const response=await p.goto(`${base}/${locale}`);assert.equal(response.status(),200);assert.equal(await p.locator('h1').count(),1);assert(await p.locator('h1').isVisible());assert(await p.locator('#home a[href="#quote"]').isVisible());assert((await p.locator('main').innerText()).length>3000);assert(await p.locator('#quote').isVisible());assert(await p.locator('html').getAttribute('dir')===(locale==='ar'?'rtl':'ltr'));await p.screenshot({path:`${dir}/ssr-${locale}-${width}.png`});return {h1:await p.locator('h1').innerText(),textLength:(await p.locator('main').innerText()).length};}finally{await context.close();}});
}
for(const locale of ['ar','en']){
 await check(`UI, accessibility, cart and consent ${locale}`,async()=>{
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const p=await context.newPage();const errors=[],failed=[],sdk=[],posts=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)failed.push({url:r.url(),status:r.status()});});
  await context.route(/https:\/\/(www\.googletagmanager\.com|connect\.facebook\.net|analytics\.tiktok\.com|sc-static\.net|snap\.licdn\.com|s\.pinimg\.com)\//,async route=>{sdk.push(route.request().url());await route.fulfill({contentType:'application/javascript',body:''});});
  await context.route('**/api/v1/public/marketing/{events,consent}',route=>route.fulfill({json:{data:{ok:true}},headers:{'access-control-allow-origin':'*'}}));
  await context.route('**/api/v1/public/quote-requests**',async route=>{
   const req=route.request();const headers={'access-control-allow-origin':'*','access-control-allow-headers':'content-type','access-control-allow-methods':'POST, OPTIONS'};
   if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});
   const body=req.postDataJSON();
   if(req.url().includes('/cart-products'))return route.fulfill({json:{data:body.productIds.map(id=>({productId:id,available:true,name:'QA product',image:''}))},headers});
   posts.push(body);return route.fulfill({json:{data:{id:'qa-local-only',reference:'QA-LOCAL-001',eventId:'b91879b0-4eb9-42c0-9834-ff3c96b3e754'}},headers});
  });
  try{
   await p.goto(`${base}/${locale}`,{waitUntil:'networkidle'});await p.waitForTimeout(500);
   assert.equal(sdk.length,0,'No SDK before consent');
   await p.getByRole('button',{name:locale==='ar'?'رفض الاختياري':'Reject optional',exact:true}).click();
   await p.waitForTimeout(150);assert.equal(sdk.length,0,'No SDK after rejection');
   const a11y=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']).analyze();
   await fs.writeFile(`${dir}/axe-${locale}.json`,JSON.stringify(a11y.violations,null,2));
   assert.equal(a11y.violations.length,0,JSON.stringify(a11y.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))));
   const menu=p.locator('button[aria-controls="mobile-navigation"]');await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'true');await p.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false');
   await p.locator('#home a[href="#quote"]').click();await p.waitForTimeout(100);assert(await p.locator('#quote').isVisible());
   assert(await p.locator('a[href^="https://wa.me/"]').count()>0);
   await p.locator('#distribution').scrollIntoViewIfNeeded();await p.locator('#distribution button').first().focus();await p.keyboard.press('Enter');assert(await p.locator('#distribution a[href^="tel:"]').count()>0);assert.equal(await p.locator('#distribution animateMotion').count(),0);
   await p.locator('#branches button').first().click();assert(await p.getByRole('dialog').isVisible());await p.keyboard.press('Escape');assert.equal(await p.getByRole('dialog').count(),0);
   await p.screenshot({path:`${dir}/ui-${locale}.png`,fullPage:true});
   await p.goto(`${base}/${locale}/products`,{waitUntil:'networkidle'});
   const add=p.getByRole('button',{name:locale==='ar'?'أضف لطلب عرض سعر':'Add to quote',exact:true}).first();assert(await add.count()>0,'Catalog has products');await add.click();await p.goto(`${base}/${locale}/quote-cart`,{waitUntil:'networkidle'});
   const quantity=p.locator('input[type="number"]').first();await quantity.fill('3');await quantity.blur();assert.equal(JSON.parse(await p.evaluate(()=>localStorage.getItem('aw-quote-cart-v1')))[0].quantity,3);
   await p.getByLabel(locale==='ar'?'الاسم *':'Name *',{exact:true}).fill('Performance QA');await p.getByLabel(locale==='ar'?'رقم الهاتف *':'Phone *',{exact:true}).fill('+967700000000');await p.locator('form select').selectOption({index:1});
   await p.getByRole('button',{name:locale==='ar'?'إرسال طلب عرض السعر':'Send quote request',exact:true}).click();await p.getByText('QA-LOCAL-001',{exact:true}).waitFor();assert.equal(posts.length,1);assert.equal(posts[0].items[0].quantity,3);assert.equal(JSON.parse(await p.evaluate(()=>localStorage.getItem('aw-quote-cart-v1'))).length,0);
   await p.getByRole('button',{name:locale==='ar'?'إعدادات الخصوصية':'Privacy settings',exact:true}).click();await p.getByRole('button',{name:locale==='ar'?'قبول الكل':'Accept all',exact:true}).click();await p.waitForTimeout(500);const consent=JSON.parse(await p.evaluate(()=>localStorage.getItem('aw-consent-v1')));assert(consent.analytics&&consent.ads);
   assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
   return {a11yViolations:a11y.violations.length,mockedQuoteSubmissions:posts.length,sdkAfterConsent:sdk.length,errors,failed};
  }finally{await context.close();}
 });
}
await browser.close();await fs.writeFile(`${dir}/summary.json`,JSON.stringify(results,null,2));if(results.some(r=>!r.pass))process.exitCode=1;
