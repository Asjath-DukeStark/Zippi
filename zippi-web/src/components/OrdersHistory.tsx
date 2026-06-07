/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  History, 
  ChevronRight, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ShoppingBag, 
  RefreshCw,
  Star,
  XSquare
} from 'lucide-react';
import { Order } from '../types';

interface OrdersHistoryProps {
  orders: Order[];
  onTrackOrder: (order: Order) => void;
  onReorder: (order: Order) => void;
  onClearHistory?: () => void;
}

export default function OrdersHistory({
  orders,
  onTrackOrder,
  onReorder,
  onClearHistory,
}: OrdersHistoryProps) {
  return (
    <div className="bg-white border-t border-brand-gray-light p-4" id="orders-history-box">
      
      {/* Title Segment */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <History className="w-4.5 h-4.5 text-brand-charcoal" />
          <h3 className="font-extrabold text-sm text-brand-charcoal uppercase tracking-wider">My Zippi Orders</h3>
        </div>
        {orders.length > 0 && onClearHistory && (
          <button 
            onClick={onClearHistory}
            className="text-[10px] text-brand-red font-bold hover:underline bg-red-50 px-2 py-1 rounded cursor-pointer"
          >
            Clear Log
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="bg-gray-50 border border-dashed border-brand-gray-mid rounded-xl p-6 text-center space-y-2">
          <span className="text-2xl">📦</span>
          <p className="font-bold text-xs text-brand-charcoal">No order history found</p>
          <p className="text-[10px] text-brand-gray max-w-[220px] mx-auto">
            Your placed orders, delivery tracking stats, and receipts will be logged right here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const dateStr = new Date(order.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div 
                key={order.id} 
                className="bg-white border border-brand-gray-light rounded-xl p-3.5 space-y-3.5 hover:border-brand-gray-mid transition-all shadow-xs"
                id={`history-row-${order.id}`}
              >
                
                {/* ID line, status and timestamp badge */}
                <div className="flex justify-between items-start gap-1">
                  <div>
                    <span className="font-extrabold text-brand-charcoal text-[13px]">{order.id}</span>
                    <p className="text-[10px] text-brand-gray font-medium mt-0.5">{dateStr}</p>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md tracking-wider ${
                      order.status === 'delivered' 
                        ? 'bg-brand-green-light text-brand-green' 
                        : order.status === 'cancelled'
                        ? 'bg-red-50 text-brand-red'
                        : 'bg-brand-yellow-light text-brand-yellow-hover border border-brand-yellow/30'
                    }`}>
                      {order.status}
                    </span>
                    
                    <span className="text-[9px] text-brand-gray font-medium mt-1">
                      {order.paymentMethod === 'COD' ? '💵 COD ' : '💳 ONLINE CARD'}
                    </span>
                  </div>
                </div>

                {/* mini summary of items */}
                <div className="bg-gray-50 rounded-lg p-2.5 space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={`${order.id}-item-${idx}`} className="flex justify-between text-[11px] text-brand-charcoal">
                      <span className="line-clamp-1 flex-grow font-medium">
                        {item.product.name}
                      </span>
                      <span className="text-brand-gray font-semibold flex-shrink-0 ml-4">
                        Qty {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price calculations and track triggers */}
                <div className="flex justify-between items-center pt-2 border-t border-brand-gray-light">
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-[10px] text-brand-gray font-semibold">Total paid:</span>
                    <span className="text-[11px] font-bold text-brand-charcoal ml-1">LKR</span>
                    <span className="text-sm font-extrabold text-brand-charcoal tracking-tight">
                      {order.total.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {/* Reorder clone button */}
                    <button
                      onClick={() => onReorder(order)}
                      className="bg-brand-yellow-light hover:bg-brand-yellow/20 text-brand-charcoal border border-brand-yellow/50 font-bold text-[10.5px] py-1.5 px-2.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer select-none"
                    >
                      <RefreshCw className="w-3 h-3 text-brand-yellow-hover" />
                      <span>Reorder items</span>
                    </button>

                    {/* Live Track links */}
                    {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                      <button
                        onClick={() => onTrackOrder(order)}
                        className="bg-brand-blue hover:bg-brand-blue-hover text-white font-extrabold text-[10.5px] py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      >
                        <Clock className="w-3 h-3 animate-pulse" />
                        <span>Track Live Rider</span>
                      </button>
                    ) : (
                      <div className="flex items-center text-brand-green gap-0.5 text-[10.5px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                        <span>Ready</span>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}
      
    </div>
  );
}
