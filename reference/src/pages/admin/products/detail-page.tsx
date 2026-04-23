import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductFullView from './components/ProductFullView';
import { loadProductsFromDB, saveProductsToDB } from '../../../utils/productStorage';
import { loadRestockFromDB } from '../../../utils/productStorage';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [restockHistory, setRestockHistory] = useState<any[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const [prods, history] = await Promise.all([
        loadProductsFromDB(),
        loadRestockFromDB(),
      ]);
      const allProducts = prods ?? [];
      const allHistory = history ?? [];
      const found = allProducts.find((p: any) => String(p.id) === String(id));
      if (found) {
        setProduct(found);
        setRestockHistory(allHistory.filter((h: any) => String(h.productId) === String(found.id)));
      } else {
        setNotFound(true);
      }
    })();
  }, [id]);

  const handleEdit = async (updated: any) => {
    const prods = await loadProductsFromDB() ?? [];
    const updatedList = prods.map((p: any) => String(p.id) === String(id) ? { ...p, ...updated } : p);
    await saveProductsToDB(updatedList);
    setProduct((prev: any) => ({ ...prev, ...updated }));
  };

  const handleDelete = async () => {
    const prods = await loadProductsFromDB() ?? [];
    const updated = prods.filter((p: any) => String(p.id) !== String(id));
    await saveProductsToDB(updated);
    navigate('/admin/products');
  };

  const handleRestock = async (productId: number, qty: number, note: string) => {
    const prods = await loadProductsFromDB() ?? [];
    const updatedList = prods.map((p: any) =>
      p.id === productId ? { ...p, inventory: (p.inventory ?? 0) + qty } : p
    );
    await saveProductsToDB(updatedList);
    const updated = updatedList.find((p: any) => p.id === productId);
    if (updated) setProduct(updated);
  };

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
          <i className="ri-store-3-line text-slate-400 text-3xl"></i>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">Product Not Found</p>
          <p className="text-sm text-slate-500 mt-1">Product #{id} does not exist.</p>
        </div>
        <button
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl cursor-pointer"
        >
          <i className="ri-arrow-left-line"></i> Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-8 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
        >
          <i className="ri-arrow-left-line"></i>
          <span>All Products</span>
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-bold text-slate-900">{product.name}</span>
      </div>

      <div className="p-6">
        <ProductFullView
          product={product}
          restockHistory={restockHistory}
          onClose={() => navigate('/admin/products')}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestock={handleRestock}
        />
      </div>
    </div>
  );
}
