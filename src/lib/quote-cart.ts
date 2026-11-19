export type CartItem={productId:string;variantId?:string|null;quantity:number;name:string;image:string;names:Partial<Record<'ar'|'en',string>>;sku?:string;options?:Record<string,string|number|boolean>;unit?:string};
export const cartKey=(item:Pick<CartItem,'productId'|'variantId'>)=>`${item.productId}:${item.variantId||'legacy'}`;
export function parseCart(raw:string):CartItem[] {
  try {
    const rows:unknown=JSON.parse(raw||'[]');if(!Array.isArray(rows))return [];
    const seen=new Set<string>();
    return rows.filter((row):row is CartItem=>{
      if(!row||typeof row!=='object'||!/^[0-9a-f-]{36}$/i.test(row.productId)||row.variantId!=null&&!/^[0-9a-f-]{36}$/i.test(row.variantId)||!Number.isInteger(row.quantity)||row.quantity<1||row.quantity>99999||typeof row.name!=='string'||row.name.length>500||typeof row.image!=='string'||!row.names||typeof row.names!=='object')return false;
      const key=cartKey(row);if(seen.has(key))return false;seen.add(key);return true;
    }).slice(0,50).map(row=>({...row,variantId:row.variantId||null}));
  } catch{return [];}
}
export function consumeCart(current:CartItem[],submitted:CartItem[]) {
  return current.map(row=>({...row,quantity:row.quantity-(submitted.find(item=>cartKey(item)===cartKey(row))?.quantity||0)})).filter(row=>row.quantity>0);
}
export function selectCartVariant(current:CartItem[],key:string,variant:{id:string;sku:string;options:Record<string,string|number|boolean>;unit:string}):CartItem[] {
  const old=current.find(i=>cartKey(i)===key);if(!old)return current;
  const updated={...old,variantId:variant.id,sku:variant.sku,options:variant.options,unit:variant.unit};
  const other=current.find(i=>cartKey(i)!==key&&cartKey(i)===cartKey(updated));
  return other?current.filter(i=>cartKey(i)!==key).map(i=>i===other?{...i,quantity:Math.min(99999,i.quantity+old.quantity)}:i):current.map(i=>cartKey(i)===key?updated:i);
}
