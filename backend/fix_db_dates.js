const { MongoClient } = require('mongodb');

async function fixDates() {
    const client = new MongoClient('mongodb://localhost:27017');
    try {
        await client.connect();
        const db = client.db('agrichain');
        
        // Fix Products
        const products = await db.collection('products').find({}).toArray();
        for (const p of products) {
            let updates = {};
            if (p.created_at instanceof Date) updates.created_at = p.created_at.toISOString();
            if (p.updated_at instanceof Date) updates.updated_at = p.updated_at.toISOString();
            
            if (Object.keys(updates).length > 0) {
                await db.collection('products').updateOne({ _id: p._id }, { $set: updates });
                console.log(`Fixed product ${p._id}`);
            }
        }

        // Fix Users
        const users = await db.collection('users').find({}).toArray();
        for (const u of users) {
            let updates = {};
            if (u.created_at instanceof Date) updates.created_at = u.created_at.toISOString();
            if (u.updated_at instanceof Date) updates.updated_at = u.updated_at.toISOString();
            
            if (Object.keys(updates).length > 0) {
                await db.collection('users').updateOne({ _id: u._id }, { $set: updates });
                console.log(`Fixed user ${u._id}`);
            }
        }
        console.log("Database dates normalized to strings successfully.");
    } finally {
        await client.close();
    }
}

fixDates().catch(console.error);
