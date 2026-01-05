const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

function loadMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return null;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const m = line.match(/^\s*MONGODB_URI\s*=\s*(.+)\s*$/);
    if (m) return m[1].trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
  }
  return null;
}

const MONGODB_URI = loadMongoUri() || 'mongodb://localhost:27017/ecommerce-platform';
console.log('Using MongoDB URI:', MONGODB_URI.includes('mongodb') ? MONGODB_URI.replace(/\/\/([^:]+):[^@]+@/, '//$1:****@') : MONGODB_URI);

// Demo product list (trimmed to essential fields)
const demoProducts = [
  // Electronics Category
  { name: "Premium Wireless Headphones", description: "Crystal-clear sound with ANC and 30-hour battery.", price: 249.99, images: [{ url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e", alt: "Headphones" }], category: "electronics", stock: 45 },
  { name: "Ultra HD Smart TV - 55\"", description: "55-inch 4K Smart TV with HDR.", price: 799.99, images: [{ url: "https://images.unsplash.com/photo-1593305841991-05c297ba4575", alt: "Smart TV" }], category: "electronics", stock: 18 },
  { name: "Professional Drone with 4K Camera", description: "4K camera, 30-min flight, obstacle avoidance.", price: 899.99, images: [{ url: "https://images.unsplash.com/photo-1508614999368-9260051292e5", alt: "Drone" }], category: "electronics", stock: 12 },
  { name: "Smart Fitness Watch", description: "Heart rate, sleep tracking, GPS.", price: 199.99, images: [{ url: "https://images.unsplash.com/photo-1575311373937-040b8e71f788", alt: "Smart Watch" }], category: "electronics", stock: 32 },

  // Clothing Category
  { name: "Premium Cotton T-Shirt", description: "Soft organic cotton t-shirt.", price: 29.99, images: [{ url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab", alt: "T-Shirt" }], category: "clothing", stock: 75 },
  { name: "Designer Denim Jacket", description: "Classic denim with modern cut.", price: 89.99, images: [{ url: "https://images.unsplash.com/photo-1591213954196-2d0ccb3f8d4c", alt: "Denim Jacket" }], category: "clothing", stock: 28 },
  { name: "Casual Chino Pants", description: "Stretchy cotton chinos.", price: 59.99, images: [{ url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a", alt: "Chino Pants" }], category: "clothing", stock: 42 },
  { name: "Winter Down Jacket", description: "Insulated down jacket, water-resistant.", price: 199.99, images: [{ url: "https://images.unsplash.com/photo-1544923246-77307dd654cb", alt: "Down Jacket" }], category: "clothing", stock: 15 },

  // Home & Kitchen Category
  { name: "Smart Home Assistant Speaker", description: "Voice assistant with premium sound.", price: 129.99, images: [{ url: "https://images.unsplash.com/photo-1512446816042-444d641267d4", alt: "Home Speaker" }], category: "home", stock: 38 },
  { name: "Professional Chef's Knife", description: "8-inch German steel blade.", price: 89.99, images: [{ url: "https://images.unsplash.com/photo-1566454419290-57a64afe30ac", alt: "Chef Knife" }], category: "home", stock: 22 },
  { name: "Modern Minimalist Table Lamp", description: "Adjustable brightness LED lamp.", price: 59.99, images: [{ url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15", alt: "Table Lamp" }], category: "home", stock: 27 },

  // Books Category
  { name: "The Art of Programming", description: "Comprehensive guide to software development.", price: 49.99, images: [{ url: "https://images.unsplash.com/photo-1532012197267-da84d127e765", alt: "Programming Book" }], category: "books", stock: 30 },
  { name: "The Entrepreneurial Mindset", description: "Guide to successful entrepreneurship.", price: 24.99, images: [{ url: "https://images.unsplash.com/photo-1589998059171-988d887df646", alt: "Entrepreneur Book" }], category: "books", stock: 25 }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const coll = mongoose.connection.collection('products');

    // Prepare bulk upsert operations keyed by name to avoid duplicates
    const ops = demoProducts.map(p => ({
      updateOne: {
        filter: { name: p.name },
        update: { $set: { ...p, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date(), status: 'published' } },
        upsert: true
      }
    }));

    const result = await coll.bulkWrite(ops);
    console.log('Bulk upsert result:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount || (result.upsertedIds ? Object.keys(result.upsertedIds).length : 0)
    });

    const total = await coll.countDocuments();
    console.log(`Products collection now has ${total} documents.`);
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed.');
  }
}

seed();
