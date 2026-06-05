/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';

interface ZippiProductImageProps {
  image: string;
  name: string;
  category?: string;
  className?: string; // container className
  imageClassName?: string; // img tag class
  fallbackSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function getProductFallbackDetails(name: string, category: string = '') {
  const nameLower = name.toLowerCase();
  const cat = category.toLowerCase();
  
  let emoji = '🛒';
  let gradient = 'from-amber-100 to-amber-200 text-amber-700';

  if (cat === 'fruits' || nameLower.includes('banana') || nameLower.includes('grape') || nameLower.includes('papaya') || nameLower.includes('apple')) {
    emoji = nameLower.includes('banana') ? '🍌' : nameLower.includes('grape') ? '🍇' : nameLower.includes('papaya') ? '🍊' : nameLower.includes('apple') ? '🍎' : '🍎';
    gradient = 'from-rose-50 to-rose-150 text-rose-600';
  } else if (cat === 'veggies' || nameLower.includes('carrot') || nameLower.includes('tomato') || nameLower.includes('broccoli') || nameLower.includes('spinach') || nameLower.includes('peas')) {
    emoji = nameLower.includes('carrot') ? '🥕' : nameLower.includes('tomato') ? '🍅' : nameLower.includes('broccoli') ? '🥦' : nameLower.includes('spinach') ? '🥬' : nameLower.includes('peas') ? '🫛' : '🥬';
    gradient = 'from-emerald-50 to-emerald-150 text-emerald-600';
  } else if (cat === 'dairy' || nameLower.includes('butter') || nameLower.includes('egg') || nameLower.includes('milk') || nameLower.includes('yogurt') || nameLower.includes('cheese')) {
    emoji = nameLower.includes('butter') ? '🧈' : nameLower.includes('egg') ? '🍳' : nameLower.includes('milk') ? '🥛' : nameLower.includes('yogurt') ? '🍧' : nameLower.includes('cheese') ? '🧀' : '🥛';
    gradient = 'from-blue-50 to-blue-150 text-blue-600';
  } else if (cat === 'bakery' || nameLower.includes('bread') || nameLower.includes('croissant') || nameLower.includes('puff') || nameLower.includes('cracker')) {
    emoji = nameLower.includes('bread') ? '🍞' : nameLower.includes('croissant') ? '🥐' : nameLower.includes('cracker') ? '🍪' : '🥯';
    gradient = 'from-orange-50 to-orange-150 text-amber-800';
  } else if (cat === 'meats' || nameLower.includes('chicken') || nameLower.includes('tuna') || nameLower.includes('fish') || nameLower.includes('seafood')) {
    emoji = nameLower.includes('chicken') ? '🍗' : (nameLower.includes('tuna') || nameLower.includes('fish')) ? '🐟' : '🥩';
    gradient = 'from-red-50 to-red-150 text-red-600';
  } else if (cat === 'beverages' || nameLower.includes('tea') || nameLower.includes('coconut water') || nameLower.includes('coke') || nameLower.includes('milo') || nameLower.includes('nestomalt') || nameLower.includes('soda') || nameLower.includes('juice')) {
    emoji = nameLower.includes('tea') ? '☕' : nameLower.includes('coconut water') ? '🥥' : nameLower.includes('coke') ? '🥤' : nameLower.includes('milo') || nameLower.includes('nestomalt') ? '🧃' : nameLower.includes('juice') ? '🍹' : '🥤';
    gradient = 'from-cyan-50 to-cyan-150 text-cyan-600';
  } else if (cat === 'snacks' || nameLower.includes('cashew') || nameLower.includes('jaggery') || nameLower.includes('pringles')) {
    emoji = nameLower.includes('cashew') ? '🥜' : nameLower.includes('jaggery') ? '🍬' : nameLower.includes('pringles') ? '🍟' : '🍪';
    gradient = 'from-amber-50 to-amber-150 text-amber-700';
  } else if (nameLower.includes('fries') || cat === 'frozen') {
    emoji = '❄️';
    gradient = 'from-sky-50 to-sky-150 text-sky-600';
  } else if (cat === 'cleaning' || nameLower.includes('spray') || nameLower.includes('dishwash') || nameLower.includes('gel') || nameLower.includes('cleaner') || nameLower.includes('harpic')) {
    emoji = nameLower.includes('spray') ? '🧴' : nameLower.includes('cleaner') || nameLower.includes('harpic') ? '🧹' : '🧼';
    gradient = 'from-violet-50 to-violet-150 text-violet-600';
  }

  return { emoji, gradient };
}

export default function ZippiProductImage({
  image,
  name,
  category = '',
  className = 'w-full h-full flex items-center justify-center',
  imageClassName = 'object-contain w-full h-full',
  fallbackSize = 'md',
}: ZippiProductImageProps) {
  const [hasError, setHasError] = useState(false);

  // Reset error state if the image source changes
  useEffect(() => {
    setHasError(false);
  }, [image]);

  const fallback = useMemo(() => getProductFallbackDetails(name, category), [name, category]);

  const sizeClasses = useMemo(() => {
    switch (fallbackSize) {
      case 'xs':
        return { emoji: 'text-lg', label: 'text-[7px]' };
      case 'sm':
        return { emoji: 'text-2xl', label: 'text-[8.5px]' };
      case 'lg':
        return { emoji: 'text-5xl', label: 'text-[11px]' };
      case 'xl':
        return { emoji: 'text-6xl', label: 'text-[13px]' };
      case 'md':
      default:
        return { emoji: 'text-4xl', label: 'text-[9.5px]' };
    }
  }, [fallbackSize]);

  if (hasError || !image) {
    return (
      <div 
        className={`${className} rounded-lg bg-gradient-to-tr ${fallback.gradient} flex flex-col items-center justify-center p-2 text-center select-none animate-fade-in`}
        title={name}
      >
        <span className={`${sizeClasses.emoji} filter drop-shadow-sm leading-none`}>
          {fallback.emoji}
        </span>
        {fallbackSize !== 'xs' && (
          <span className={`${sizeClasses.label} font-black uppercase tracking-wider opacity-75 mt-1 leading-none text-center block max-w-full truncate`}>
            {name.split(' ').slice(0, 2).join(' ')}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <img
        src={image}
        alt={name}
        referrerPolicy="no-referrer"
        className={imageClassName}
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
