import ProductCard from '@/components/products/ProductCard';
 
async function getProducts() {
  const res = await fetch(`http://localhost:3000/api/products`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export default async function ProductsPage() {
  const { products } = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Our Products</h1>
        <div className="join">
          <button className="btn join-item btn-sm">Grid</button>
          <button className="btn join-item btn-sm">List</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products?.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
} 