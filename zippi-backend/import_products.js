require('dotenv').config();
const supabase = require('./src/config/supabase');
const xlsx = require('xlsx');
const path = require('path');

const EXCEL_PATH = 'e:\\My PROJECT\\Zippi\\Product List\\Choclate\\products.xlsx';

async function importProducts() {
  try {
    const workbook = xlsx.readFile(EXCEL_PATH);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`Found ${data.length} products to import.`);

    if (data.length === 0) {
      console.log('No data found in excel file.');
      return;
    }

    const productsToInsert = data.map(row => {
      return {
        name: row.name,
        description: row.description || null,
        category_slug: row.category_slug,
        price: row.price,
        original_price: row.original_price || null,
        discount_percent: row.discount_percent || null,
        unit: row.unit || '1 piece',
        popular: row.popular === true || row.popular === 'TRUE' || row.popular === 'true',
        is_flash_deal: row.is_flash_deal === true || row.is_flash_deal === 'TRUE' || row.is_flash_deal === 'true',
        stock: row.stock ? parseInt(row.stock, 10) : 0,
        is_active: row.is_active !== false && row.is_active !== 'FALSE' && row.is_active !== 'false'
      };
    });

    console.log('Sample product to insert:', productsToInsert[0]);

    const { data: insertedData, error } = await supabase
      .from('products')
      .insert(productsToInsert);

    if (error) {
      console.error('Error inserting products:', error);
    } else {
      console.log('Successfully imported products!');
    }
  } catch (err) {
    console.error('Failed to import products:', err);
  }
}

importProducts();
