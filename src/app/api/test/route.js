import connectDB from '@/lib/db/mongoose';

export async function GET() {
  try {
    await connectDB();
    return Response.json({ status: 'Connected to MongoDB successfully!' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
} 