import { requireAdmin } from '@/lib/middleware/adminAuth';
import { Product } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { isValidObjectId } from 'mongoose';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;

    // Validate MongoDB ID
    if (!isValidObjectId(id)) {
      return Response.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await Product.findOne({ 
      _id: id,
      status: 'published'
    });

    if (!product) {
      return Response.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return Response.json({ product });

  } catch (error) {
    console.error('Product fetch error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 

export const PUT = requireAdmin(async function(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    if (!isValidObjectId(id)) {
      return Response.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const updates = await request.json();
    const product = await Product.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: Date.now() },
      { new: true }
    );

    if (!product) {
      return Response.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return Response.json({ product });

  } catch (error) {
    console.error('Product update error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const DELETE = requireAdmin(async function(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    if (!isValidObjectId(id)) {
      return Response.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return Response.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return Response.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Product deletion error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 