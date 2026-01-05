import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/adminAuth';

export const POST = requireAdmin(async function(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files'); // Support multiple files
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    const uploadedImages = [];

    for (const file of files) {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Only JPEG, PNG, and WebP are allowed.` },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum size is 5MB.` },
          { status: 400 }
        );
      }

      // Convert file to base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64String = buffer.toString('base64');
      
      // Create data URL
      const dataUrl = `data:${file.type};base64,${base64String}`;

      uploadedImages.push({
        url: dataUrl,
        name: file.name,
        size: file.size,
        type: file.type
      });
    }

    return NextResponse.json({ 
      images: uploadedImages,
      count: uploadedImages.length 
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
});