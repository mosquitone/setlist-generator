import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';

export default async function handler(
  request: VercelRequest ,
  response: VercelResponse,
) {

  if (request.method === "PUT") {
    const { ...value}=  request.body
    await kv.hset(request.query.id as string, value)
    return response.status(200).json("");
  } 

  if (request.method === "POST") {
    const id = randomUUID()
    await kv.hset(id, request.body)
    return response.status(201).json(id)
  }

  const user = await kv.hgetall(request.query.id as string);
  return response.status(200).json(user);
}