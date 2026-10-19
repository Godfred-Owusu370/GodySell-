import React from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES_WITH_META } from '../../data/initialProducts';
import {
  Car,
  Home,
  Smartphone,
  Tv,
  Armchair,
  ShoppingBag,
  Wrench,
  Wheat,
  Briefcase,
  LayoutGrid,
  MoreHorizontal
} from 'lucide-react';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Car,
  Home,
  Smartphone,
  Tv,
  Armchair,
  ShoppingBag,
  Wrench,
  Wheat,
  Briefcase,
  MoreHorizontal
};

export const CategoryBar: React.FC = () => {
  const { selectedCategory, setSelectedCategory, products } = useApp();

  // compute live product counts per category from actual state
  const getCategoryCount = (categoryName: string) => {
    return products.filter((p) => p.category === categoryName).length;
  };

  return (
    <div className="bg-white border-b border-slate-200/80 py-2.5 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
          {/* All Categories Option */}
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 border ${
              selectedCategory === null
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <LayoutGrid className={`w-3.5 h-3.5 ${selectedCategory === null ? 'text-white' : 'text-slate-400'}`} />
            <span>All Categories</span>
            {products.length > 0 && (
              <span className={`text-[11px] ${selectedCategory === null ? 'text-slate-300' : 'text-slate-400'}`}>
                ({products.length})
              </span>
            )}
          </button>

          {/* Individual Categories */}
          {CATEGORIES_WITH_META.map((cat) => {
            const IconComponent = iconMap[cat.icon] || ShoppingBag;
            const isSelected = selectedCategory === cat.name;
            const liveCount = getCategoryCount(cat.name);

            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{cat.name}</span>
                {liveCount > 0 && (
                  <span className={`text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                    ({liveCount})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
