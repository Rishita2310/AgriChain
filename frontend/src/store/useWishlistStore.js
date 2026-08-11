import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addToWishlist: (product) => {
        const currentItems = get().items;
        const exists = currentItems.some(item => (item.product_id || item._id) === (product.product_id || product._id));
        
        if (exists) {
          toast('Already in your wishlist', { icon: 'ℹ️' });
          return;
        }
        
        set({ items: [...currentItems, product] });
        toast.success('Added to Wishlist');
      },
      
      removeFromWishlist: (productId) => {
        set({ items: get().items.filter(item => (item.product_id || item._id) !== productId) });
        toast.success('Removed from Wishlist');
      },
      
      isInWishlist: (productId) => {
        return get().items.some(item => (item.product_id || item._id) === productId);
      },
      
      clearWishlist: () => set({ items: [] })
    }),
    {
      name: 'agrichain-wishlist',
    }
  )
);
