import { Coin } from "../models/coinModel";
import { coinArray } from "../utils/coins";

export const seedDatabase = async () => {
	try {
		await Coin.deleteMany({}); // Clear the collection
		await Coin.insertMany(coinArray); // Insert the array

		console.log("Database seeded successfully");
		process.exit(0);
	} catch (error) {
		console.error("Error seeding database:", error);
		process.exit(1);
	}
};
