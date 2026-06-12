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

export function getCategoryFallbackDetails(idOrName: string) {
  const id = idOrName.toLowerCase();
  
  // Default values
  let emoji = '🛒';
  let gradient = 'from-amber-100 to-amber-200 text-amber-700';

  if (id.includes('veggie') || id.includes('produce') || id.includes('fruit') || id.includes('crop') || id.includes('grocery')) {
    emoji = '🥦';
    gradient = 'from-emerald-50 to-emerald-150 text-emerald-600';
  } else if (id.includes('dairy') || id.includes('egg') || id.includes('milk')) {
    emoji = '🥛';
    gradient = 'from-blue-50 to-blue-150 text-blue-600';
  } else if (id.includes('meat') || id.includes('seafood') || id.includes('fish') || id.includes('chicken')) {
    emoji = '🥩';
    gradient = 'from-red-50 to-red-150 text-red-600';
  } else if (id.includes('bakery') || id.includes('bread') || id.includes('pastry') || id.includes('cake')) {
    emoji = '🍞';
    gradient = 'from-orange-50 to-orange-150 text-amber-800';
  } else if (id.includes('beverage') || id.includes('drink') || id.includes('soda') || id.includes('juice')) {
    emoji = '🥤';
    gradient = 'from-cyan-50 to-cyan-150 text-cyan-600';
  } else if (id.includes('snack') || id.includes('chip') || id.includes('sweet') || id.includes('chocolate') || id.includes('candy') || id.includes('cookie')) {
    emoji = '🍿';
    gradient = 'from-amber-50 to-amber-150 text-amber-700';
  } else if (id.includes('frozen')) {
    emoji = '❄️';
    gradient = 'from-sky-50 to-sky-150 text-sky-600';
  } else if (id.includes('cleaning') || id.includes('home') || id.includes('detergent')) {
    emoji = '🧹';
    gradient = 'from-violet-50 to-violet-150 text-violet-600';
  } else if (id.includes('pharmacy') || id.includes('medicine') || id.includes('pill') || id.includes('first-aid') || id.includes('health')) {
    emoji = '💊';
    gradient = 'from-rose-50 to-rose-150 text-rose-600';
  } else if (id.includes('baby') || id.includes('kid') || id.includes('child') || id.includes('diaper')) {
    emoji = '🧸';
    gradient = 'from-pink-50 to-pink-150 text-pink-600';
  } else if (id.includes('breakfast') || id.includes('cereal') || id.includes('oat')) {
    emoji = '🥞';
    gradient = 'from-amber-100 to-amber-250 text-amber-800';
  } else if (id.includes('canned') || id.includes('dry') || id.includes('tin') || id.includes('pack')) {
    emoji = '🥫';
    gradient = 'from-rose-100 to-rose-200 text-rose-700';
  } else if (id.includes('pantry') || id.includes('oil') || id.includes('condiment')) {
    emoji = '🫙';
    gradient = 'from-amber-50 to-orange-100 text-amber-700';
  } else if (id.includes('masala') || id.includes('spice') || id.includes('curry') || id.includes('seasoning') || id.includes('flame')) {
    emoji = '🌶️';
    gradient = 'from-orange-50 to-orange-150 text-orange-600';
  } else if (id.includes('car-rental') || id.includes('car') || id.includes('vehicle') || id.includes('rent')) {
    emoji = '🚗';
    gradient = 'from-slate-50 to-slate-150 text-slate-600';
  } else if (id.includes('cosmetics') || id.includes('makeup') || id.includes('fancy') || id.includes('skincare') || id.includes('haircare')) {
    emoji = '✨';
    gradient = 'from-purple-50 to-purple-150 text-purple-600';
  }

  return { emoji, gradient };
}

interface ZippiCategoryImageProps {
  image: string;
  name: string;
  id?: string;
  className?: string;
  imageClassName?: string;
  emojiClassName?: string;
}

export function ZippiCategoryImage({
  image,
  name,
  id = '',
  className = 'w-full h-full flex items-center justify-center',
  imageClassName = 'object-contain w-full h-full',
  emojiClassName = 'text-4xl'
}: ZippiCategoryImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [image]);

  const fallback = useMemo(() => getCategoryFallbackDetails(id || name), [id, name]);

  if (hasError || !image) {
    return (
      <div 
        className={`${className} rounded-xl bg-gradient-to-tr ${fallback.gradient} flex flex-col items-center justify-center p-2 text-center select-none animate-fade-in`}
        title={name}
      >
        <span className={`${emojiClassName} filter drop-shadow-sm leading-none`}>
          {fallback.emoji}
        </span>
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

