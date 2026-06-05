/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ArrowLeft, 
  Search as SearchIcon, 
  Camera as CameraIcon, 
  ShoppingBasket, 
  Heart, 
  Home as HomeIcon, 
  ChevronDown, 
  Plus, 
  Minus, 
  Trash2,
  Tag,
  User,
  Layers,
  Percent
} from 'lucide-react';
import { ZippiCategoryImage } from './ZippiProductImage';

// ==========================================
// 1. HEADER COMPONENT
// ==========================================
interface HeaderComponentProps {
  showBack?: boolean;
  title?: string;
  showSearch?: boolean;
  showCart?: boolean;
  showHeart?: boolean;
  isHome?: boolean;
  addressLabel?: string;
  addressDetails?: string;
  cartCount?: number;
  onBack?: () => void;
  onSearchClick?: () => void;
  onCartClick?: () => void;
  onHeartClick?: () => void;
  onAddressClick?: () => void;
}

export function ZippiHeader({
  showBack = false,
  title = "Zippi",
  showSearch = false,
  showCart = false,
  showHeart = false,
  isHome = false,
  addressLabel = "Deliver to Home",
  addressDetails = "123, Main Street, Colombo 03",
  cartCount = 0,
  onBack,
  onSearchClick,
  onCartClick,
  onHeartClick,
  onAddressClick,
}: HeaderComponentProps) {
  // Yellow bg (#F5C518) when on home, white when on inner pages
  const bgStyle = isHome ? "bg-[#F5C518] text-[#1A1A1A]" : "bg-white text-[#1A1A1A] border-b border-gray-100";

  return (
    <header className={`${bgStyle} px-4 py-3 sticky top-0 z-40 transition-colors w-full select-none shadow-3xs`} id="zippi-header-widget">
      <div className="flex items-center justify-between max-w-7xl mx-auto gap-2">
        {/* Left section: Back arrow or Logo */}
        <div className="flex items-center gap-2">
          {showBack && (
            <button 
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-black/5 active:scale-95 transition-all text-inherit cursor-pointer"
              id="header-back-button"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}

          {isHome ? (
            /* Address bar variant (home icon + address dropdown) */
            <div 
              onClick={onAddressClick}
              className="flex items-center gap-1.5 cursor-pointer max-w-[200px] sm:max-w-[300px]"
              id="header-address-selector"
            >
              <div className="p-1 bg-white/20 rounded-full text-inherit">
                <HomeIcon className="w-4 h-4" />
              </div>
              <div className="text-left leading-none min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[12px] font-black tracking-tight truncate">{addressLabel}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-inherit shrink-0" />
                </div>
                <span className="text-[10px] text-black/60 font-semibold block truncate mt-0.5">{addressDetails}</span>
              </div>
            </div>
          ) : (
            <h1 className="font-extrabold text-[16px] tracking-tight">{title}</h1>
          )}
        </div>

        {/* Right Section Actions: Search, Heart, Cart */}
        <div className="flex items-center gap-2">
          {showSearch && (
            <button 
              onClick={onSearchClick}
              className="p-2 hover:bg-black/5 rounded-full cursor-pointer text-inherit"
              id="header-search-icon-btn"
            >
              <SearchIcon className="w-4.5 h-4.5" />
            </button>
          )}

          {showHeart && (
            <button 
              onClick={onHeartClick}
              className="p-2 hover:bg-black/5 rounded-full cursor-pointer text-inherit"
              id="header-heart-icon-btn"
            >
              <Heart className="w-4.5 h-4.5" />
            </button>
          )}

          {showCart && (
            <button 
              onClick={onCartClick}
              className="p-2 hover:bg-black/5 rounded-full relative cursor-pointer text-inherit"
              id="header-cart-icon-btn"
            >
              <ShoppingBasket className="w-4.5 h-4.5" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#1565C0] text-white font-black text-[9px] rounded-full w-4 h-4 flex items-center justify-center animate-scale-up border border-white">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// ==========================================
// 2. SEARCH BAR COMPONENT
// ==========================================
interface SearchBarComponentProps {
  value: string;
  onChange: (val: string) => void;
  onCameraClick?: () => void;
  onSearchSubmit?: () => void;
  placeholder?: string;
  isFocused?: boolean;
}

export function ZippiSearchBar({
  value,
  onChange,
  onCameraClick,
  onSearchSubmit,
  placeholder = "Search 10,000+ daily grocery items...",
  isFocused = false,
}: SearchBarComponentProps) {
  return (
    <div className="w-full px-1" id="zippi-search-bar-outer">
      <div className="relative flex items-center w-full h-[44px]">
        {/* Left search icon inside */}
        <div className="absolute left-3.5 text-gray-400">
          <SearchIcon className="w-4 h-4" />
        </div>

        {/* Search input field */}
        <input 
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-full pl-10 pr-10 rounded-full border border-gray-200 bg-white text-xs font-semibold text-brand-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1565C0] focus:border-[#1565C0] transition-all bg-clip-padding"
          id="zippi-global-search-input"
        />

        {/* Right Camera icon button */}
        {onCameraClick && (
          <button 
            type="button"
            onClick={onCameraClick}
            className="absolute right-3.5 text-gray-500 hover:text-[#1565C0] p-1 rounded-full cursor-pointer transition-colors"
            id="zippi-camera-search-icon"
            title="Scan with Camera"
          >
            <CameraIcon className="w-4.5 h-4.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 3. BOTTOM NAV COMPONENT
// ==========================================
interface BottomNavComponentProps {
  activeTab: 'home' | 'categories' | 'deals' | 'account' | 'cart';
  onTabChange: (tab: 'home' | 'categories' | 'deals' | 'account' | 'cart') => void;
  cartCount: number;
}

export function ZippiBottomNav({
  activeTab,
  onTabChange,
  cartCount,
}: BottomNavComponentProps) {
  // Config item specifications
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: HomeIcon },
    { id: 'categories' as const, label: 'Categories', icon: Layers },
    { id: 'deals' as const, label: 'Deals', icon: Percent },
    { id: 'account' as const, label: 'Account', icon: User },
    { id: 'cart' as const, label: 'Cart', icon: ShoppingBasket, badge: true },
  ];

  return (
    <nav className="bg-white border-t border-gray-150 sticky bottom-0 z-40 w-full select-none px-2 py-0.5 flex justify-around items-center h-[56px] shadow-sm shrink-0" id="zippi-bottom-navigation-bar">
      {tabs.map((t) => {
        const isActive = activeTab === t.id;
        const IconComponent = t.icon;

        return (
          <button
            key={`nav-tab-${t.id}`}
            onClick={() => onTabChange(t.id)}
            className="flex-1 h-full flex flex-col items-center justify-center relative cursor-pointer group focus:outline-none"
            id={`bottom-nav-tab-${t.id}`}
          >
            {/* Top active 3px blue bar indicator */}
            {isActive && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#1565C0] rounded-full animate-scale-up" />
            )}

            {/* Icon panel */}
            <div className={`transition-all duration-200 ${isActive ? 'text-[#1565C0] scale-105' : 'text-gray-400 group-hover:text-gray-600'}`}>
              {t.badge ? (
                /* Cart contains yellow badge with count */
                <div className="relative">
                  <IconComponent className="w-5 h-5 mx-auto" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 bg-[#F5C518] text-[#1A1A1A] font-black text-[9.5px] rounded-full px-1 min-w-4 h-4 flex items-center justify-center border border-white">
                      {cartCount}
                    </span>
                  )}
                </div>
              ) : (
                <IconComponent className="w-5 h-5 mx-auto" />
              )}
            </div>

            {/* Link label */}
            <span className={`text-[9px] font-bold mt-1 tracking-tight transition-colors ${
              isActive ? 'text-[#1565C0]' : 'text-gray-400 group-hover:text-gray-600'
            }`}>
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ==========================================
// 4. PRODUCT CARD — GROCERY
// ==========================================
interface ProductCardGroceryProps {
  image: string;
  name: string;
  weight: string;
  price: number;
  originalPrice?: number;
  discount?: string; // e.g. "-15%" or "15" or null
  isFastDelivery?: boolean;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
  onViewDetails?: () => void;
}

export function ZippiProductCardGrocery({
  image,
  name,
  weight,
  price,
  originalPrice,
  discount,
  isFastDelivery = false,
  qty = 0,
  onAdd,
  onRemove,
  onViewDetails,
}: ProductCardGroceryProps) {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-[12px] p-3 overflow-hidden flex flex-col justify-between hover:border-[#F5C518] transition-all relative select-none w-full shadow-3xs"
      id={`zippi-proto-product-${name.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {/* Top badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
        {discount && (
          <span className="bg-[#E11D48] text-white text-[9.5px] font-black px-2 py-0.5 rounded-full shadow-xs">
            {discount}
          </span>
        )}
      </div>

      {/* Main Image content body */}
      <div 
        onClick={onViewDetails}
        className="w-full aspect-square bg-white flex items-center justify-center p-1.5 cursor-pointer"
      >
        <img 
          src={image} 
          alt={name} 
          referrerPolicy="no-referrer"
          className="object-contain w-full h-full max-h-[110px] transform hover:scale-102 transition-transform" 
        />
      </div>

      {/* Product specs details */}
      <div className="mt-2 flex-grow flex flex-col justify-between">
        <div className="text-left">
          {/* Express logo tag */}
          {isFastDelivery && (
            <span className="bg-[#FFF9C4] text-[#827717] font-black text-[8px] tracking-wide px-1.5 py-0.5 rounded inline-flex items-center gap-0.5 mb-1 bg-clip-padding uppercase">
              ⚡ Express
            </span>
          )}

          {/* Product Title */}
          <h4 
            onClick={onViewDetails}
            className="text-[#1A1A1A] font-bold text-[13px] leading-snug line-clamp-2 h-8.5 tracking-tight cursor-pointer hover:text-[#1565C0]"
          >
            {name}
          </h4>

          {/* Weight */}
          <span className="text-[10px] text-gray-400 block font-medium mt-0.5">{weight}</span>
        </div>

        {/* Pricing & Stepper section */}
        <div className="mt-3">
          <div className="flex items-baseline gap-1.5 mb-2.5 flex-wrap">
            <span className="text-[14.5px] font-black text-[#1A1A1A]">LKR {price.toLocaleString()}</span>
            {originalPrice && (
              <span className="text-[11px] text-gray-400 line-through font-medium">LKR {originalPrice.toLocaleString()}</span>
            )}
          </div>

          {/* Qty controller block */}
          {qty === 0 ? (
            <button
              onClick={onAdd}
              className="w-full h-9 bg-[#F5C518] hover:bg-[#E0B000] text-[#1A1A1A] font-extrabold text-[11.5px] rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-3xs"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={3} />
              <span>Add</span>
            </button>
          ) : (
            <ZippiStepper qty={qty} onAdd={onAdd} onRemove={onRemove} />
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. CATEGORY CARD
// ==========================================
interface CategoryCardProps {
  image: string;
  name: string;
  hasSale?: boolean;
  onClick?: () => void;
}

export function ZippiCategoryCard({
  image,
  name,
  hasSale = false,
  onClick,
}: CategoryCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-gray-50/80 hover:bg-gray-100/90 rounded-2xl p-2.5 cursor-pointer text-center relative select-none border border-transparent hover:border-gray-200 transition-all shadow-3xs"
      id={`zippi-category-${name.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {/* Optional sale banner badge */}
      {hasSale && (
        <span className="absolute top-1.5 right-1.5 bg-[#E11D48] text-white text-[8px] font-black tracking-wider px-1.5 py-0.5 rounded-full uppercase animate-pulse">
          SALE
        </span>
      )}

      {/* Rounded content container */}
      <div className="w-full aspect-square bg-white rounded-xl flex items-center justify-center p-1 border border-gray-100 overflow-hidden mb-2">
        <ZippiCategoryImage 
          image={image} 
          name={name} 
          imageClassName="object-contain w-full h-full max-h-[64px] group-hover:scale-105 transition-transform" 
          emojiClassName="text-3xl"
        />
      </div>

      <div className="text-[11px] font-black text-brand-charcoal truncate px-0.5 leading-tight">
        {name}
      </div>
    </div>
  );
}

// ==========================================
// 6. APP SWITCHER TILE
// ==========================================
interface AppSwitcherTileProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function ZippiAppSwitcherTile({
  icon,
  label,
  isActive,
  onClick,
}: AppSwitcherTileProps) {
  return (
    <button
      onClick={onClick}
      className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all select-none cursor-pointer focus:outline-none ${
        isActive 
          ? 'bg-[#F2C21B] text-[#1A1A1A] shadow-xs font-black' 
          : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 font-extrabold'
      }`}
      id={`app-switcher-tile-${label.toLowerCase()}`}
    >
      <div className="text-[20px] leading-none shrink-0">{icon}</div>
      <span className="text-[9.5px] tracking-tight">{label}</span>
    </button>
  );
}

// ==========================================
// 7. FILTER CHIP
// ==========================================
interface FilterChipProps {
  label: string;
  isActive: boolean;
  hasDropdown?: boolean;
  onClick: () => void;
}

export function ZippiFilterChip({
  label,
  isActive,
  hasDropdown = false,
  onClick,
}: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold select-none cursor-pointer transition-all border outline-none ${
        isActive 
          ? 'bg-[#F5C518] text-[#1A1A1A] border-[#E5B508] font-black' 
          : 'bg-white text-brand-charcoal border-gray-200 hover:border-gray-400'
      }`}
      id={`zippi-filter-chip-${label.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <span>{label}</span>
      {hasDropdown && <ChevronDown className="w-3 h-3 text-inherit shrink-0" />}
    </button>
  );
}

// ==========================================
// 8. SECTION HEADER
// ==========================================
interface SectionHeaderProps {
  title: string;
  viewAllLink?: string;
  onViewAllClick?: () => void;
}

export function ZippiSectionHeader({
  title,
  viewAllLink,
  onViewAllClick,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full select-none" id={`zippi-section-header-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      <h3 className="text-[16px] sm:text-[18px] font-extrabold text-[#1A1A1A] leading-tight text-left">
        {title}
      </h3>
      {(viewAllLink || onViewAllClick) && (
        <button 
          onClick={onViewAllClick}
          className="text-[12px] font-black text-[#1565C0] hover:text-[#0D47A1] transition-colors cursor-pointer"
        >
          View all →
        </button>
      )}
    </div>
  );
}

// ==========================================
// 9. CASHBACK CHIP
// ==========================================
interface CashbackChipProps {
  label: string;
}

export function ZippiCashbackChip({
  label,
}: CashbackChipProps) {
  return (
    <span 
      className="inline-flex items-center gap-1 bg-[#FEF9C3] hover:bg-[#FEF08A] transition-colors text-[#854D0E] text-[10px] font-black border border-dashed border-[#F5C518] px-2.5 py-1 rounded-full uppercase tracking-wider select-none shrink-0"
      id="zippi-cashback-badge-capsule"
    >
      🪙 {label}
    </span>
  );
}

// ==========================================
// 10. BLUE ACTION BUTTON (primary CTA)
// ==========================================
interface BlueActionButtonProps {
  label: string;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function ZippiBlueActionButton({
  label,
  onClick,
  isLoading = false,
  disabled = false,
  icon,
}: BlueActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full h-[52px] bg-[#1565C0] hover:bg-[#0D47A1] text-white font-extrabold text-sm px-6 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-99 disabled:opacity-50 disabled:cursor-not-allowed`}
      id={`zippi-cta-blue-${label.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <>
          {icon}
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

// ==========================================
// 11. YELLOW ACTION BUTTON (secondary CTA)
// ==========================================
interface YellowActionButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function ZippiYellowActionButton({
  label,
  onClick,
  disabled = false,
  icon,
}: YellowActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full h-11 bg-[#F5C518] hover:bg-[#E0B000] text-[#1A1A1A] font-extrabold text-[12.5px] px-5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-3xs active:scale-99 disabled:opacity-50 disabled:cursor-not-allowed"
      id={`zippi-cta-yellow-${label.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ==========================================
// 12. STEPPER COMPONENT
// ==========================================
interface StepperComponentProps {
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
  disabledIncrement?: boolean;
}

export function ZippiStepper({
  qty,
  onAdd,
  onRemove,
  disabledIncrement = false,
}: StepperComponentProps) {
  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg overflow-hidden h-[34px] w-full" id="zippi-stepper-capsule">
      {/* Decrement / Trash button */}
      <button
        onClick={onRemove}
        className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
        id="stepper-decrement-btn"
      >
        {qty <= 1 ? (
          <Trash2 className="w-4 h-4 text-gray-400" />
        ) : (
          <Minus className="w-3.5 h-3.5 text-gray-500" strokeWidth={3} />
        )}
      </button>

      {/* Numeric feedback count */}
      <span className="font-extrabold text-[#1A1A1A] text-xs select-none px-2 min-w-4 text-center">
        {qty}
      </span>

      {/* Increment button */}
      <button
        disabled={disabledIncrement}
        onClick={onAdd}
        className="w-10 h-full flex items-center justify-center bg-[#F5C518] hover:bg-[#E0B000] text-[#1A1A1A] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        id="stepper-increment-btn"
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={3} />
      </button>
    </div>
  );
}
