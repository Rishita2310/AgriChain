import { ethers } from "ethers";
import axios from "axios";

async function main() {
    try {
        const wallet = ethers.Wallet.createRandom();
        console.log("Wallet address:", wallet.address);

        // 0. Register
        console.log("Registering...");
        try {
            const regRes = await axios.post('http://localhost:3000/api/auth/register', {
                wallet_address: wallet.address,
                role: "Farmer",
                full_name: "Test User",
                email: "test@example.com",
                phone_number: "1234567890",
                country: "US",
                state: "NY",
                city: "New York",
                preferred_language: "English"
            });
            console.log("Register Res:", regRes.data);
        } catch (e) {
            console.log("Register failed:", e.response?.data || e.message);
            return;
        }

        // 1. Request nonce
        console.log("Requesting nonce...");
        const reqRes = await axios.post('http://localhost:3000/api/auth/login/request', {
            wallet_address: wallet.address,
        });
        const { nonce, message } = reqRes.data;
        console.log("Nonce:", nonce);

        // 2. Sign message
        console.log("Signing message...");
        const signature = await wallet.signMessage(message);

        // 3. Verify
        console.log("Verifying...");
        const verifyRes = await axios.post('http://localhost:3000/api/auth/login/verify', {
            wallet_address: wallet.address,
            signature: signature,
        });
        console.log("Verify Response:", verifyRes.data);

        // 4. Get profile
        console.log("Getting profile...");
        const profileRes = await axios.get('http://localhost:3000/api/auth/profile', {
            headers: { Authorization: `Bearer ${verifyRes.data.token}` }
        });
        console.log("Profile Response:", profileRes.data.wallet_address);

    } catch (err) {
        if (err.response) {
            console.error("HTTP Error:", err.response.status, err.response.data);
        } else {
            console.error("Error:", err.message);
        }
    }
}

main();
