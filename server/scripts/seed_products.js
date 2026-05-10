require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const products = [
  { name: 'Camisola Oficial 2026', price: 1500, category: 'camisolas', description: 'Tecido premium respirável para alta performance.', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=400' },
  { name: 'Personalização de Equipas', price: 2500, category: 'personalizados', description: 'Kit completo (Camisola + Calção) com o teu logo e nome.', image: 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&q=80&w=400' },
  { name: 'Chuteiras Predator Pro', price: 4500, category: 'chuteiras', description: 'Máxima precisão e controlo de bola.', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400' },
  { name: 'Meias Compressão Elite', price: 350, category: 'meias', description: 'Evita lesões e melhora a circulação.', image: 'https://images.unsplash.com/photo-1582035305106-96b6d8591864?auto=format&fit=crop&q=80&w=400' },
  { name: 'Troféu "O Campeão"', price: 1200, category: 'trofeus', description: 'Acabamento em ouro polido.', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=400' },
  { name: 'Bola de Jogo FIFA Quality', price: 1800, category: 'bolas', description: 'A bola oficial para torneios profissionais.', image: 'https://images.unsplash.com/photo-1552667466-07f704e139bd?auto=format&fit=crop&q=80&w=400' },
  { name: 'Kit Coletes de Treino (10un)', price: 1000, category: 'treino', description: 'Resistentes e fáceis de lavar.', image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=400' }
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
