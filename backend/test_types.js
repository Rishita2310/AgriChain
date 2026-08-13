const {MongoClient} = require('mongodb'); 
async function main() { 
  const client = new MongoClient('mongodb://localhost:27017'); 
  await client.connect(); 
  const db = client.db('agrichain_core'); 
  const order = await db.collection('orders').findOne({order_id: 'AGR-2827'}); 
  console.log(typeof order.quantity); 
  console.log(typeof order.payment.product_price);
  await client.close(); 
} 
main();
