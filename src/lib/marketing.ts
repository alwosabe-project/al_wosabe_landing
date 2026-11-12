'use client';

export const eventNames=['page_view','view_item_list','select_item','view_item','search','view_content','contact_intent','quote_whatsapp_open','generate_lead'] as const;
export type EventName=typeof eventNames[number];
export type Provider='gtm'|'ga4'|'google_ads'|'meta'|'tiktok'|'snapchat'|'linkedin'|'pinterest';
export type Consent={analytics:boolean;ads:boolean;version:1};
export const publicApiOrigin=process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000';
export interface Integration {enabled:boolean;mode:'browser'|'server'|'both';environment:'production'|'test';publicConfig:Record<string,string|boolean>}
export interface EventRule {provider:Provider;eventName:EventName;browserEnabled:boolean;serverEnabled:boolean;conversionLabel?:string;conversionId?:string}
export interface MarketingConfig {consent:{version:1;analyticsDefault:false;adsDefault:false};providers:Partial<Record<Provider,Integration>>;eventRules:EventRule[]}
type TagFunction=((...args:unknown[])=>void)&{q?:unknown[][];queue?:unknown[][];push?:(args:unknown[])=>void;loaded?:boolean;version?:string;callMethod?:(...args:unknown[])=>void;handleRequest?:(...args:unknown[])=>void};
type VendorWindow=Window&{dataLayer?:unknown[];gtag?:TagFunction;fbq?:TagFunction;_fbq?:TagFunction;TiktokAnalyticsObject?:string;ttq?:Record<string,unknown>;snaptr?:TagFunction;lintrk?:TagFunction;_linkedin_partner_id?:string;_linkedin_data_partner_ids?:string[];pintrk?:TagFunction};
let activeConfig:MarketingConfig|null=null;
let consent:Consent={analytics:false,ads:false,version:1};
let ready=false;
let memoryClientId:string|undefined;
const pending:Array<{name:EventName;payload:{contentId?:string;eventId:string};path:string}>=[];
const scripts=new Map<string,Promise<void>>();
const initialized=new Set<Provider>();
const sent=new Set<string>();
const vendor=()=>window as VendorWindow;
const preview=()=>/\/(?:blog\/preview|admin)(?:\/|$)/.test(window.location.pathname);
export function publicPath() { return /^\/(ar|en)(\/|$)/.test(location.pathname)&&!preview()&&![...new URLSearchParams(location.search).keys()].some(k=>/^(search|token|email|phone|name)$/i.test(k)); }
function canUse(provider:Provider) { return provider==='ga4'?consent.analytics:provider==='gtm'?(consent.analytics||consent.ads):consent.ads; }
export function readConsent():Consent|null {
  try { const saved=JSON.parse(localStorage.getItem('aw-consent-v1')||'null');return saved?.version===1&&typeof saved.analytics==='boolean'&&typeof saved.ads==='boolean'?{analytics:saved.analytics,ads:saved.ads,version:1}:null; } catch { return null; }
}
export function configureMarketing(config:MarketingConfig) { activeConfig=config; }
function load(src:string):Promise<void> {
  const existing=scripts.get(src);if(existing)return existing;
  const promise=new Promise<void>((resolve,reject)=>{const script=document.createElement('script');const timer=setTimeout(()=>reject(new Error('Tag unavailable')),8000);script.async=true;script.src=src;script.referrerPolicy='no-referrer';script.onload=()=>{clearTimeout(timer);resolve();};script.onerror=()=>{clearTimeout(timer);reject(new Error('Tag unavailable'));};document.head.appendChild(script);});
  scripts.set(src,promise);return promise;
}
function googleTag() {
  const w=vendor();w.dataLayer=w.dataLayer||[];
  if(!w.gtag)w.gtag=function(){w.dataLayer!.push(arguments);};
  return w.gtag;
}
function googleConsent(command:'default'|'update') { googleTag()('consent',command,{analytics_storage:consent.analytics?'granted':'denied',ad_storage:consent.ads?'granted':'denied',ad_user_data:consent.ads?'granted':'denied',ad_personalization:consent.ads?'granted':'denied'}); }
function clientId(create=true) {
  try { let value=localStorage.getItem('aw-marketing-client-v1');if(value&&!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value))value=null;if(!value&&create){value=crypto.randomUUID();localStorage.setItem('aw-marketing-client-v1',value);}return value||memoryClientId; } catch {if(create)memoryClientId=memoryClientId||crypto.randomUUID();return memoryClientId;}
}
export async function applyConsent(next:Consent,persist=false) {
  const previous=consent,previousClient=clientId(false);consent=next;ready=false;
  if(persist){
    try{localStorage.setItem('aw-consent-v1',JSON.stringify({...next,updatedAt:new Date().toISOString()}));}catch{/* Storage is optional. */}
    if(previousClient){
      try{await fetch(`${publicApiOrigin}/api/v1/public/marketing/consent`,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',body:JSON.stringify({clientId:previousClient,consent:next}),signal:AbortSignal.timeout(5000),referrerPolicy:'no-referrer'});}catch{/* The local choice applies even when the API is unavailable. */}
    }
    if(!next.analytics&&!next.ads){pending.length=0;memoryClientId=undefined;try{localStorage.removeItem('aw-marketing-client-v1');}catch{/* Storage is optional. */}}
  }
  if(!publicPath())return;
  googleConsent(initialized.size?'update':'default');
  if(initialized.has('meta'))vendor().fbq?.('consent',next.ads?'grant':'revoke');
  // Start a new document after changing an active SDK's consent, including a new
  // destination grant. This removes old listeners and gives every newly allowed
  // destination a real page navigation without replaying analytics in-place.
  if(persist&&(previous.analytics||previous.ads)&&(previous.analytics!==next.analytics||previous.ads!==next.ads)){location.reload();return;}
  await initializeTags();
  ready=true;
  for(const event of pending.splice(0))if(event.path===location.pathname)trackEvent(event.name,event.payload);
}
async function initializeTags() {
  if(!activeConfig||!publicPath())return;
  const tasks=Object.entries(activeConfig.providers).map(async([key,integration])=>{
    const provider=key as Provider;if(!integration?.enabled||integration.environment!=='production'||integration.mode==='server'||!canUse(provider)||initialized.has(provider))return;
    const c:Record<string,string>=Object.fromEntries(Object.entries(integration.publicConfig).map(([key,value])=>[key,typeof value==='string'?value:''])),w=vendor();
    if((provider==='ga4'||provider==='google_ads')&&c.googleMode==='gtm')return;
    initialized.add(provider);
    try {
      switch(provider){
        case 'gtm':w.dataLayer=w.dataLayer||[];w.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});await load(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(c.containerId)}`);break;
        case 'ga4':case 'google_ads':{
          const tag=googleTag(),id=provider==='ga4'?c.measurementId:c.conversionId;
          tag('js',new Date());tag('config',id,{send_page_view:false,...(provider==='ga4'?{client_id:clientId()}:{}),allow_ad_personalization_signals:consent.ads});
          // One Google library serves both destinations.
          const existing=[...scripts.keys()].some(url=>url.startsWith('https://www.googletagmanager.com/gtag/js'));
          if(!existing)await load(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);break;
        }
        case 'meta':{
          if(!w.fbq){const f:TagFunction=function(...args){if(f.callMethod)f.callMethod(...args);else f.queue!.push(args);};f.queue=[];f.loaded=true;f.version='2.0';w.fbq=f;w._fbq=f;}
          w.fbq('consent','grant');w.fbq('set','autoConfig',false,c.pixelId);w.fbq('init',c.pixelId);await load('https://connect.facebook.net/en_US/fbevents.js');break;
        }
        case 'tiktok':{
          // The official deferred API is an array with methods queued before SDK load.
          w.TiktokAnalyticsObject='ttq';const ttq=(w.ttq||[]) as unknown as Record<string,unknown>&unknown[];w.ttq=ttq;
          const methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];ttq.methods=methods;
          for(const method of methods)if(!ttq[method])ttq[method]=(...args:unknown[])=>ttq.push([method,...args]);
          ttq._i=ttq._i||{};(ttq._i as Record<string,unknown>)[c.pixelId]=[];ttq._t=ttq._t||{};(ttq._t as Record<string,unknown>)[c.pixelId]=Date.now();ttq._o=ttq._o||{};(ttq._o as Record<string,unknown>)[c.pixelId]={historyObserver:false};
          ((ttq._i as Record<string,unknown>)[c.pixelId] as unknown as Record<string,unknown>)._u='https://analytics.tiktok.com/i18n/pixel/events.js';
          ttq.instance=(id:string)=>{const instances=ttq._i as Record<string,unknown[]>;const queue=instances[id]||[];for(const method of methods)(queue as unknown as Record<string,unknown>)[method]=(...args:unknown[])=>queue.push([method,...args]);return queue;};
          await load(`https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(c.pixelId)}&lib=ttq`);break;
        }
        case 'snapchat':{
          if(!w.snaptr){const f:TagFunction=function(...args){if(f.handleRequest)(f.handleRequest as TagFunction)(...args);else f.queue!.push(args);};f.queue=[];w.snaptr=f;}
          w.snaptr('init',c.pixelId);await load('https://sc-static.net/scevent.min.js');break;
        }
        case 'linkedin':{
          w._linkedin_partner_id=c.partnerId;w._linkedin_data_partner_ids=w._linkedin_data_partner_ids||[];w._linkedin_data_partner_ids.push(c.partnerId);
          if(!w.lintrk){const f:TagFunction=(...args)=>f.q!.push(args);f.q=[];w.lintrk=f;}await load('https://snap.licdn.com/li.lms-analytics/insight.min.js');break;
        }
        case 'pinterest':{
          if(!w.pintrk){const f:TagFunction=(...args)=>f.queue!.push(args);f.queue=[];f.version='3.0';w.pintrk=f;}w.pintrk('load',c.tagId);await load('https://s.pinimg.com/ct/core.js');break;
        }
      }
    }catch{initialized.delete(provider);/* A blocked platform must not break the site. */}
  });await Promise.allSettled(tasks);
}
const metaEvents:Partial<Record<EventName,string>>={page_view:'PageView',select_item:'ViewContent',view_item:'ViewContent',view_content:'ViewContent',view_item_list:'ViewContent',search:'Search',contact_intent:'Contact',quote_whatsapp_open:'Contact',generate_lead:'Lead'};
const tiktokEvents:Partial<Record<EventName,string>>={page_view:'Pageview',select_item:'ViewContent',view_item:'ViewContent',view_content:'ViewContent',view_item_list:'ViewContent',search:'Search',contact_intent:'Contact',quote_whatsapp_open:'Contact',generate_lead:'Lead'};
const snapEvents:Partial<Record<EventName,string>>={page_view:'PAGE_VIEW',view_item:'VIEW_CONTENT',view_content:'VIEW_CONTENT',view_item_list:'LIST_VIEW',select_item:'CUSTOM_EVENT_1',search:'SEARCH',contact_intent:'CUSTOM_EVENT_2',quote_whatsapp_open:'CUSTOM_EVENT_3',generate_lead:'SIGN_UP'};
const pinterestEvents:Partial<Record<EventName,string>>={page_view:'pagevisit',select_item:'custom',view_item:'custom',view_content:'custom',view_item_list:'viewcategory',search:'search',contact_intent:'custom',quote_whatsapp_open:'custom',generate_lead:'lead'};
export function trackEvent(eventName:EventName,payload:{contentId?:string;eventId?:string}={}) {
  if(!activeConfig||!publicPath()||(!consent.analytics&&!consent.ads))return false;
  const eventId=payload.eventId||crypto.randomUUID();
  if(!ready){if(pending.some(event=>event.payload.eventId===eventId))return true;if(pending.length>=100)return false;pending.push({name:eventName,payload:{...payload,eventId},path:location.pathname});return true;}
  const key=`${eventName}:${eventId}`;if(sent.has(key))return false;sent.add(key);if(sent.size>1000)sent.delete(sent.values().next().value!);
  const w=vendor(),locale=location.pathname.startsWith('/en')?'en':'ar',sourcePath=location.pathname;
  // Explicit fields only: no search strings, names, phones, referrers or query URLs.
  const data={event_id:eventId,page_location:location.origin+sourcePath,page_title:document.title,language:locale,...(payload.contentId?{content_id:payload.contentId}: {})};
  for(const rule of activeConfig.eventRules){
    const integration=activeConfig.providers[rule.provider];if(rule.eventName!==eventName||!rule.browserEnabled||!integration?.enabled||integration.environment!=='production'||!initialized.has(rule.provider)||!canUse(rule.provider))continue;
    try{switch(rule.provider){
      case 'gtm':w.dataLayer?.push({event:eventName,...data,aw_consent:{...consent}});break;
      case 'ga4':if(integration.publicConfig.googleMode!=='gtm')w.gtag?.('event',eventName,{...data,send_to:integration.publicConfig.measurementId});break;
      case 'google_ads':if(integration.publicConfig.googleMode!=='gtm'&&rule.conversionLabel)w.gtag?.('event','conversion',{send_to:`${integration.publicConfig.conversionId}/${rule.conversionLabel}`,transaction_id:eventId});break;
      case 'meta':if(metaEvents[eventName])w.fbq?.('track',metaEvents[eventName],payload.contentId?{content_ids:[payload.contentId]}:{},{eventID:eventId});break;
      case 'tiktok':if(eventName==='page_view')(w.ttq?.page as TagFunction|undefined)?.();else if(tiktokEvents[eventName])(w.ttq?.track as TagFunction|undefined)?.(tiktokEvents[eventName],payload.contentId?{contents:[{content_id:payload.contentId}]}:{},{event_id:eventId});break;
      case 'snapchat':if(snapEvents[eventName])w.snaptr?.('track',snapEvents[eventName],{client_dedup_id:eventId,...(payload.contentId?{item_ids:[payload.contentId]}:{})});break;
      case 'linkedin':if(rule.conversionId)w.lintrk?.('track',{conversion_id:Number(rule.conversionId),event_id:eventId});break;
      case 'pinterest':if(pinterestEvents[eventName])w.pintrk?.('track',pinterestEvents[eventName],{event_id:eventId,...(pinterestEvents[eventName]==='custom'?{content_name:eventName}:{}),...(payload.contentId?{product_id:payload.contentId}:{})});break;
    }}catch{/* Isolate platform errors. */}
  }
  const server=activeConfig.eventRules.some(r=>r.eventName===eventName&&r.serverEnabled&&activeConfig!.providers[r.provider]?.enabled&&activeConfig!.providers[r.provider]?.environment==='production'&&canUse(r.provider));
  if(server)void fetch(`${publicApiOrigin}/api/v1/public/marketing/events`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({eventId,eventName,sourcePath,locale,contentId:payload.contentId,consent,clientId:clientId()}),keepalive:true,credentials:'omit',referrerPolicy:'no-referrer'}).catch(()=>{});
  return true;
}
