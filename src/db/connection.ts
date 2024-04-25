import dotenv from "dotenv";
import { MongoClient } from 'mongodb';
// import * as mongoDB from "mongodb";


dotenv.config();
const uri = process.env.ATLAS_URI || "";

const client = new MongoClient(uri);
async function run() {
	console.log(uri);
	try {
		await client.connect();
		// database and collection code goes here
		// insert code goes here
		// display the results of your operation
		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log("Pinged your deployment. You successfully connected to MongoDB!");
		console.log("Connected to the database");
	} catch (e) {
	  console.log("Error connecting to the database: ", e);
	} finally {
		// Ensures that the client will close when you finish/error
		// todo: close the connection
		// await client.close();
	}
}

run().catch(console.dir);
// database name
let db = client.db("membership");
export default db;
