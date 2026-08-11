const { MongoClient } = require('mongodb');

async function checkProducts() {
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const db = client.db('agrichain');
        const products = await db.collection('products').find({}).toArray();
        console.log("Total Products:", products.length);
        if (products.length > 0) {
            console.log("Sample Product 1:");
            console.log(products[0]);
        }
    } finally {
        await client.close();
    }
}

checkProducts().catch(console.error);
