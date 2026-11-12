'use client';
import {useEffect,useRef} from 'react';
import {trackEvent,type EventName} from '@/lib/marketing';
export function ContentEvent({name,contentId,viewKey}:{name:EventName;contentId?:string;viewKey?:string}) {
  const fired=useRef('');
  useEffect(()=>{const emit=()=>{const key=`${name}:${contentId||location.pathname}:${viewKey||''}`;if(fired.current===key)return;if(trackEvent(name,{contentId}))fired.current=key;};emit();window.addEventListener('aw:marketing-ready',emit);return()=>window.removeEventListener('aw:marketing-ready',emit);},[name,contentId,viewKey]);
  return null;
}
