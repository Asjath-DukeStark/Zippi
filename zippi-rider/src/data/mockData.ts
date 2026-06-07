/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, EarningsRecord } from '../types';

export const INITIAL_EARNINGS: EarningsRecord[] = [
  {
    id: 'ZP-9801',
    address: '32 Park Street, Colombo 02',
    amount: 450,
    time: '08:15 AM',
    date: 'Today',
  },
  {
    id: 'ZP-9754',
    address: '124 Galle Road, Bambalapitiya',
    amount: 620,
    time: '09:40 AM',
    date: 'Today',
  },
  {
    id: 'ZP-9611',
    address: '22 Havelock Road, Colombo 05',
    amount: 380,
    time: 'Yesterday',
    date: 'This Week',
  },
  {
    id: 'ZP-9502',
    address: '422 Kaduwela Road, Malabe',
    amount: 850,
    time: '02:15 PM',
    date: 'This Week',
  },
  {
    id: 'ZP-9120',
    address: '94 Negombo Road, Wattala',
    amount: 1100,
    time: '06:30 PM',
    date: 'This Month',
  },
  {
    id: 'ZP-8941',
    address: '15 R.A. De Mel Mawatha, Colombo 03',
    amount: 490,
    time: '11:10 AM',
    date: 'This Month',
  },
];

export const SAMPLE_ASSIGNABLE_ORDERS: Omit<Order, 'status'>[] = [
  {
    id: 'ZP-3042',
    storeName: 'Zippi Kollupitiya Grocery Hub',
    storeAddress: '182 Galle Road, Colombo 03',
    storeLocation: { latitude: 6.9145, longitude: 79.8492 }, // Kollupitiya
    customerName: 'Ahamed Asjath',
    customerPhone: '+94 77 123 4567',
    customerAddress: '43 Marina Drive, Wellawatte, Colombo 06',
    customerLocation: { latitude: 6.8710, longitude: 79.8601 }, // Wellawatte
    distance: 4.8,
    payout: 680,
    time: 'Now',
    date: 'Today',
  },
  {
    id: 'ZP-4115',
    storeName: 'Zippi Fort Grocery Hub',
    storeAddress: '44 Union Place, Colombo 02',
    storeLocation: { latitude: 6.9230, longitude: 79.8560 }, // Union Place
    customerName: 'Fiona Senanayake',
    customerPhone: '+94 71 998 8122',
    customerAddress: '12/A Ward Place, Colombo 07',
    customerLocation: { latitude: 6.9168, longitude: 79.8687 }, // Town Hall / Ward Place
    distance: 2.1,
    payout: 350,
    time: 'Now',
    date: 'Today',
  },
  {
    id: 'ZP-1088',
    storeName: 'Zippi Borella Grocery Hub',
    storeAddress: '88 Borella Cross Road, Colombo 08',
    storeLocation: { latitude: 6.9295, longitude: 79.8787 }, // Borella
    customerName: 'Ravindu Perera',
    customerPhone: '+94 75 444 1990',
    customerAddress: '24 Galle Face Terrace, Colombo 03',
    customerLocation: { latitude: 6.9205, longitude: 79.8465 }, // Galle Face
    distance: 5.2,
    payout: 820,
    time: 'Now',
    date: 'Today',
  },
  {
    id: 'ZP-5524',
    storeName: 'Zippi Horton Place Grocery Hub',
    storeAddress: '60 Horton Place, Colombo 07',
    storeLocation: { latitude: 6.9118, longitude: 79.8745 }, // Horton Place
    customerName: 'Sarah Alwis',
    customerPhone: '+94 72 888 2341',
    customerAddress: '77 Dharmapala Mawatha, Colombo 03',
    customerLocation: { latitude: 6.9125, longitude: 79.8540 }, // Liberty Plaza area
    distance: 2.6,
    payout: 410,
    time: 'Now',
    date: 'Today',
  }
];

export const DEFAULT_RIDER_PROFILE = {
  name: 'Pradeep Silva',
  phone: '+94 77 982 4511',
  vehicle: 'Honda Hornet 160R (WP-BBL-2015)',
  rating: 4.85,
  totalDeliveries: 1242,
};
