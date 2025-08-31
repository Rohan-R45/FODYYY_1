import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import menuService from '../services/menuService';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

// Zomato-style, mobile-first Menu page
// - If restaurantId is provided via ?restaurantId=..., loads that restaurant's menu for student flow
// - Otherwise, shows a global menu browse (without add-to-cart if restaurantId is unknown)

const MenuPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');

  const { addToCart, getCartItemQuantity, updateQuantity, cartItems, getCartTotal } = useCart();

  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);

  // UI state
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [vegOnly, setVegOnly] = useState(false);
  const [eggOnly, setEggOnly] = useState(false);
  const [nonVegOnly, setNonVegOnly] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        // categories are optional – don't fail view if missing
        menuService.getCategories().then((res) => {
          const cats = Array.isArray(res?.data) ? res.data : (res?.data?.categories || []);
          setCategories([{ id: 'all', name: 'All' }, ...cats.map((c) => ({ id: c.toLowerCase(), name: c }))]);
        }).catch(() => setCategories([{ id: 'all', name: 'All' }]));

        let res;
        if (restaurantId) {
          res = await menuService.getMenuItemsByRestaurant(restaurantId);
        } else {
          res = await menuService.getMenuItems();
        }

        let list = [];
        const data = res?.data || res;
        if (Array.isArray(data)) list = data;
        else if (Array.isArray(data?.items)) list = data.items;
        else if (data?.menuItems && typeof data.menuItems === 'object') {
          Object.values(data.menuItems).forEach((arr) => { if (Array.isArray(arr)) list.push(...arr); });
        }

        setItems(list);
      } catch (e) {
        console.error('Failed to load menu:', e);
        toast.error('Failed to load menu');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [restaurantId]);

  const filteredItems = useMemo(() => {
    let list = items;
    if (activeCategory !== 'all') {
      list = list.filter((i) => i.category?.toLowerCase() === activeCategory);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((i) => i.name?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q));
    }
    if (vegOnly) list = list.filter((i) => i.isVegetarian === true);
    if (eggOnly) list = list.filter((i) => i.isEgg === true);
    if (nonVegOnly) list = list.filter((i) => i.isVegetarian === false);
    return list;
  }, [items, activeCategory, query, vegOnly, eggOnly, nonVegOnly]);

  const canAddToCart = (item) => {
    // require restaurantId to avoid cross-restaurant ambiguity
    return Boolean(restaurantId || item.restaurantId || item.restaurant?._id);
  };

  const handleAdd = (item) => {
    if (!canAddToCart(item)) {
      toast.error('Open a restaurant to add items');
      return;
    }

    const normalizedId = item._id || item.id;
    const rId = restaurantId || item.restaurantId || item.restaurant?._id;
    const rName = item.restaurantName || item.restaurant?.name || 'Restaurant';
    // Ensure cart items always have _id for reducer/selectors
    addToCart({ ...item, _id: normalizedId, restaurantId: rId, restaurantName: rName }, 1);
  };

  const qtyOf = (id) => getCartItemQuantity(id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search “biryani”"
                className="w-full h-10 pl-10 pr-3 rounded-full bg-gray-100 text-sm outline-none"
              />
              <svg className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            {(categories.length ? categories : [{ id: 'all', name: 'All' }]).map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 h-9 rounded-full text-sm whitespace-nowrap ${activeCategory === c.id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}
              >
                {c.name}
              </button>
            ))}
            <button onClick={() => setVegOnly((v) => !v)} className={`px-3 h-9 rounded-full text-sm ${vegOnly ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>Veg</button>
            <button onClick={() => setEggOnly((v) => !v)} className={`px-3 h-9 rounded-full text-sm ${eggOnly ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>Egg</button>
            <button onClick={() => setNonVegOnly((v) => !v)} className={`px-3 h-9 rounded-full text-sm ${nonVegOnly ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>Non-Veg</button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Recommended for you</h2>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-28" />
            ))}
          </div>
        ) : filteredItems.length ? (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              // Normalize item id to handle cases where API returns id instead of _id
              const normalizedId = item._id || item.id;
              const qty = qtyOf(normalizedId);
              return (
                <div key={normalizedId} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-semibold text-gray-900 truncate">{item.name}</h3>
                        <div className="text-xs text-emerald-700 mt-1">Highly reordered</div>
                      </div>
                    </div>
                    <div className="mt-2 text-[15px] font-bold text-gray-900">₹{Number(item.price || 0).toFixed(0)}</div>
                    {item.description && (
                      <p className="mt-1 text-gray-600 text-sm line-clamp-2">{item.description}</p>
                    )}
                    {item.isAvailable === false && (
                      <div className="text-xs text-red-600 mt-2">Currently unavailable</div>
                    )}
                  </div>

                  <div className="w-28 shrink-0">
                    <div className="relative w-28 h-24 rounded-xl overflow-hidden bg-gray-100">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-gray-400 text-xs">No Image</div>
                      )}
                    </div>
                    <div className="mt-2 flex justify-end">
                      {item.isAvailable === false ? (
                        <span className="text-xs text-red-600">Not Available</span>
                      ) : qty > 0 ? (
                        <div className="flex items-center bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <button onClick={() => updateQuantity(normalizedId, Math.max(0, qty - 1))} className="w-8 h-8 grid place-items-center text-orange-400 font-bold">−</button>
                          <span className="w-8 text-center font-semibold">{qty}</span>
                          <button onClick={() => updateQuantity(normalizedId, qty + 1)} className="w-8 h-8 grid place-items-center text-orange-400 font-bold">+</button>
                        </div>
                      ) : (
                        <button onClick={() => handleAdd(item)} disabled={!canAddToCart(item)} className="px-4 py-2 rounded-lg bg-orange-600 text-white font-semibold shadow-sm active:scale-95 disabled:opacity-60">ADD</button>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1 text-right">customisable</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-600">No menu items</div>
        )}
      </div>

      {/* Sticky bottom bar when items in cart */}
      {cartItems.length > 0 && (
        <div className="fixed inset-x-0 bottom-[64px] sm:bottom-0 bg-white border-t border-gray-200 p-3 z-50 mobile-safe-area">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-lg font-semibold">₹{getCartTotal().toFixed(0)}</div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-semibold shadow-sm active:scale-95"
            >
              View Cart & Checkout
            </button>
          </div>
        </div>
      )}
      {cartItems.length > 0 && <div className="h-[112px] sm:h-0" />}
    </div>
  );
};

export default MenuPage;