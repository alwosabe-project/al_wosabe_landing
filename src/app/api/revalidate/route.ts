import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
const allowed = new Set(['products','categories','brands','blog-posts']);
export async function POST(request:NextRequest){if(request.headers.get('x-revalidation-secret')!==process.env.REVALIDATION_SECRET)return NextResponse.json({error:'Unauthorized'},{status:401});const body=await request.json() as {tags?:string[]};const tags=(body.tags||[]).filter(tag=>allowed.has(tag));for(const tag of tags)revalidateTag(tag,'max');return NextResponse.json({data:{revalidated:tags}})}
