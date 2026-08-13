const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

async function main() {
    await client.connect();
    const db = client.db('agrichain_core');
    const users = db.collection('users');
    const allUsers = await users.find({}).toArray();
    console.log(`Found ${allUsers.length} users.`);
    for (const user of allUsers) {
        console.log(`User: ${user.wallet_address}, Role: ${user.role}, Status: ${user.status}, IsVerified: ${user.is_verified}`);
        console.log('  FarmerDetails:', user.farmer_details);
        console.log('  BuyerDetails:', user.buyer_details);
        if (!user.role || (user.role !== 'Farmer' && user.role !== 'Buyer' && user.role !== 'Admin')) {
            console.log('WARNING: Invalid role format:', user.role);
        }
        if (typeof user.is_verified !== 'boolean') {
             console.log('WARNING: is_verified is not a boolean:', user.is_verified);
        }
        if (typeof user.status !== 'string') {
             console.log('WARNING: status is not a string:', user.status);
        }
        // check farmer details fields
        if (user.farmer_details && user.farmer_details.organic_farming !== undefined && typeof user.farmer_details.organic_farming !== 'boolean') {
             console.log('WARNING: organic_farming is not a boolean:', user.farmer_details.organic_farming);
        }
    }
    client.close();
}

main().catch(console.error);
