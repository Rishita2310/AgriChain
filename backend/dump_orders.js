const { MongoClient } = require('mongodb');

async function main() {
    const uri = 'mongodb://localhost:27017';
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('agrichain_core');
        const count = await db.collection('orders').countDocuments();
        const orders = await db.collection('orders').find().sort({ _id: -1 }).limit(1).toArray();
        console.log(`Total orders in agrichain_core: ${count}`);
        console.log(JSON.stringify(orders, null, 2));
    } finally {
        await client.close();
    }
}

main().catch(console.error);
