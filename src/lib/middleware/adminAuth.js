import { verifyAuth } from './auth';

export function requireAdmin(handler) {
  return async function (request) {
    const user = await verifyAuth(request);
    
    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    request.user = user;
    return handler(request);
  };
} 