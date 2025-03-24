"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const coinModel_1 = require("../models/coinModel");
const coins_1 = require("../utils/coins");
const seedDatabase = async () => {
    try {
        await coinModel_1.Coin.deleteMany({}); // Clear the collection
        await coinModel_1.Coin.insertMany(coins_1.coinArray); // Insert the array
        console.log("Database seeded successfully");
        process.exit(0);
    }
    catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};
exports.seedDatabase = seedDatabase;
