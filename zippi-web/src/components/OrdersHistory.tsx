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
  XSquare,
  FileText,
  Package,
  Truck
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { triggerHapticFeedback } from '../utils';

interface OrdersHistoryProps {
  orders: Order[];
  onTrackOrder: (order: Order) => void;
  onReorder: (order: Order) => void;
  onClearHistory?: () => void;
  onCancelOrder?: (orderId: string) => void;
}

const getStepIndex = (status: OrderStatus): number => {
  switch (status) {
    case 'pending': return 0;
    case 'preparing': return 1;
    case 'dispatched':
    case 'arriving': return 2;
    case 'delivered': return 3;
    default: return -1;
  }
};

export default function OrdersHistory({
  orders,
  onTrackOrder,
  onReorder,
  onClearHistory,
  onCancelOrder,
}: OrdersHistoryProps) {
  const [orderToCancel, setOrderToCancel] = React.useState<Order | null>(null);

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
                    <span className="font-extrabold text-[#1A1A1A] text-[13px]">{order.id}</span>
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

                {/* Real-time Tracking Stepped Progress Bar */}
                {order.status !== 'cancelled' && (
                  <div className="bg-gray-50/50 rounded-xl p-3.5 border border-brand-gray-light" id={`order-track-stepper-${order.id}`}>
                    <div className="flex items-center justify-between mb-3.5 select-none">
                      <span className="text-[9px] uppercase font-black tracking-wider text-[#1A1A1A] flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                        Order Status Track
                      </span>
                      <span className="text-[9px] font-extrabold text-brand-blue bg-brand-blue-light px-2 py-0.5 rounded-md">
                        {order.status === 'pending' && 'Awaiting Dispatch'}
                        {order.status === 'preparing' && 'Assembling Items'}
                        {order.status === 'dispatched' && 'Out with Rider'}
                        {order.status === 'arriving' && 'Nearly There'}
                        {order.status === 'delivered' && 'Package Handed Over'}
                      </span>
                    </div>

                    <div className="relative flex items-center justify-between px-2">
                      {/* Background connecting grey bar */}
                      <div className="absolute left-[24px] right-[24px] top-[14px] h-0.5 bg-gray-200 z-0" />
                      
                      {/* Active green progress path */}
                      <div 
                        className="absolute left-[24px] top-[14px] h-0.5 bg-brand-green z-0 transition-all duration-700 ease-in-out"
                        style={{ 
                          width: `${(getStepIndex(order.status) / 3) * 100}%`,
                          maxWidth: 'calc(100% - 48px)'
                        }}
                      />

                      {/* Stepped milestones */}
                      {[
                        { label: 'Placed', icon: FileText },
                        { label: 'Packing', icon: Package },
                        { label: 'On Way', icon: Truck },
                        { label: 'Delivered', icon: CheckCircle2 }
                      ].map((step, idx) => {
                        const stepIndex = getStepIndex(order.status);
                        const isCompleted = idx < stepIndex;
                        const isCurrent = idx === stepIndex;
                        const StepIcon = step.icon;

                        return (
                          <div key={idx} className="flex flex-col items-center relative z-10 flex-1">
                            <div 
                              className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs ${
                                isCurrent 
                                  ? 'bg-brand-green text-white ring-4 ring-brand-green-light scale-105' 
                                  : isCompleted 
                                  ? 'bg-brand-green text-white' 
                                  : 'bg-white border-2 border-brand-gray-mid text-brand-gray'
                              }`}
                            >
                              <StepIcon className={`w-3.5 h-3.5 ${isCurrent ? 'animate-pulse' : ''}`} />
                            </div>
                            <span 
                              className={`text-[9px] mt-1.5 font-bold transition-colors ${
                                isCurrent 
                                  ? 'text-brand-green font-black' 
                                  : isCompleted 
                                  ? 'text-[#1A1A1A]' 
                                  : 'text-brand-gray'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                <div className="pt-2 border-t border-brand-gray-light flex flex-col gap-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-brand-gray font-semibold">Total Paid</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[11px] font-bold text-[#1A1A1A]">LKR</span>
                      <span className="text-[16px] font-extrabold text-[#1A1A1A] tracking-tight">
                        {order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2.5">
                      {/* Reorder clone button */}
                      <button
                        onClick={() => {
                          onReorder(order);
                          if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
                        }}
                        className="flex-1 bg-brand-yellow-light hover:bg-brand-yellow/20 text-brand-charcoal border border-brand-yellow/50 font-bold text-[11.5px] py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-brand-yellow-hover" />
                        <span>Reorder items</span>
                      </button>

                      {/* Live Track links */}
                      {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                        <button
                          onClick={() => {
                            onTrackOrder(order);
                            if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
                          }}
                          className="flex-1 bg-brand-blue hover:bg-brand-blue-hover text-white font-extrabold text-[11.5px] py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>Track Live Rider</span>
                        </button>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-brand-green gap-1 text-[11.5px] font-bold bg-green-50 rounded-xl border border-brand-green/20 py-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                          <span>Delivered</span>
                        </div>
                      )}
                    </div>

                    {/* Cancel Order Button */}
                    {(order.status === 'pending' || order.status === 'preparing') && (
                      <button
                        onClick={() => {
                          setOrderToCancel(order);
                          if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
                        }}
                        className="w-full bg-red-50 hover:bg-red-100 text-brand-red border border-brand-red/20 font-extrabold text-[11.5px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none mt-0.5"
                      >
                        <XSquare className="w-3.5 h-3.5 text-brand-red" />
                        <span>Cancel Order</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal Overlay */}
      {orderToCancel && (
        <div className="fixed inset-0 bg-brand-charcoal/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="cancel-confirmation-modal">
          <div className="bg-white rounded-2xl w-full max-w-[320px] p-5 shadow-2xl border border-gray-150 animate-scale-up text-center space-y-4">
            <div className="w-11 h-11 bg-red-50 text-brand-red rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <div className="space-y-1 text-center">
              <h4 className="font-extrabold text-[#1A1A1A] text-[13.5px] font-sans uppercase tracking-wide">
                Cancel Your Order?
              </h4>
              <p className="text-[11px] text-brand-gray font-sans font-medium leading-relaxed">
                Are you sure you want to cancel order <span className="font-bold text-brand-charcoal">{orderToCancel.id}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => {
                  setOrderToCancel(null);
                  if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('light');
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-150 text-brand-charcoal font-black text-[11.5px] py-2.5 rounded-xl transition-colors cursor-pointer select-none"
              >
                No, Keep
              </button>
              <button
                onClick={() => {
                  if (onCancelOrder) {
                    onCancelOrder(orderToCancel.id);
                  }
                  setOrderToCancel(null);
                  if (typeof triggerHapticFeedback === 'function') triggerHapticFeedback('success');
                }}
                className="flex-1 bg-brand-red hover:bg-red-600 text-white font-black text-[11.5px] py-2.5 rounded-xl transition-colors shadow-xs cursor-pointer select-none"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
