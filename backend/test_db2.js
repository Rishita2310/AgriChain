const {MongoClient} = require('mongodb'); 
async function main() { 
  const client = new MongoClient('mongodb://localhost:27017'); 
  await client.connect(); 
  const db = client.db('agrichain_core'); 
  const wallet = '0x6ed6148e8d105b3e229296d3746efd93365b9422';
  const filter = { $or: [ { farmer_id: { $regex: '^' + wallet + '$', $options: 'i' } }, { farmer_id: '6a749f82e78fd38a6785e71c' } ] };
  const orders = await db.collection('orders').find(filter).toArray(); 
  console.log('Orders found:', orders.length); 
  await client.close(); 
} 
main();
