import { z } from "zod";
import { consumeRateLimit, getRequestIp } from "@/src/lib/security/rate-limit";
import { createServiceClient } from "@/src/lib/supabase/service";

const schema=z.object({name:z.string().trim().min(2).max(100),email:z.string().trim().email().max(254),phone:z.string().trim().max(16).optional(),subject:z.string().trim().min(2).max(120),message:z.string().trim().min(10).max(3000)}).strict();
export async function POST(request:Request){
 if(!consumeRateLimit(`support:${getRequestIp(request)}`,5,60*60_000))return Response.json({message:"Too many requests"},{status:429});
 try{const raw=await request.text();if(new TextEncoder().encode(raw).byteLength>8_192)throw new Error();const parsed=schema.safeParse(JSON.parse(raw));if(!parsed.success)return Response.json({message:"Please check the form fields"},{status:400});const {error}=await createServiceClient().from("support_inquiries").insert({...parsed.data,email:parsed.data.email.toLowerCase(),phone:parsed.data.phone||null});if(error)throw error;return Response.json({success:true,message:"Your inquiry has been securely recorded."},{status:201});}catch{return Response.json({message:"Support is not configured yet. Please try again later."},{status:503});}
}
