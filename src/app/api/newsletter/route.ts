import { z } from "zod";
import { consumeRateLimit, getRequestIp, rateLimitExceededResponse } from "@/src/lib/security/rate-limit";
import { createServiceClient } from "@/src/lib/supabase/service";

const schema=z.object({email:z.string().trim().email().max(254)}).strict();
export async function POST(request:Request){const rateWindow=60*60_000;if(!await consumeRateLimit(`newsletter:${getRequestIp(request)}`,10,rateWindow))return rateLimitExceededResponse(rateWindow);try{const parsed=schema.safeParse(await request.json());if(!parsed.success)return Response.json({message:"Enter a valid email"},{status:400});const {error}=await createServiceClient().from("newsletter_subscribers").insert({email:parsed.data.email.toLowerCase(),status:"subscribed",consented_at:new Date().toISOString()});if(error?.code==="23505")return Response.json({success:true,message:"You are already subscribed."});if(error)throw error;return Response.json({success:true,message:"Subscription saved."});}catch{return Response.json({message:"Newsletter signup is not configured yet."},{status:503});}}
