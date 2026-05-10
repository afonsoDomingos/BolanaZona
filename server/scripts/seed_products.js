require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const products = [
  { name: 'Camisola Real Madrid 2025', price: 2500, category: 'camisolas', description: 'A mística do Rei da Europa. Tecido original Adidas.', image: 'https://images.unsplash.com/photo-1621245842817-26839352e008?auto=format&fit=crop&q=80&w=400' },
  { name: 'Camisola FC Barcelona 2025', price: 2500, category: 'camisolas', description: 'Mais que um clube. Estilo clássico culé.', image: 'https://images.unsplash.com/photo-1521412644187-c49fa0b4e6a3?auto=format&fit=crop&q=80&w=400' },
  { name: 'Chuteiras Nike Mercurial', price: 4500, category: 'chuteiras', description: 'Velocidade explosiva para o futebol de elite.', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400' },
  { name: 'Bola Profissional Nike Flight', price: 3200, category: 'bolas', description: 'Aerodinâmica superior para remates perfeitos.', image: 'https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?auto=format&fit=crop&q=80&w=400' }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('✅ Loja populada com sucesso!');
    process.exit(0);
  } catch (err) { console.error(err); process.exit(1); }
};

seed();
