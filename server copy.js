const express = require('express');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { sql, poolPromise } = require('./config/db'); // Import db config

// Initialize Express
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Function to generate promo codes with varying lengths
function generatePromoCodes(baseName, numCodes, discountType, promoAmount, numberOfUses, expireDate) {
    let promoCodes = [];
    
    for (let i = 0; i < numCodes; i++) {
        // Randomly determine if the promo code will be small (4-5 chars) or big (6-8 chars)
        const codeLength = Math.floor(Math.random() * (8 - 4 + 1)) + 4;

        // Generate a UUID-based unique code and slice it based on the desired length
        let promoCode = {
            code: `${baseName}-${uuidv4().replace(/-/g, '').slice(0, codeLength).toUpperCase()}`,
            discountType: discountType,
            amount: promoAmount,
            numberOfUses: numberOfUses,
            expireDate: moment(expireDate).format('YYYY-MM-DD')
        };
        promoCodes.push(promoCode);
    }
    
    return promoCodes;
}

// Insert generated promo codes into the database
async function insertPromoCodesIntoDB(promoCodes) {
    try {
        const pool = await poolPromise; // Get the connection pool from poolPromise

        // Create a transaction
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Prepare the SQL insert statement
        const request = new sql.Request(transaction);

        // Loop through promo codes and insert each one
        for (const promo of promoCodes) {
            await request.query(`
                INSERT INTO promocode (code, discountType, amount, numberOfUses, expireDate)
                VALUES ('${promo.code}', '${promo.discountType}', ${promo.amount}, ${promo.numberOfUses}, '${promo.expireDate}')
            `);
        }

        // Commit the transaction
        await transaction.commit();
        console.log('Promo codes inserted successfully into the database.');
    } catch (err) {
        console.error('Error inserting promo codes into database:', err);
        throw err;
    }
}

// Promo Code API Endpoint
app.post('/generatePromoCodes', async (req, res) => {
    const { baseName, numCodes, discountType, promoAmount, numberOfUses, expireDate } = req.body;

    // Input Validation
    if (!baseName || !numCodes || !discountType || !promoAmount || !numberOfUses || !expireDate) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Generate Promo Codes
    const promoCodes = generatePromoCodes(baseName, numCodes, discountType, promoAmount, numberOfUses, expireDate);

    // Insert Promo Codes into Database
    try {
        await insertPromoCodesIntoDB(promoCodes);
        return res.status(200).json({ message: `${numCodes} promo codes generated and inserted into the database.` });
    } catch (err) {
        return res.status(500).json({ error: 'Error inserting promo codes into the database.' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
