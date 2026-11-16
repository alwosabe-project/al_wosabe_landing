'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useQuoteCart } from './QuoteCart';
import type { Locale } from '@/lib/locales';
import { publicApiOrigin, trackEvent } from '@/lib/marketing';

const cities = ['صنعاء', 'الحديدة', 'المكلا', 'باجل', 'زبيد', 'عدن', 'تعز'];
const citiesEn = ["Sana'a", 'Hodeidah', 'Mukalla', 'Bajel', 'Zabid', 'Aden', 'Taiz'];
const inputClass = 'mt-2 min-h-12 w-full rounded-xl border border-steel-300 bg-white px-4 py-3 text-ink-900 focus:outline-brand';
const initial = { name: '', phone: '', email: '', city: '', company: '', message: '' };
type ResolvedProduct = { productId: string; available: boolean; name: string; image: string };
export function QuoteCheckout({ locale }: { locale: Locale }) {
  const ar = locale === 'ar';
  const cart = useQuoteCart();
  const [form, setForm] = useState(initial), [busy, setBusy] = useState(false), [error, setError] = useState(''), [reference, setReference] = useState('');
  const pending = useRef<{ fingerprint: string; requestId: string } | null>(null), submitting = useRef(false);
  const productIds = cart.items.map(item => item.productId).sort().join(',');
  const [refresh, setRefresh] = useState(0);
  const productKey = `${locale}:${productIds}:${refresh}`;
  const [resolved, setResolved] = useState<{ key: string; rows: ResolvedProduct[]; failed: boolean }>({ key: '', rows: [], failed: false });
  const checking = Boolean(productIds) && resolved.key !== productKey;
  const unavailable = resolved.key === productKey && (resolved.failed || resolved.rows.some(item => !item.available));
  useEffect(() => {
    if (!productIds) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    let active = true;
    fetch(`${publicApiOrigin}/api/v1/public/quote-requests/cart-products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit', signal: controller.signal, body: JSON.stringify({ productIds: productIds.split(','), locale }) })
      .then(async response => { if (!response.ok) throw new Error('Unavailable'); return response.json(); })
      .then(result => { if (active) setResolved({ key: productKey, rows: result.data, failed: false }); })
      .catch(() => { if (active) setResolved({ key: productKey, rows: [], failed: true }); })
      .finally(() => window.clearTimeout(timeout));
    return () => { active = false; window.clearTimeout(timeout); controller.abort(); };
  }, [locale, productIds, productKey]);
  const currentProduct = (id: string) => resolved.key === productKey ? resolved.rows.find(row => row.productId === id) : undefined;
  const change = (field: keyof typeof initial, value: string) => { setForm(current => ({ ...current, [field]: value })); setError(''); };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !cart.items.length || checking || unavailable) return;
    submitting.current = true; setBusy(true); setError('');
    const submitted = cart.items.map(item => ({ ...item }));
    try {
      const payload = { ...form, name: form.name.trim(), phone: form.phone.trim(), company: form.company.trim(), message: form.message.trim(), email: form.email.trim() || undefined, locale, sourcePath: `/${locale}/quote-cart`, items: submitted.map(({ productId, quantity }) => ({ productId, quantity })), website: new FormData(event.currentTarget).get('website') || '' };
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)));
      const fingerprint = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
      // Only a hash and random identifier are persisted, never contact details.
      if (!pending.current) {
        try {
          const saved = JSON.parse(sessionStorage.getItem('aw-quote-pending') || 'null');
          if (saved?.fingerprint === fingerprint && /^[0-9a-f-]{36}$/i.test(saved?.requestId || '')) pending.current = saved;
        } catch { /* In-memory retries remain available if storage is blocked. */ }
      }
      if (pending.current?.fingerprint !== fingerprint) pending.current = { fingerprint, requestId: crypto.randomUUID() };
      try { sessionStorage.setItem('aw-quote-pending', JSON.stringify(pending.current)); } catch { /* Storage is optional. */ }
      const response = await fetch(`${publicApiOrigin}/api/v1/public/quote-requests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit', signal: AbortSignal.timeout(30000), body: JSON.stringify({ ...payload, requestId: pending.current!.requestId }) });
      const result = await response.json();
      if (!response.ok || !result.data?.id) {
        if (response.status === 400) throw new Error(ar ? 'تحقق من بيانات التواصل وتوفر المنتجات. يمكنك إزالة المنتج غير المتاح والمحاولة مجددًا.' : 'Check contact details and product availability. Remove unavailable products and try again.');
        if (response.status === 429) throw new Error(ar ? 'طلبات كثيرة. انتظر دقيقة ثم حاول مجددًا.' : 'Too many requests. Wait a minute and retry.');
        throw new Error(ar ? 'تعذر تأكيد حفظ الطلب. أعد المحاولة؛ سنستخدم رقم المحاولة نفسه.' : 'Unable to confirm your request. Please retry.');
      }
      cart.consume(submitted); setReference(result.data.reference || result.data.id); setForm(initial); pending.current = null;
      try { sessionStorage.removeItem('aw-quote-pending'); } catch { /* Storage is optional. */ }
      trackEvent('generate_lead', { eventId: result.data.eventId });
    } catch (cause) { setError(cause instanceof TypeError || cause instanceof DOMException ? (ar ? 'تعذر تأكيد استلام الطلب بسبب الاتصال. أعد المحاولة؛ لن يتكرر الطلب عند استخدام المحاولة نفسها.' : 'Unable to confirm receipt due to a connection problem. Please retry; the same attempt will not create another request.') : cause instanceof Error ? cause.message : (ar ? 'تعذر الإرسال. بيانات النموذج والسلة محفوظة في الصفحة.' : 'Unable to send. Your form and cart are preserved on this page.')); }
    finally { submitting.current = false; setBusy(false); }
  }
  if (reference) return <section className="rounded-2xl border border-green-300 bg-green-50 p-8" role="status"><h2 className="text-2xl font-bold">{ar ? 'تم استلام طلب عرض السعر' : 'Quote request received'}</h2><p className="mt-4">{ar ? 'رقم الطلب:' : 'Reference:'} <strong dir="ltr">{reference}</strong></p><p className="mt-3">{ar ? 'سيتواصل معك فريقنا لمتابعة طلبك.' : 'Our team will contact you to follow up.'}</p><Link className="mt-6 inline-block font-bold text-brand-ember underline" href={`/${locale}/products`}>{ar ? 'متابعة تصفح المنتجات' : 'Continue browsing'}</Link><button className="ms-6 underline" onClick={() => setReference('')}>{ar ? 'العودة للسلة' : 'Back to cart'}</button></section>;
  if (!cart.items.length) return <section className="rounded-2xl border border-steel-200 p-8 text-center"><p className="text-xl">{ar ? 'سلة عرض السعر فارغة.' : 'Your quote cart is empty.'}</p><Link href={`/${locale}/products`} className="mt-6 inline-block rounded-xl bg-brand px-6 py-3 font-bold">{ar ? 'استعرض المنتجات وأضفها للسلة' : 'Browse products and add to cart'}</Link></section>;
  return <div className="grid gap-8 lg:grid-cols-2"><section aria-label={ar ? 'المنتجات المختارة' : 'Selected products'} className="space-y-4">{cart.items.map(item => <article key={item.productId} className="flex flex-wrap items-center gap-4 rounded-2xl border border-steel-200 bg-white p-5">{item.image && /^(https?:\/\/|\/)/.test(item.image) && <Image unoptimized width={80} height={80} src={currentProduct(item.productId)?.image || item.image} alt="" className="h-20 w-20 rounded-lg object-contain" />}<div className="min-w-0 flex-1"><h2 className="font-bold">{currentProduct(item.productId)?.name || (typeof item.names[locale] === 'string' ? item.names[locale] : item.name)}</h2>{currentProduct(item.productId)?.available === false && <p className="mt-2 text-sm text-red-700">{ar ? 'هذا المنتج غير متاح حاليًا. احذفه لإرسال بقية الطلب.' : 'This product is unavailable. Remove it to submit the remaining items.'}</p>}<label className="mt-3 block text-sm">{ar ? 'الكمية' : 'Quantity'}<input className="ms-3 w-28 rounded-lg border p-2" type="number" min={1} max={99999} step={1} value={item.quantity} disabled={busy} onChange={e => cart.quantity(item.productId, Number(e.target.value))} /></label></div><button type="button" disabled={busy} className="rounded-lg p-2 text-red-700 underline" onClick={() => cart.remove(item.productId)}>{ar ? 'حذف' : 'Remove'}</button></article>)}<Link className="inline-block font-bold text-brand-ember underline" href={`/${locale}/products`}>{ar ? 'إضافة منتجات أخرى' : 'Add more products'}</Link></section>
    <form onSubmit={submit} className="rounded-2xl border border-steel-200 bg-sand-50 p-6"><h2 className="mb-6 text-2xl font-bold">{ar ? 'بيانات طلب عرض السعر' : 'Quote request details'}</h2><div role="status" className="mb-4 text-sm">{checking && (ar ? 'جارٍ التحقق من المنتجات…' : 'Checking products…')}{resolved.key === productKey && resolved.failed && <p className="text-red-700">{ar ? 'تعذر التحقق من المنتجات.' : 'Unable to check products.'} <button type="button" className="underline" onClick={() => setRefresh(value => value + 1)}>{ar ? 'إعادة المحاولة' : 'Retry'}</button></p>}</div><fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2"><label className="hidden" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <label>{ar ? 'الاسم *' : 'Name *'}<input className={inputClass} required minLength={2} maxLength={120} autoComplete="name" value={form.name} onChange={e => change('name', e.target.value)} /></label>
      <label>{ar ? 'رقم الهاتف *' : 'Phone *'}<input className={inputClass} type="tel" dir="ltr" required pattern={"\\+?[0-9 \\(\\)\\-]{7,30}"} maxLength={30} autoComplete="tel" value={form.phone} onChange={e => change('phone', e.target.value)} /></label>
      <label>{ar ? 'المدينة *' : 'City *'}<select className={inputClass} required value={form.city} onChange={e => change('city', e.target.value)}><option value="">{ar ? 'اختر المدينة' : 'Select city'}</option>{cities.map((city, i) => <option key={city} value={city}>{ar ? city : citiesEn[i]}</option>)}</select></label>
      <label>{ar ? 'الشركة أو المحل (اختياري)' : 'Company / shop (optional)'}<input className={inputClass} maxLength={160} autoComplete="organization" value={form.company} onChange={e => change('company', e.target.value)} /></label>
      <label className="sm:col-span-2">{ar ? 'البريد الإلكتروني (اختياري)' : 'Email (optional)'}<input className={inputClass} type="email" dir="ltr" maxLength={254} autoComplete="email" value={form.email} onChange={e => change('email', e.target.value)} /></label>
      <label className="sm:col-span-2">{ar ? 'ملاحظة (اختيارية)' : 'Note (optional)'}<textarea className={inputClass} rows={4} maxLength={2000} value={form.message} onChange={e => change('message', e.target.value)} /></label>
      {error && <p role="alert" className="text-red-700 sm:col-span-2">{error}</p>}<button className="min-h-12 rounded-xl bg-brand px-6 py-3 font-bold text-ink-950 disabled:opacity-60 sm:col-span-2" type="submit" disabled={busy || checking || unavailable}>{busy ? (ar ? 'جارٍ إرسال الطلب…' : 'Sending…') : (ar ? 'إرسال طلب عرض السعر' : 'Send quote request')}</button>
    </fieldset></form></div>;
}
