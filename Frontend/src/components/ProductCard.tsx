/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, Minus, Trash2, Heart } from 'lucide-react';
import { Product } from '../types';
import ZippiProductImage from './ZippiProductImage';

interface ProductCardProps {
  product: Product;
  cartQty: number;
  onAddToCart: () => void;
  onRemoveOne: () => void;
  onViewDetails: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  isFlashDeal?: boolean;
}

export default function ProductCard({
  product,
  cartQty,
  onAddToCart,
  onRemoveOne,
  onViewDetails,
  isWishlisted = false,
  onToggleWishlist,
  isFlashDeal = false,
}: ProductCardProps) {
  const hasDiscount = product.discountPercent && product.originalPrice;

  // Calculate the custom display discount percent correctly
  const displayDiscount = product.discountPercent 
    ? `-${product.discountPercent}%` 
    : hasDiscount 
      ? `-${Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%`
      : '';

  return (
    <div 
      className={`bg-white rounded-[12px] overflow-hidden flex flex-col justify-between hover:shadow-xs transition-all duration-200 group relative select-none w-full ${isFlashDeal ? 'border-[#F5C518] border-[1.5px]' : 'border-gray-200 border hover:border-[#F5C518]'}`}
      id={`product-card-${product.id}`}
    >
      {/* Upper Content Overlay & Image */}
      <div className="relative">
        {/* Discount badge top-left: red pill '-25%' (if on sale) */}
        {hasDiscount && (
          <span className={`absolute top-2.5 left-2.5 text-white font-black rounded-full z-10 shadow-xs ${isFlashDeal ? 'bg-[#E53935] text-[11px] px-2.5 py-0.5' : 'bg-[#E11D48] text-[10px] px-2 py-0.5'}`}>
            {displayDiscount}
          </span>
        )}

        {/* Heart/wishlist icon top-right (outlined, or filled red if wishlisted) */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist();
            }}
            className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/90 backdrop-blur-xs rounded-full flex items-center justify-center text-gray-400 hover:text-[#E11D48] active:scale-90 transition-all z-10 shadow-xs border border-gray-100 cursor-pointer"
            id={`wishlist-btn-${product.id}`}
          >
            <Heart 
              className={`w-4.5 h-4.5 ${isWishlisted ? 'fill-[#E11D48] text-[#E11D48]' : 'text-gray-400'}`} 
              strokeWidth={2.5}
            />
          </button>
        )}

        {/* Product Image Click Trigger - Object-fit contain, square ratio, with 8px padding */}
        <div 
          onClick={onViewDetails}
          className="w-full aspect-square bg-white flex items-center justify-center p-2 cursor-pointer"
        >
          <ZippiProductImage
            image={product.image}
            name={product.name}
            category={product.category}
            className="w-full h-full flex items-center justify-center"
            imageClassName="object-contain w-full h-full max-h-[120px] p-2 transform group-hover:scale-105 transition-all duration-300"
            fallbackSize="md"
          />
        </div>
      </div>

      {/* Product Details */}
      <div className="p-3 flex flex-col flex-grow text-left">
        {/* 'Express' yellow tag (if fast delivery available) */}
        {product.popular && (
          <div className="mb-1.5 self-start">
            <span className="bg-[#FFF9C4] text-[#827717] font-extrabold text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5 tracking-wider uppercase border border-[#F0F4C3]">
              ⚡ Express
            </span>
          </div>
        )}

        {/* Product Name (14px, medium, 2 lines max, dark) */}
        <h4 
          onClick={onViewDetails}
          className="text-[#1A1A1A] font-medium text-[14px] leading-snug line-clamp-2 hover:text-[#2563EB] cursor-pointer mb-1 h-9 tracking-tight"
          id={`product-title-${product.id}`}
        >
          {isFlashDeal && !product.name.startsWith('⚡') ? '⚡ ' : ''}{product.name}
        </h4>

        {/* Weight/size (12px, gray) */}
        <div className="text-[12px] text-gray-400 font-medium mb-2" id={`product-unit-${product.id}`}>
          {product.unit}
        </div>

        {/* Pricing Segment */}
        <div className="flex items-baseline gap-1.5 flex-wrap mb-3" id={`price-segment-${product.id}`}>
          {/* Price: 'LKR 320' (16px, bold, dark) */}
          <span className="text-[16px] text-[#1A1A1A] font-bold tracking-tight">
            LKR {product.price.toLocaleString()}
          </span>
          {/* Original price: 'LKR 420' (13px, strikethrough, gray) if on sale */}
          {hasDiscount && product.originalPrice && (
            <span className="text-[13px] text-gray-400 line-through">
              LKR {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stepper / Add button */}
        <div className="mt-auto">
          {cartQty === 0 ? (
            /* BEFORE adding: shows '+ Add' yellow button */
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              className="w-full bg-[#F5C518] hover:bg-[#E0B407] text-[#1A1A1A] font-extrabold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={3} />
              <span>Add</span>
            </button>
          ) : (
            /* AFTER adding: shows [trash] [qty] [+] stepper row */
            <div className="flex items-center justify-between bg-[#FFFDEA] border border-[#F5C518] rounded-lg overflow-hidden h-[34px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveOne();
                }}
                className="w-10 h-full flex items-center justify-center text-[#1A1A1A] hover:bg-[#F5C518]/10 transition-all cursor-pointer"
                id={`decrease-qty-btn-${product.id}`}
              >
                {cartQty === 1 ? (
                  <Trash2 className="w-4 h-4 text-red-500" />
                ) : (
                  <Minus className="w-3.5 h-3.5" strokeWidth={3} />
                )}
              </button>
              
              <span className="font-extrabold text-[#1A1A1A] text-xs select-none px-2 min-w-4 text-center">
                {cartQty}
              </span>
              
              <button
                disabled={product.stock <= cartQty}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart();
                }}
                className="w-10 h-full flex items-center justify-center text-[#1A1A1A] hover:bg-[#F5C518]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                id={`increase-qty-btn-${product.id}`}
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
