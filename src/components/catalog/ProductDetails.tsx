'use client';
import {formatSpecification,formatUnit,formatVariantOptions} from '@/lib/catalog-format';
import Image from 'next/image';
import {useState} from 'react';
import type {Product} from '@/lib/api';
import type {Locale} from '@/lib/locales';
import {AddToQuote} from './QuoteCart';
export function ProductDetails({product,locale}:{product:Product;locale:Locale}) {
  const ar=locale==='ar',variants=product.variants||[],[selected,setSelected]=useState(variants.length===1?variants[0].id:'');
  const variant=variants.find(v=>v.id===selected),specs={...product.specifications,...variant?.options,...variant?.specifications},image=variant?.image||product.mainImage;
  const compatibilities=(product.compatibilities||[]).filter(c=>!c.variantId||c.variantId===selected);
  return <div className="grid gap-10 lg:grid-cols-2"><div><div className="relative aspect-square overflow-hidden rounded-3xl bg-sand-50">{image?<Image src={image.url} alt={product.name} fill priority sizes="(max-width:1024px) 100vw,600px" className="object-contain p-4"/>:<div className="grid h-full place-items-center">{ar?'لا توجد صورة':'No image'}</div>}</div><div className="mt-4 grid grid-cols-5 gap-3">{product.gallery?.map(g=><div key={g.id} className="relative aspect-square rounded-xl bg-sand-50"><Image src={g.media.url} alt={product.name} fill sizes="120px" className="object-contain"/></div>)}</div></div>
    <div className="space-y-6">{product.modelNumber&&<p>{ar?'الموديل:':'Model:'} <bdi dir="ltr">{product.modelNumber}</bdi></p>}
      {variants.length>1&&<label className="block font-bold">{ar?'اختر اللون / المقاس / الصنف':'Choose color / size / variant'}<select className="mt-2 min-h-12 w-full rounded-xl border p-3" value={selected} onChange={e=>setSelected(e.target.value)}><option value="">{ar?'اختر الصنف أولًا':'Select a variant first'}</option>{variants.map(v=><option key={v.id} value={v.id}>{formatVariantOptions(v.options,product.attributeDefinitions,locale)} — {v.sku}</option>)}</select></label>}
      {!!Object.keys(specs).length&&<table className="w-full text-start"><caption className="mb-3 text-start text-xl font-bold">{ar?'المواصفات':'Specifications'}</caption><tbody>{Object.entries(specs).map(([key,value])=>{const a=product.attributeDefinitions?.find(a=>a.key===key);return <tr key={key} className="border-b"><th className="p-3 text-start">{a?(ar?a.labelAr:a.labelEn):key}</th><td className="p-3"><bdi dir="auto">{formatSpecification(value,a,locale)}</bdi></td></tr>;})}</tbody></table>}
      {variant&&<p dir="ltr">SKU: {variant.sku} {variant.manufacturerPartNumber&&` · MPN: ${variant.manufacturerPartNumber}`} · {formatUnit(variant.unit,locale)}</p>}
      <section><h2 className="text-lg font-bold">{ar?'التوافق الموثق':'Verified compatibility'}</h2>{compatibilities.length?<ul>{compatibilities.map((c,i)=><li key={i}>{c.vehicleModel.manufacturerName} <bdi>{c.vehicleModel.modelName}</bdi> {c.yearFrom??''}{c.yearTo?`–${c.yearTo}`:''} {ar?c.notesAr:c.notesEn}</li>)}</ul>:<p>{ar?'غير محدد — يرجى تأكيد التوافق معنا.':'Not specified — please confirm compatibility with us.'}</p>}</section>
      {variant?<AddToQuote key={variant.id} product={product} locale={locale} variant={variant}/>:<p role="status">{ar?'حدد الصنف قبل إضافته إلى طلب عرض السعر.':'Select a variant before adding it to your quote.'}</p>}
    </div>
  </div>;
}
