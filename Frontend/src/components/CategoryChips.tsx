/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Sparkles, 
  Leaf, 
  Apple, 
  Milk, 
  Croissant, 
  Beef, 
  Egg, 
  Coffee, 
  Cookie,
  LucideIcon 
} from 'lucide-react';
import { Category } from '../types';

interface CategoryChipsProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

// Statically map icon name strings to Lucide Components for failsafe execution and complete type-safety.
const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Leaf,
  Apple,
  Milk,
  Croissant,
  Beef,
  Egg,
  Coffee,
  Cookie,
};

export default function CategoryChips({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategoryChipsProps) {
  return (
    <div className="bg-white border-b border-brand-gray-light py-3 px-4" id="category-scroller">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm text-brand-charcoal uppercase tracking-wider">Browse Categories</h3>
        <span className="text-xs text-brand-blue font-semibold hover:underline cursor-pointer">View All</span>
      </div>
      
      {/* Horizontal Scroll Area */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin scroll-smooth -mx-4 px-4">
        {categories.map((cat) => {
          const IconComponent = ICON_MAP[cat.icon] || Sparkles;
          const isSelected = selectedCategory === cat.id;
          
          return (
            <button
              key={cat.id}
              id={`cat-chip-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border font-semibold text-xs whitespace-nowrap transition-all duration-200 cursor-pointer select-none active:scale-95 flex-shrink-0 ${
                isSelected
                  ? 'bg-brand-yellow-light border-brand-yellow text-brand-charcoal shadow-sm'
                  : 'bg-brand-gray-light/40 border-brand-gray-light text-brand-charcoal hover:border-brand-gray-mid hover:bg-gray-100'
              }`}
            >
              <div className={`p-1.5 rounded-lg flex items-center justify-center ${
                isSelected ? 'bg-brand-yellow text-brand-charcoal' : 'bg-white text-brand-gray'
              }`}>
                <IconComponent className="w-3.5 h-3.5" strokeWidth={2.5} />
              </div>
              <span className="tracking-tight">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
