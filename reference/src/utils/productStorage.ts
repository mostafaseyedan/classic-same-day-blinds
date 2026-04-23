const DB_NAME = 'blinds_admin_db';
const DB_VERSION = 7;
const STORE_PRODUCTS = 'products';
const STORE_RESTOCK = 'restock_history';

// IDs of auto-generated placeholder products to remove on migration
const LEGACY_PRODUCT_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// ── All canonical seed products (IDs 13–18) ────────────────────────────────
const ALL_SEED_PRODUCTS = [
  {
    id: 13,
    name: '1" Vinyl Plus Mini Blind',
    nameEs: 'Persiana Mini de Vinilo Plus 1"',
    price: 38.24,
    originalPrice: 44.99,
    discountType: 'none',
    discountValue: 0,
    rating: 4.7,
    reviews: 1842,
    category: 'mini-blinds',
    badge: 'Customer Favorite',
    inventory: 215,
    lowStockThreshold: 10,
    description: 'Classic 1-inch vinyl plus mini blind — lightweight, moisture-resistant, and built to last. Perfect for kitchens, bathrooms, and offices. Our price is 15% less than Blinds.com.',
    descriptionEs: 'Persiana mini de vinilo plus de 1 pulgada — ligera, resistente a la humedad y duradera. Perfecta para cocinas, baños y oficinas. Nuestro precio es 15% menos que Blinds.com.',
    image: 'https://static.readdy.ai/image/10fa40ccc8b6597759995e1d60c86977/3810d66815da2028a41caca8c339b3f7.png',
    images: ['https://static.readdy.ai/image/10fa40ccc8b6597759995e1d60c86977/3810d66815da2028a41caca8c339b3f7.png'],
    colorOptions: [],
  },
  {
    id: 14,
    name: '1" Aluminum Business Class',
    nameEs: 'Persiana de Aluminio Business Class 1"',
    price: 46.74,
    originalPrice: 54.99,
    discountType: 'none',
    discountValue: 0,
    rating: 4.8,
    reviews: 976,
    category: 'aluminum-blinds',
    badge: 'Best Value',
    inventory: 133,
    lowStockThreshold: 10,
    description: 'Heavy-duty commercial-grade 1-inch aluminum mini blind with reinforced headrail and precision tilt mechanism. Built for offices, clinics, and high-traffic spaces. 15% less than Blinds.com.',
    descriptionEs: 'Persiana de aluminio de uso rudo de 1 pulgada con riel reforzado y mecanismo de inclinación de precisión. Diseñada para oficinas, clínicas y espacios de alto tráfico. 15% menos que Blinds.com.',
    image: 'https://readdy.ai/api/search-image?query=Premium%20commercial%20grade%20aluminum%20mini%20blinds%20in%20silver%20gray%20installed%20in%20a%20professional%20office%20space%2C%20reinforced%20headrail%2C%20horizontal%20metal%20slats%2C%20clean%20corporate%20interior%20with%20white%20walls%2C%20professional%20product%20photography%2C%20business%20environment%2C%20controlled%20light%2C%20crisp%20modern%20look&width=400&height=500&seq=blind-014&orientation=portrait',
    images: ['https://readdy.ai/api/search-image?query=Premium%20commercial%20grade%20aluminum%20mini%20blinds%20in%20silver%20gray%20installed%20in%20a%20professional%20office%20space%2C%20reinforced%20headrail%2C%20horizontal%20metal%20slats%2C%20clean%20corporate%20interior%20with%20white%20walls%2C%20professional%20product%20photography%2C%20business%20environment%2C%20controlled%20light%2C%20crisp%20modern%20look&width=400&height=500&seq=blind-014&orientation=portrait'],
    colorOptions: [],
  },
  {
    id: 15,
    name: '1" Vinyl Mini Blind',
    nameEs: 'Persiana Mini de Vinilo 1"',
    price: 33.14,
    originalPrice: 38.99,
    discountType: 'none',
    discountValue: 0,
    rating: 4.6,
    reviews: 2104,
    category: 'mini-blinds',
    badge: 'Best Value',
    inventory: 318,
    lowStockThreshold: 10,
    description: 'Affordable and reliable 1-inch vinyl mini blind — a household classic. Light-filtering slats with easy tilt control. Our price is 15% less than Blinds.com.',
    descriptionEs: 'Persiana mini de vinilo de 1 pulgada asequible y confiable — un clásico del hogar. Lamas filtrantes de luz con fácil control de inclinación. Nuestro precio es 15% menos que Blinds.com.',
    image: 'https://readdy.ai/api/search-image?query=Simple%20affordable%201%20inch%20white%20vinyl%20mini%20window%20blinds%20installed%20on%20a%20sunny%20living%20room%20window%2C%20horizontal%20slats%20partially%20tilted%20open%2C%20clean%20bright%20home%20interior%20with%20neutral%20walls%2C%20classic%20practical%20window%20treatment%2C%20warm%20daylight%20coming%20through%2C%20professional%20product%20photography%2C%20cozy%20residential%20setting&width=400&height=500&seq=blind-015&orientation=portrait',
    images: ['https://readdy.ai/api/search-image?query=Simple%20affordable%201%20inch%20white%20vinyl%20mini%20window%20blinds%20installed%20on%20a%20sunny%20living%20room%20window%2C%20horizontal%20slats%20partially%20tilted%20open%2C%20clean%20bright%20home%20interior%20with%20neutral%20walls%2C%20classic%20practical%20window%20treatment%2C%20warm%20daylight%20coming%20through%2C%20professional%20product%20photography%2C%20cozy%20residential%20setting&width=400&height=500&seq=blind-015&orientation=portrait'],
    colorOptions: [],
  },
  {
    id: 16,
    name: '1" Aluminum Blinds',
    nameEs: 'Persiana de Aluminio 1"',
    price: 23.55,
    originalPrice: 27.71,
    discountType: 'none',
    discountValue: 0,
    rating: 4.5,
    reviews: 1653,
    category: 'aluminum-blinds',
    badge: 'Best Value',
    inventory: 289,
    lowStockThreshold: 10,
    description: 'Durable 1-inch aluminum mini blinds — moisture-proof, warp-resistant, and ideal for kitchens, bathrooms, and garages. 15% less than Blinds.com every day.',
    descriptionEs: 'Persianas de aluminio de 1 pulgada duraderas — resistentes a la humedad, anti-deformación e ideales para cocinas, baños y garajes. 15% menos que Blinds.com todos los días.',
    image: 'https://readdy.ai/api/search-image?query=Durable%201%20inch%20aluminum%20mini%20blinds%20in%20bright%20silver%20white%20installed%20in%20a%20clean%20modern%20bathroom%20window%2C%20horizontal%20metal%20slats%20with%20wand%20control%2C%20moisture%20resistant%20window%20treatment%2C%20white%20tiled%20bathroom%20interior%2C%20professional%20product%20photography%2C%20crisp%20clean%20lighting%2C%20simple%20residential%20setting&width=400&height=500&seq=blind-016&orientation=portrait',
    images: ['https://readdy.ai/api/search-image?query=Durable%201%20inch%20aluminum%20mini%20blinds%20in%20bright%20silver%20white%20installed%20in%20a%20clean%20modern%20bathroom%20window%2C%20horizontal%20metal%20slats%20with%20wand%20control%2C%20moisture%20resistant%20window%20treatment%2C%20white%20tiled%20bathroom%20interior%2C%20professional%20product%20photography%2C%20crisp%20clean%20lighting%2C%20simple%20residential%20setting&width=400&height=500&seq=blind-016&orientation=portrait'],
    colorOptions: [],
  },
  {
    id: 17,
    name: 'Roller Shades',
    nameEs: 'Persianas Enrollables',
    price: 54.99,
    originalPrice: 64.99,
    discountType: 'none',
    discountValue: 0,
    rating: 4.8,
    reviews: 1247,
    category: 'roller-shades',
    badge: 'Best Value',
    inventory: 175,
    lowStockThreshold: 10,
    description: 'Clean, modern roller shades that deliver smooth light control and timeless style. Perfect for dining rooms, bedrooms, and living spaces. Easy to operate, durable fabric, and available in custom sizes. Our price is 15% less than Blinds.com.',
    descriptionEs: 'Persianas enrollables modernas y elegantes para un control de luz suave y un estilo atemporal. Perfectas para comedores, dormitorios y salas de estar. Fácil de operar, tela duradera y disponibles en tamaños personalizados. Nuestro precio es 15% menos que Blinds.com.',
    image: 'https://storage.readdy-site.link/project_files/0f1e2c1b-eb20-4554-bb99-6e317514fabb/f44c9549-be70-4eda-899a-b185538fa921_1-vinyl.jpeg?v=17c593e4453b6fd8675307fc84c8b824',
    images: ['https://storage.readdy-site.link/project_files/0f1e2c1b-eb20-4554-bb99-6e317514fabb/f44c9549-be70-4eda-899a-b185538fa921_1-vinyl.jpeg?v=17c593e4453b6fd8675307fc84c8b824'],
    colorOptions: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Ivory', hex: '#FFFFF0' },
      { name: 'Gray', hex: '#9CA3AF' },
      { name: 'Beige', hex: '#D4B896' },
    ],
  },
  {
    id: 18,
    name: 'Standard Vertical Blind',
    nameEs: 'Persiana Vertical Estándar',
    price: 42.99,
    originalPrice: 50.99,
    discountType: 'none',
    discountValue: 0,
    rating: 4.6,
    reviews: 1389,
    category: 'vertical-blinds',
    badge: 'Best Value',
    inventory: 246,
    lowStockThreshold: 10,
    description: 'Classic standard vertical blind — ideal for sliding glass doors, large windows, and patio entrances. Smooth tilt and traverse control, durable PVC vanes, and easy installation. Our price is 15% less than Blinds.com.',
    descriptionEs: 'Persiana vertical estándar clásica — ideal para puertas de cristal corredizas, ventanas grandes y entradas de patio. Control de inclinación y travesía suave, lamas de PVC duraderas y fácil instalación. Nuestro precio es 15% menos que Blinds.com.',
    image: 'https://readdy.ai/api/search-image?query=Classic%20white%20PVC%20vertical%20blinds%20installed%20on%20a%20large%20sliding%20glass%20patio%20door%20in%20a%20bright%20modern%20living%20room%2C%20vertical%20fabric%20vanes%20hanging%20straight%2C%20clean%20contemporary%20interior%20with%20light%20wood%20floors%2C%20warm%20natural%20daylight%20filtering%20through%20the%20slats%2C%20professional%20interior%20product%20photography%2C%20neutral%20wall%20color%2C%20spacious%20residential%20setting%2C%20crisp%20and%20elegant%20window%20treatment&width=400&height=500&seq=blind-018&orientation=portrait',
    images: ['https://readdy.ai/api/search-image?query=Classic%20white%20PVC%20vertical%20blinds%20installed%20on%20a%20large%20sliding%20glass%20patio%20door%20in%20a%20bright%20modern%20living%20room%2C%20vertical%20fabric%20vanes%20hanging%20straight%2C%20clean%20contemporary%20interior%20with%20light%20wood%20floors%2C%20warm%20natural%20daylight%20filtering%20through%20the%20slats%2C%20professional%20interior%20product%20photography%2C%20neutral%20wall%20color%2C%20spacious%20residential%20setting%2C%20crisp%20and%20elegant%20window%20treatment&width=400&height=500&seq=blind-018&orientation=portrait'],
    colorOptions: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Ivory', hex: '#FFFFF0' },
      { name: 'Bone', hex: '#E8E0D0' },
      { name: 'Gray', hex: '#9CA3AF' },
      { name: 'Taupe', hex: '#B09080' },
      { name: 'Charcoal', hex: '#4B5563' },
    ],
  },
];

// Keep backward-compat alias
const ROLLER_SHADES_SEED = ALL_SEED_PRODUCTS[4];

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      const tx = (e.target as IDBOpenDBRequest).transaction;
      const oldVersion = e.oldVersion;

      if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
        db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_RESTOCK)) {
        db.createObjectStore(STORE_RESTOCK, { keyPath: 'id' });
      }

      if (tx) {
        const store = tx.objectStore(STORE_PRODUCTS);

        if (oldVersion === 0) {
          // Fresh install — seed all canonical products immediately
          ALL_SEED_PRODUCTS.forEach((p) => store.put(p));
        } else {
          // v1 → v2: purge legacy placeholder products
          if (oldVersion >= 1 && oldVersion < 2) {
            LEGACY_PRODUCT_IDS.forEach((id) => store.delete(id));
          }
          // v1–v4 → v5: ensure all seed products exist (including new ID 18)
          if (oldVersion < 5) {
            ALL_SEED_PRODUCTS.forEach((seed) => {
              const checkReq = store.get(seed.id);
              checkReq.onsuccess = () => {
                if (!checkReq.result) {
                  store.put(seed);
                }
              };
            });
          }
          // v5 → v6: force-update image + badge for product 13
          if (oldVersion < 6) {
            const getReq = store.get(13);
            getReq.onsuccess = () => {
              if (getReq.result) {
                store.put({
                  ...getReq.result,
                  image: 'https://static.readdy.ai/image/10fa40ccc8b6597759995e1d60c86977/3810d66815da2028a41caca8c339b3f7.png',
                  images: ['https://static.readdy.ai/image/10fa40ccc8b6597759995e1d60c86977/3810d66815da2028a41caca8c339b3f7.png'],
                  badge: 'Customer Favorite',
                });
              }
            };
          }
          // v6 → v7: force-update image for product 17 (hero featured product)
          if (oldVersion < 7) {
            const getReq17 = store.get(17);
            getReq17.onsuccess = () => {
              if (getReq17.result) {
                store.put({
                  ...getReq17.result,
                  image: 'https://storage.readdy-site.link/project_files/0f1e2c1b-eb20-4554-bb99-6e317514fabb/f44c9549-be70-4eda-899a-b185538fa921_1-vinyl.jpeg?v=17c593e4453b6fd8675307fc84c8b824',
                  images: ['https://storage.readdy-site.link/project_files/0f1e2c1b-eb20-4554-bb99-6e317514fabb/f44c9549-be70-4eda-899a-b185538fa921_1-vinyl.jpeg?v=17c593e4453b6fd8675307fc84c8b824'],
                });
              }
            };
          }
        }
      }
    };
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadProductsFromDB(): Promise<any[] | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PRODUCTS, 'readonly');
      const req = tx.objectStore(STORE_PRODUCTS).getAll();
      req.onsuccess = () => resolve(req.result && req.result.length > 0 ? req.result : null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Could not load products from IndexedDB:', e);
    return null;
  }
}

export async function saveProductsToDB(prods: any[]): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PRODUCTS, 'readwrite');
      const store = tx.objectStore(STORE_PRODUCTS);
      store.clear();
      prods.forEach((p) => store.put(p));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('Could not save products to IndexedDB:', e);
  }
}

export async function loadRestockFromDB(): Promise<any[] | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RESTOCK, 'readonly');
      const req = tx.objectStore(STORE_RESTOCK).getAll();
      req.onsuccess = () => resolve(req.result && req.result.length > 0 ? req.result : null);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Could not load restock history from IndexedDB:', e);
    return null;
  }
}

export async function saveRestockToDB(entries: any[]): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RESTOCK, 'readwrite');
      const store = tx.objectStore(STORE_RESTOCK);
      store.clear();
      entries.forEach((e) => store.put(e));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn('Could not save restock history to IndexedDB:', e);
  }
}
