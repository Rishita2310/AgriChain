const ethers = require("ethers");
const axios = require("axios");

async function main() {
    try {
        const wallet = ethers.Wallet.createRandom();
        console.log("Wallet address:", wallet.address);

        // 1. Request nonce
        console.log("Requesting nonce...");
        const reqRes = await axios.post('http://localhost:3000/api/auth/login/request', {
            wallet_address: wallet.address,
        });
        const { nonce, message } = reqRes.data;
        console.log("Nonce:", nonce);
        console.log("Message:", message);

        // 2. Sign message
        console.log("Signing message...");
        const signature = await wallet.signMessage(message);
        console.log("Signature:", signature);

        // 3. Verify
        console.log("Verifying...");
        const verifyRes = await axios.post('http://localhost:3000/api/auth/login/verify', {
            wallet_address: wallet.address,
            signature: signature,
        });
        console.log("Verify Response:", verifyRes.data);
    } catch (err) {
        if (err.response) {
            console.error("HTTP Error:", err.response.status, err.response.data);
        } else {
            console.error("Error:", err.message);
        }
    }
}

main();
