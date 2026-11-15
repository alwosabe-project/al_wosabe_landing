import Link from 'next/link';
import type { Locale } from '@/lib/locales';

// All quote submissions use the cart checkout; keep the existing section props.
export function QuoteForm({ locale }: { locale: Locale; labels?: unknown; categories?: unknown; whatsappNumber?: string }) {
  const ar = locale === 'ar';
  return <div className="rounded-2xl border border-white/10 bg-ink-900 p-7 text-white"><h3 className="text-2xl font-bold">{ar ? 'جهّز طلب عرض السعر' : 'Prepare your quote request'}</h3><p className="mt-4 leading-8 text-steel-300">{ar ? 'أضف المنتجات التي تحتاجها إلى السلة، وحدد الكميات، ثم أرسل اسمك ورقمك ومدينتك. يمكنك إضافة الشركة والبريد وملاحظة.' : 'Add products to your cart, select quantities, and send your name, phone and city. Company, email and a note are optional.'}</p><div className="mt-6 flex flex-wrap gap-4"><Link href={`/${locale}/products`} className="rounded-xl bg-brand px-5 py-3 font-bold text-ink-950">{ar ? 'اختيار المنتجات' : 'Choose products'}</Link><Link href={`/${locale}/quote-cart`} className="rounded-xl border border-white/30 px-5 py-3 font-bold">{ar ? 'عرض السلة وإرسال الطلب' : 'Review cart and send'}</Link></div></div>;
}
