'use client';
import Link from 'next/link';
import { ShoppingBag, Check } from 'lucide-react';
import { useMemo, useState, useSyncExternalStore } from 'react';
import type { Locale } from '@/lib/locales';
import type { Product, ProductVariant } from '@/lib/api';

import {cartKey,consumeCart,parseCart,selectCartVariant,type CartItem} from '@/lib/quote-cart';
export type {CartItem} from '@/lib/quote-cart';
export {cartKey} from '@/lib/quote-cart';
const KEY='aw-quote-cart-v2',LEGACY_KEY='aw-quote-cart-v1';
let memory = '';
let memoryOnly = false;
const listeners = new Set<() => void>();
function snapshot() {
  try { return memoryOnly ? memory : localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY) ?? ''; } catch { return memory; }
}
const parse=parseCart;
function write(rows: CartItem[]) {
  memory = JSON.stringify(rows);
  try { localStorage.setItem(KEY, memory); } catch { memoryOnly = true; }
  listeners.forEach(listener => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  try {if(!memoryOnly&&localStorage.getItem(KEY)===null&&localStorage.getItem(LEGACY_KEY)!==null)write(parse(localStorage.getItem(LEGACY_KEY)||''));} catch {}
  const sync = (event: StorageEvent) => { if (event.key === KEY || event.key === LEGACY_KEY || event.key === null) listener(); };
  window.addEventListener('storage', sync);
  return () => { listeners.delete(listener); window.removeEventListener('storage', sync); };
}
export function useQuoteCart() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => '');
  const items = useMemo(() => parse(raw), [raw]);
  return {
    items,
    add(product: Product, locale: Locale, variant:ProductVariant) {
      const rows = parse(snapshot());
      const item = rows.find(row => cartKey(row) === cartKey({productId:product.id,variantId:variant.id}));
      if (item) { item.quantity = Math.min(99999, item.quantity + 1); item.names[locale] = product.name; }
      else {
        if (rows.length >= 50) return false;
        rows.push({ productId: product.id, variantId:variant.id,sku:variant.sku,options:variant.options,unit:variant.unit, quantity: 1, name: product.name, names: { [locale]: product.name }, image: variant.image?.url || product.mainImage?.url || '' });
      }
      write(rows); return true;
    },
    quantity(key: string, quantity: number) {
      if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 99999) write(parse(snapshot()).map(row => cartKey(row) === key ? { ...row, quantity } : row));
    },
    remove(key: string) { write(parse(snapshot()).filter(row => cartKey(row) !== key)); },
    select(key:string,variant:ProductVariant){write(selectCartVariant(parse(snapshot()),key,variant));},
    consume(submitted: CartItem[]) {
      // Keep quantities added in another tab while this request was in flight.
      write(consumeCart(parse(snapshot()),submitted));
    },
  };
}
export function CartLink({ locale }: { locale: Locale }) {
  const { items } = useQuoteCart();
  return <Link href={`/${locale}/quote-cart`} className="focus-ring flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-white/20 px-3 text-white"><ShoppingBag size={19} aria-hidden="true" /><span className="sr-only">{locale === 'ar' ? 'سلة عرض السعر' : 'Quote cart'} </span><span>{items.length}</span></Link>;
}
export function AddToQuote({ product, locale,variant:selection }: { product: Product; locale: Locale;variant?:ProductVariant|null }) {
  const cart=useQuoteCart();
  const [added,setAdded]=useState(false),[error,setError]=useState(false);
  const variant=selection===undefined?(product.variants?.length===1?product.variants[0]:null):selection;
  if(!variant)return <Link className="inline-flex min-h-11 items-center rounded-xl bg-brand px-5 py-3 font-bold text-ink-950" href={`/${locale}/products/${encodeURIComponent(product.slug)}`}>{locale==='ar'?'اختر الصنف لطلب عرض السعر':'Choose a variant to request a quote'}</Link>;
  return <div><button type="button" className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-bold text-ink-950" onClick={()=>{const ok=cart.add(product,locale,variant);setAdded(ok);setError(!ok);}}>{added?<Check size={18}/>:<ShoppingBag size={18}/>} {added?(locale==='ar'?'أُضيف — أضف كمية أخرى':'Added — add another'):(locale==='ar'?'أضف لطلب عرض سعر':'Add to quote')} <span dir="ltr">{variant.sku}</span></button><span role="status" className="mt-2 block text-sm">{error?(locale==='ar'?'الحد الأقصى 50 صنفًا في الطلب.':'Maximum 50 variants per request.'):added?<Link className="underline" href={`/${locale}/quote-cart`}>{locale==='ar'?'عرض السلة وإرسال الطلب':'Review cart and send request'}</Link>:null}</span></div>;
}
export function resolveLegacyCart(rows:Array<{productId:string;available:boolean;variantId?:string|null;sku?:string;options?:Record<string,string|number|boolean>;unit?:string}>) {
  let current=parse(snapshot()),changed=false;
  for(const row of rows)if(row.available&&row.variantId){const old=current.find(i=>i.productId===row.productId&&!i.variantId);if(old){current=selectCartVariant(current,cartKey(old),{id:row.variantId,sku:row.sku||'',options:row.options||{},unit:row.unit||'piece'});changed=true;}}
  if(changed)write(current);
}
