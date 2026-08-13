const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

async function main() {
    await client.connect();
    const db = client.db('agrichain_core');
    const users = db.collection('users');
    const user = await users.findOne({ wallet_address: '0xce3589aa1b3aa8c2e49d96c45798f5935ef61d03' });
    console.log(JSON.stringify(user, null, 2));
    client.close();
}

main().catch(console.error);
