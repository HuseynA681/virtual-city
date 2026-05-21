import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ShoppingBag, Plus, X } from 'lucide-react';

export const MarketplaceComponent = () => {
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState({ category: '', rarity: '', maxPrice: '' });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchListings();
  }, [filter]);

  const fetchListings = async () => {
    try {
      const query = new URLSearchParams(filter).toString();
      const response = await axios.get(`http://localhost:5000/api/marketplace?${query}`);
      setListings(response.data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    }
    setLoading(false);
  };

  const buyItem = async (listingId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/marketplace/buy/${listingId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchListings();
    } catch (error) {
      alert(error.response?.data?.error || 'Purchase failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20"
      >
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6" />
          Marketplace
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Filter by category..."
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 outline-none"
          />
          <select
            value={filter.rarity}
            onChange={(e) => setFilter({ ...filter, rarity: e.target.value })}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 outline-none"
          >
            <option value="">All Rarities</option>
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
          <input
            type="number"
            placeholder="Max price..."
            value={filter.maxPrice}
            onChange={(e) => setFilter({ ...filter, maxPrice: e.target.value })}
            className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 outline-none"
          />
        </div>
      </motion.div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {listings.map((listing, index) => (
          <motion.div
            key={listing._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:border-purple-500/50 transition group"
          >
            <div className="aspect-square mb-4 rounded-lg bg-white/10 flex items-center justify-center text-4xl overflow-hidden">
              {listing.item?.icon || '📦'}
            </div>
            <h3 className="font-semibold mb-1">{listing.item?.name}</h3>
            <p className="text-sm text-gray-400 mb-2">{listing.item?.type}</p>
            <div className="flex justify-between items-center mb-4">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                listing.item?.rarity === 'legendary' ? 'bg-yellow-500/30 text-yellow-300' :
                listing.item?.rarity === 'epic' ? 'bg-purple-500/30 text-purple-300' :
                listing.item?.rarity === 'rare' ? 'bg-blue-500/30 text-blue-300' :
                'bg-gray-500/30 text-gray-300'
              }`}>
                {listing.item?.rarity}
              </span>
              <span className="text-yellow-400 font-bold">💰 {listing.price}</span>
            </div>
            <button
              onClick={() => buyItem(listing._id)}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition font-semibold text-sm"
            >
              Buy Now
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
