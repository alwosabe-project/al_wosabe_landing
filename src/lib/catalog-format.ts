export type DisplayLocale='ar'|'en';
export type DisplayAttribute={key:string;labelAr?:string;labelEn?:string;dataType?:string;options?:string[];optionLabels?:Record<string,{ar:string;en:string}>;unit?:string|null;sortOrder?:number};
const labels:Record<string,{ar:string;en:string}>={color:{ar:'اللون',en:'Color'},brake_color:{ar:'لون الفرامل',en:'Brake color'},material:{ar:'المادة',en:'Material'},position:{ar:'الموضع',en:'Position'}};
const fallback:Record<string,Record<string,{ar:string;en:string}>>={
  color:{blue:{ar:'أزرق',en:'Blue'},black:{ar:'أسود',en:'Black'},red:{ar:'أحمر',en:'Red'},white:{ar:'أبيض',en:'White'},lime_green:{ar:'أخضر ليموني',en:'Lime green'}},
  material:{aluminum:{ar:'ألمنيوم',en:'Aluminum'}},
  position:{front:{ar:'أمامي',en:'Front'},rear:{ar:'خلفي',en:'Rear'}},
};
const units:Record<string,{ar:string;en:string}>={piece:{ar:'قطعة',en:'Piece'},set:{ar:'طقم',en:'Set'},pair:{ar:'زوج',en:'Pair'},in:{ar:'بوصة',en:'in'},mm:{ar:'مم',en:'mm'},cm:{ar:'سم',en:'cm'},kg:{ar:'كجم',en:'kg'}};
export function formatUnit(unit:string|null|undefined,locale:DisplayLocale){return unit?(Object.hasOwn(units,unit)?units[unit][locale]:unit):'';}
export function attributeLabel(attribute:DisplayAttribute,locale:DisplayLocale){return (locale==='ar'?attribute.labelAr:attribute.labelEn)||(Object.hasOwn(labels,attribute.key)?labels[attribute.key][locale]:undefined)||attribute.key;}
export function formatCatalogValue(value:unknown,attribute:DisplayAttribute|undefined,locale:DisplayLocale):string {
  if(typeof value==='boolean')return value?(locale==='ar'?'نعم':'Yes'):(locale==='ar'?'لا':'No');
  if(typeof value==='number')return Number.isFinite(value)?new Intl.NumberFormat(locale==='ar'?'ar-u-nu-latn':'en',{maximumFractionDigits:12}).format(value):'';
  if(typeof value!=='string')return value==null?'':String(value);
  const key=attribute?.key==='brake_color'?'color':attribute?.key;
  const translated=attribute?.optionLabels&&Object.hasOwn(attribute.optionLabels,value)?attribute.optionLabels[value]?.[locale]:undefined;
  return translated||(key&&Object.hasOwn(fallback,key)&&Object.hasOwn(fallback[key],value)?fallback[key][value][locale]:value);
}
export function formatSpecification(value:unknown,attribute:DisplayAttribute|undefined,locale:DisplayLocale){return [formatCatalogValue(value,attribute,locale),formatUnit(attribute?.unit,locale)].filter(Boolean).join(' ');}
export function formatVariantOptions(options:Record<string,string|number|boolean>|undefined,definitions:DisplayAttribute[]|undefined,locale:DisplayLocale) {
  return Object.entries(options||{}).sort(([a],[b])=>{
    const first=definitions?.find(d=>d.key===a),second=definitions?.find(d=>d.key===b);
    return (first?.sortOrder??Number.MAX_SAFE_INTEGER)-(second?.sortOrder??Number.MAX_SAFE_INTEGER)||(a<b?-1:a>b?1:0);
  }).map(([key,value])=>{const definition=definitions?.find(d=>d.key===key)||{key};return `${attributeLabel(definition,locale)}: ${formatSpecification(value,definition,locale)}`;}).join(' / ');
}
