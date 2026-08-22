const db = require('./db');

const products = [
  { name: 'Running Shoes - Sprint X', price: 2499, stock: 12, spec: 'Lightweight mesh, cushioned sole', variant: 'Size 9, Black' },
  { name: 'Running Shoes - Sprint X', price: 2499, stock: 5, spec: 'Lightweight mesh, cushioned sole', variant: 'Size 10, Black' },
  { name: 'Wireless Earbuds - PulseBeat', price: 1899, stock: 20, spec: '24hr battery, ANC', variant: 'White' },
  { name: 'Wireless Earbuds - PulseBeat', price: 1899, stock: 0, spec: '24hr battery, ANC', variant: 'Black' },
  { name: 'Smartwatch - OrbitFit', price: 3999, stock: 8, spec: 'Heart rate + SpO2 monitor', variant: '42mm, Silver' },
  { name: 'Backpack - TrailPro 30L', price: 1599, stock: 15, spec: 'Water-resistant, laptop sleeve', variant: 'Grey' },
  { name: 'Bluetooth Speaker - BoomCube', price: 1299, stock: 10, spec: '12hr playback, waterproof', variant: 'Blue' },
  { name: 'Yoga Mat - FlexCore', price: 799, stock: 25, spec: '6mm thickness, non-slip', variant: 'Purple' },
  { name: 'Office Chair - ErgoSit', price: 6999, stock: 4, spec: 'Lumbar support, mesh back', variant: 'Black' },
  { name: 'Table Lamp - GlowStand', price: 999, stock: 18, spec: 'LED, 3 brightness levels', variant: 'White' },
  { name: 'Water Bottle - HydroFlask 1L', price: 599, stock: 30, spec: 'Insulated stainless steel', variant: 'Green' },
  { name: 'Laptop Sleeve - SlimGuard 14"', price: 499, stock: 22, spec: 'Neoprene, shockproof', variant: 'Grey' },
  { name: 'Mechanical Keyboard - ClickPro', price: 3499, stock: 6, spec: 'Blue switches, RGB backlight', variant: 'Black' },
  { name: 'Wireless Mouse - GlideMax', price: 899, stock: 14, spec: '2.4GHz, ergonomic', variant: 'Black' },
  { name: 'Desk Organizer - TidyBox', price: 449, stock: 20, spec: 'Bamboo, 5 compartments', variant: 'Natural wood' }
];

db.exec('DELETE FROM products');

const insert = db.prepare(`
  INSERT INTO products (name, price, stock, spec, variant)
  VALUES (?, ?, ?, ?, ?)
`);

for (const p of products) {
  insert.run(p.name, p.price, p.stock, p.spec, p.variant);
}

console.log(`Seeded ${products.length} products into catalog.db`);