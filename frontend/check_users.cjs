const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('agrichain');
        const count = await db.collection('users').countDocuments();
        console.log(`There are ${count} users in the database.`);
        const resUsers = await db.collection('users').deleteMany({});
        const resNonces = await db.collection('nonces').deleteMany({});
        console.log(`Deleted ${resUsers.deletedCount} users.`);
        console.log(`Deleted ${resNonces.deletedCount} nonces.`);
    } finally {
        await client.close();
    }
}
main().catch(console.error);
