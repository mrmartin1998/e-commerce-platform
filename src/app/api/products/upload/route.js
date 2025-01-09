import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/adminAuth';

export const POST = requireAdmin(async function(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64String = buffer.toString('base64');
    
    // Create data URL
    const fileType = file.type;
    const dataUrl = `data:${fileType};base64,${base64String}`;

    return NextResponse.json({ url: dataUrl });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}); 