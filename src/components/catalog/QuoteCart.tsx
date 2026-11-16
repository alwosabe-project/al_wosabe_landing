'use client';
import Link from 'next/link';
import { ShoppingBag, Check } from 'lucide-react';
import { useMemo, useState, useSyncExternalStore } from 'react';
import type { Locale } from '@/lib/locales';
import type { Product } from '@/lib/api';

export type CartItem = { productId: string; quantity: number; name: string; image: string; names: Partial<Record<Locale, string>> };
const KEY = 'aw-quote-cart-v1';
let memory = '';
let memoryOnly = false;
const listeners = new Set<() => void>();
function snapshot() {
  try { return memoryOnly ? memory : localStorage.getItem(KEY) || ''; } catch { return memory; }
}
function parse(raw: string): CartItem[] {
  try {
    const rows: unknown = JSON.parse(raw || '[]');
    if (!Array.isArray(rows)) return [];
    const seen = new Set<string>();
    return rows.filter((row): row is CartItem => {
      if (!row || typeof row !== 'object' || !/^[0-9a-f-]{36}$/i.test(row.productId) || seen.has(row.productId) || !Number.isInteger(row.quantity) || row.quantity < 1 || row.quantity > 99999 || typeof row.name !== 'string' || row.name.length > 500 || typeof row.image !== 'string' || !row.names || typeof row.names !== 'object') return false;
      seen.add(row.productId); return true;
    }).slice(0, 50);
  } catch { return []; }
}
function write(rows: CartItem[]) {
  memory = JSON.stringify(rows);
  try { localStorage.setItem(KEY, memory); } catch { memoryOnly = true; }
  listeners.forEach(listener => listener());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  const sync = (event: StorageEvent) => { if (event.key === KEY || event.key === null) listener(); };
  window.addEventListener('storage', sync);
  return () => { listeners.delete(listener); window.removeEventListener('storage', sync); };
}
export function useQuoteCart() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => '');
  const items = useMemo(() => parse(raw), [raw]);
  return {
    items,
    add(product: Product, locale: Locale) {
      const rows = parse(snapshot());
      const item = rows.find(row => row.productId === product.id);
      if (item) { item.quantity = Math.min(99999, item.quantity + 1); item.names[locale] = product.name; }
      else {
        if (rows.length >= 50) return false;
        rows.push({ productId: product.id, quantity: 1, name: product.name, names: { [locale]: product.name }, image: product.mainImage?.url || '' });
      }
      write(rows); return true;
    },
    quantity(productId: string, quantity: number) {
      if (Number.isInteger(quantity) && quantity >= 1 && quantity <= 99999) write(parse(snapshot()).map(row => row.productId === productId ? { ...row, quantity } : row));
    },
    remove(productId: string) { write(parse(snapshot()).filter(row => row.productId !== productId)); },
    consume(submitted: CartItem[]) {
      // Keep quantities added in another tab while this request was in flight.
      write(parse(snapshot()).map(row => ({ ...row, quantity: row.quantity - (submitted.find(item => item.productId === row.productId)?.quantity || 0) })).filter(row => row.quantity > 0));
    },
  };
}
export function CartLink({ locale }: { locale: Locale }) {
  const { items } = useQuoteCart();
  return <Link href={`/${locale}/quote-cart`} className="focus-ring flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-white/20 px-3 text-white"><ShoppingBag size={19} aria-hidden="true" /><span className="sr-only">{locale === 'ar' ? 'سلة عرض السعر' : 'Quote cart'} </span><span>{items.length}</span></Link>;
}
export function AddToQuote({ product, locale }: { product: Product; locale: Locale }) {
  const cart = useQuoteCart();
  const [added, setAdded] = useState(false), [error, setError] = useState(false);
  return <div><button type="button" className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-bold text-ink-950" onClick={() => { const ok = cart.add(product, locale); setAdded(ok); setError(!ok); }}>{added ? <Check size={18} /> : <ShoppingBag size={18} />}{added ? (locale === 'ar' ? 'أُضيف — أضف كمية أخرى' : 'Added — add another') : (locale === 'ar' ? 'أضف لطلب عرض سعر' : 'Add to quote')}</button><span role="status" className="mt-2 block text-sm">{error ? (locale === 'ar' ? 'الحد الأقصى 50 منتجًا في الطلب.' : 'Maximum 50 products per request.') : added ? <Link className="underline" href={`/${locale}/quote-cart`}>{locale === 'ar' ? 'عرض السلة وإرسال الطلب' : 'Review cart and send request'}</Link> : null}</span></div>;
}
