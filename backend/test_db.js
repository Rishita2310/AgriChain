const {MongoClient} = require('mongodb'); 
async function main() { 
  const client = new MongoClient('mongodb://localhost:27017'); 
  await client.connect(); 
  const db = client.db('agrichain_core'); 
  const order = await db.collection('orders').findOne({order_id: 'AGR-2827'}); 
  console.log('Order farmer_id:', order.farmer_id); 
  const product = await db.collection('products').findOne({product_id: order.product_id}); 
  console.log('Product wallet_address:', product.wallet_address); 
  console.log('Product farmer_id:', product.farmer_id); 
  const user = await db.collection('users').findOne({wallet_address: {$regex: '^' + product.wallet_address + '$', $options: 'i'}}); 
  console.log('User id:', user._id); 
  console.log('User wallet:', user.wallet_address); 
  await client.close(); 
} 
main();
