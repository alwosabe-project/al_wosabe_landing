'use client';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {usePathname,useSearchParams} from 'next/navigation';
import {applyConsent,configureMarketing,publicPath,readConsent,trackEvent,type Consent,type MarketingConfig} from '@/lib/marketing';
import type {Locale} from '@/lib/locales';

export function PrivacySettingsButton({locale}:{locale:Locale}) { return <button type="button" className="text-sm underline underline-offset-4" onClick={()=>window.dispatchEvent(new Event('aw:privacy'))}>{locale==='ar'?'إعدادات الخصوصية':'Privacy settings'}</button>; }
let sessionConsent:Consent|null=null;
function currentConsent() { return readConsent()||sessionConsent; }
function consentSnapshot() { const saved=currentConsent(); return saved ? JSON.stringify(saved) : ''; }
function subscribeConsent(listener:()=>void) {
  const storage=(event:StorageEvent)=>{if(event.key==='aw-consent-v1'||event.key===null){sessionConsent=null;listener();}};
  window.addEventListener('storage',storage);window.addEventListener('aw:consent-saved',listener);
  return()=>{window.removeEventListener('storage',storage);window.removeEventListener('aw:consent-saved',listener);};
}
export function MarketingProvider({config,locale}:{config:MarketingConfig;locale:Locale}) {
  const pathname=usePathname(),searchParams=useSearchParams(),routeKey=`${pathname}?${searchParams.toString()}`;const previous=useRef('');const [open,setOpen]=useState(false),[custom,setCustom]=useState(false),[choice,setChoice]=useState<Consent>({analytics:false,ads:false,version:1});
  const consentValue=useSyncExternalStore(subscribeConsent,consentSnapshot,()=> 'pending');
  const isAr=locale==='ar',isPreview=pathname.includes('/blog/preview/');
  useEffect(()=>{
    if(isPreview)return;configureMarketing(config);const saved=currentConsent();
    let active=true;void applyConsent(saved||{analytics:false,ads:false,version:1}).then(()=>{if(active&&publicPath()){if(previous.current!==routeKey&&trackEvent('page_view'))previous.current=routeKey;window.dispatchEvent(new Event('aw:marketing-ready'));}});
    const privacy=()=>{setChoice(currentConsent()||{analytics:false,ads:false,version:1});setOpen(true);setCustom(true);};
    window.addEventListener('aw:privacy',privacy);
    // One delegated listener covers header, floating button, footer, product CTAs and cards.
    const click=(event:MouseEvent)=>{
      if(!(event.target instanceof Element))return;const anchor=event.target.closest('a');if(!anchor)return;
      const href=anchor.getAttribute('href')||'';
      // A preview must start a fresh document, without SDKs from a public page.
      let destination:URL;try{destination=new URL(anchor.href,location.href);}catch{return;}
      if(destination.origin===location.origin&&destination.pathname.includes('/blog/preview/')){event.preventDefault();event.stopImmediatePropagation();location.assign(destination.href);return;}
      if(!anchor.hasAttribute('data-quote-whatsapp')&&/^(?:tel:|mailto:|https:\/\/(?:wa\.me|api\.whatsapp\.com)\/)/i.test(href))trackEvent('contact_intent');
      const contentId=anchor.dataset.productId;if(contentId)trackEvent('select_item',{contentId});
    };
    const submit=(event:SubmitEvent)=>{if(event.target instanceof HTMLFormElement&&event.target.querySelector('[name="search"]'))trackEvent('search');};
    document.addEventListener('click',click,true);document.addEventListener('submit',submit);
    return()=>{active=false;window.removeEventListener('aw:privacy',privacy);document.removeEventListener('click',click,true);document.removeEventListener('submit',submit);};
  },[config,isPreview,pathname,routeKey,consentValue]);
  async function save(value:Consent){sessionConsent=value;setChoice(value);setOpen(false);await applyConsent(value,true);window.dispatchEvent(new Event('aw:consent-saved'));if(publicPath()){if(previous.current!==routeKey&&trackEvent('page_view'))previous.current=routeKey;window.dispatchEvent(new Event('aw:marketing-ready'));}}
  if(isPreview||(!open&&consentValue!==''))return null;
  return <section role="dialog" aria-modal="false" aria-labelledby="privacy-title" dir={isAr?'rtl':'ltr'} className="fixed bottom-4 start-4 end-4 z-[110] max-w-xl rounded-2xl border border-steel-200 bg-paper p-5 text-ink-900 shadow-2xl sm:end-auto">
    <h2 id="privacy-title" className="text-lg font-bold">{isAr?'اختيارات الخصوصية':'Privacy choices'}</h2>
    <p className="mt-2 text-sm leading-7">{isAr?'نستخدم التقنيات الضرورية لتشغيل الموقع. يمكنك اختيار التحليلات والإعلانات بشكل مستقل، وتغيير اختيارك من الفوتر. طلب عرض السعر يعمل مع رفض التتبع.':'Necessary technology runs the site. Choose analytics and advertising separately, and change your choice in the footer. Quote requests work when tracking is declined.'}</p>
    {custom&&<div className="my-3 grid gap-3"><label><input type="checkbox" checked disabled/> {isAr?'ضروري دائمًا':'Always necessary'}</label><label><input type="checkbox" checked={choice.analytics} onChange={e=>setChoice({...choice,analytics:e.target.checked})}/> {isAr?'التحليلات':'Analytics'}</label><label><input type="checkbox" checked={choice.ads} onChange={e=>setChoice({...choice,ads:e.target.checked})}/> {isAr?'الإعلانات':'Advertising'}</label></div>}
    <div className="mt-4 flex flex-wrap gap-3"><button type="button" className="rounded-lg bg-brand px-4 py-2 font-bold" onClick={()=>void save({analytics:true,ads:true,version:1})}>{isAr?'قبول الكل':'Accept all'}</button><button type="button" className="rounded-lg border px-4 py-2" onClick={()=>void save({analytics:false,ads:false,version:1})}>{isAr?'رفض الاختياري':'Reject optional'}</button><button type="button" className="rounded-lg border px-4 py-2" onClick={()=>custom?void save(choice):setCustom(true)}>{custom?(isAr?'حفظ اختياري':'Save choices'):(isAr?'تخصيص':'Customize')}</button></div>
  </section>;
}
