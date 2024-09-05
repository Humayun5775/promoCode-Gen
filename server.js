const express = require('express');
const sql = require('mssql');
const { poolPromise } = require('./config/db'); // Import db config

// Initialize Express
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Insert promo codes using the stored procedure and return the results
async function insertPromoCodesUsingSP(baseName, numCodes, discountType, promoAmount, numberOfUses, expireDate) {
    try {
        const pool = await poolPromise;

        const request = pool.request(); // Use pool.request() directly, no need to pass `pool`
        request.input('BaseName', sql.NVarChar(50), baseName);
        request.input('NumCodes', sql.Int, numCodes);
        request.input('DiscountType', sql.NVarChar(20), discountType);
        request.input('PromoAmount', sql.Decimal(10, 2), promoAmount);
        request.input('NumberOfUses', sql.Int, numberOfUses);
        request.input('ExpireDate', sql.Date, expireDate);

        // Execute the stored procedure and get the results
        const result = await request.execute('GenerateAndInsertPromoCodes');
        return result.recordset; // Return the promo codes generated
    } catch (err) {
        console.error('Error generating and inserting promo codes:', err);
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

    // Insert Promo Codes using Stored Procedure and return results
    try {
        const promoCodes = await insertPromoCodesUsingSP(baseName, numCodes, discountType, promoAmount, numberOfUses, expireDate);
        return res.status(200).json({
            message: `${numCodes} promo codes generated and inserted into the database.`,
            promoCodes: promoCodes // Include the promo codes in the response
        });
    } catch (err) {
        return res.status(500).json({ error: 'Error generating and inserting promo codes.' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
