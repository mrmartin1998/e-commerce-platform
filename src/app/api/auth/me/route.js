import { requireAuth } from '@/lib/middleware/auth';
import connectDB from '@/lib/db/mongoose';

async function handler(request) {
  await connectDB();
  
  return Response.json({
    user: {
      id: request.user._id,
      email: request.user.email,
      name: request.user.name,
      role: request.user.role,
      addresses: request.user.addresses
    }
  });
}

export const GET = requireAuth(handler);
