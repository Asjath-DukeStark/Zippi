const fs = require('fs');
const path = require('path');
const https = require('https');

const products = [
  { id: 'f1', keyword: 'banana' },
  { id: 'f2', keyword: 'grapes' },
  { id: 'f3', keyword: 'papaya' },
  { id: 'v1', keyword: 'carrots' },
  { id: 'v2', keyword: 'tomato' },
  { id: 'v3', keyword: 'broccoli' },
  { id: 'd1', keyword: 'butter' },
  { id: 'd2', keyword: 'eggs' },
  { id: 'd3', keyword: 'milk' },
  { id: 'b1', keyword: 'bread' },
  { id: 'b2', keyword: 'croissant' },
  { id: 'm1', keyword: 'chicken,breast' },
  { id: 'm2', keyword: 'tuna,fish' },
  { id: 'p1', keyword: 'rice,grain' },
  { id: 'p2', keyword: 'coconut,oil' },
  { id: 'be1', keyword: 'tea,bag' },
  { id: 'be2', keyword: 'coconut' },
  { id: 's1', keyword: 'cashews' },
  { id: 's2', keyword: 'candy' },
  { id: 'fr1', keyword: 'french,fries' },
  { id: 'fr2', keyword: 'green,peas' },
  { id: 'cl1', keyword: 'cleaning,spray' },
  { id: 'cl2', keyword: 'soap,liquid' },
  { id: 't1_anchor', keyword: 'milk,carton' },
  { id: 't1_delmege_basmati', keyword: 'rice' },
  { id: 't1_coke', keyword: 'cola,can' },
  { id: 't1_maliban_crackers', keyword: 'crackers' },
  { id: 't1_sunlight', keyword: 'dishwash,liquid' },
  { id: 't1_parachute_oil', keyword: 'coconut,oil' },
  { id: 't1_munchee_puff', keyword: 'cookies' },
  { id: 't1_surf_excel', keyword: 'detergent' },
  { id: 't1_delmege_juice', keyword: 'orange,juice' },
  { id: 't1_araliya_basmati', keyword: 'rice,bag' },
  { id: 't2_carrots', keyword: 'carrot' },
  { id: 't2_tomatoes', keyword: 'tomato' },
  { id: 't2_spinach', keyword: 'spinach' },
  { id: 't2_bananas', keyword: 'bananas' },
  { id: 't2_apples', keyword: 'apple' },
  { id: 't2_chicken', keyword: 'chicken' },
  { id: 't2_eggs', keyword: 'egg' },
  { id: 't2_yogurt', keyword: 'yogurt' },
  { id: 't2_bread', keyword: 'bread' },
  { id: 't2_cheese', keyword: 'cheese' },
  { id: 'fd_milo', keyword: 'cocoa,drink' },
  { id: 'fd_nestomalt', keyword: 'malt,drink' },
  { id: 'fd_cream_soda', keyword: 'green,soda' },
  { id: 'fd_kfc_chicken', keyword: 'fried,chicken' },
  { id: 'fd_delmege_pasta', keyword: 'pasta' },
  { id: 'fd_maggi_noodles', keyword: 'noodles' },
  { id: 'fd_pringles', keyword: 'potato,chips' },
  { id: 'fd_anchor_butter', keyword: 'butter,block' },
  { id: 'fd_ovaltine', keyword: 'chocolate,drink' },
  { id: 'fd_harpic', keyword: 'cleaner,bottle' }
];

const destDir = path.join(__dirname, '..', 'public', 'products');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (Status Code: ${response.statusCode})`));
        return;
      }

      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function start() {
  console.log(`Downloading ${products.length} product images to ${destDir}...`);
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const filename = `product-${p.id}.jpg`;
    const destPath = path.join(destDir, filename);
    const url = `https://loremflickr.com/320/320/${encodeURIComponent(p.keyword)}`;

    try {
      console.log(`[${i + 1}/${products.length}] Downloading image for '${p.id}' (keyword: '${p.keyword}')...`);
      await downloadImage(url, destPath);
    } catch (err) {
      console.error(`Error downloading image for '${p.id}': ${err.message}`);
    }
  }
  console.log('All product images downloaded successfully!');
}

start();
