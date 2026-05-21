import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Package, Trash2 } from 'lucide-react';
import { apiUrl } from '../config/api';

export const InventoryComponent = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get(apiUrl('/api/inventory'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(response.data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
    setLoading(false);
  };

  const removeItem = async (itemId) => {
    try {
      await axios.post(
        apiUrl(`/api/inventory/remove/${itemId}`),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchInventory();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20"
      >
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <Package className="w-6 h-6" />
          Your Inventory ({inventory.length})
        </h2>

        {inventory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Your inventory is empty. Visit the marketplace!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {inventory.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-lg bg-white/10 border border-white/20 hover:border-purple-500/50 transition group"
              >
                <div className="aspect-square mb-3 rounded-lg bg-white/5 flex items-center justify-center text-4xl">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-sm mb-1 truncate">{item.name}</h3>
                <p className="text-xs text-gray-400 mb-3">{item.type}</p>
                <button
                  onClick={() => removeItem(item._id)}
                  className="w-full py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 hover:text-red-200 transition text-sm font-semibold flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
