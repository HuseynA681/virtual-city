import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, RotateCcw } from 'lucide-react';

export const ApartmentComponent = () => {
  const [furniture, setFurniture] = useState([
    { id: 1, name: 'Sofa', icon: '🛋️', x: 0, y: 0 },
    { id: 2, name: 'Lamp', icon: '💡', x: 100, y: 0 },
  ]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dragging, setDragging] = useState(null);

  const availableFurniture = [
    { id: 'bed', name: 'Bed', icon: '🛏️' },
    { id: 'desk', name: 'Desk', icon: '🗓️' },
    { id: 'plant', name: 'Plant', icon: '🌿' },
    { id: 'painting', name: 'Painting', icon: '🖼️' },
    { id: 'rug', name: 'Rug', icon: '🟫' },
    { id: 'bookshelf', name: 'Bookshelf', icon: '📚' },
  ];

  const handleDragStart = (e, id) => {
    setDragging(id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (dragging && !furniture.find(f => f.id === dragging)) {
      const newItem = availableFurniture.find(f => f.id === dragging);
      setFurniture([...furniture, { ...newItem, id: Date.now(), x, y }]);
    } else if (dragging) {
      setFurniture(furniture.map(f =>
        f.id === dragging ? { ...f, x, y } : f
      ));
    }
    setDragging(null);
  };

  const removeFurniture = (id) => {
    setFurniture(furniture.filter(f => f.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Room Canvas */}
      <div className="lg:col-span-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-gradient-to-br from-amber-900/30 to-orange-900/30 backdrop-blur-md border border-white/20 h-96"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Home className="w-6 h-6" />
            Your Apartment
          </h2>
          
          <div className="relative w-full h-80 bg-white/5 rounded-lg border border-white/20 overflow-hidden">
            {furniture.map(item => (
              <motion.div
                key={item.id}
                draggable
                onDragStart={() => setDragging(item.id)}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute w-16 h-16 cursor-move text-4xl flex items-center justify-center rounded-lg bg-white/10 border border-white/30 hover:border-purple-500/50 transition group"
                style={{ left: `${item.x}px`, top: `${item.y}px` }}
                onClick={() => setSelectedItem(item.id)}
              >
                {item.icon}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFurniture(item.id);
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Furniture Catalog */}
      <div className="p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 h-fit">
        <h3 className="text-lg font-bold mb-4">Furniture</h3>
        <div className="grid grid-cols-2 gap-2">
          {availableFurniture.map(item => (
            <motion.div
              key={item.id}
              draggable
              onDragStart={() => setDragging(item.id)}
              whileHover={{ scale: 1.05 }}
              className="p-3 rounded-lg bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-white/30 cursor-move text-center hover:border-purple-500/50 transition"
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <p className="text-xs font-semibold">{item.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
