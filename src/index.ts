import express, { Express, Request, Response, Router } from "express";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion } from 'mongodb';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const uri = process.env.ATLAS_URI || ''; 

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (e) {
	console.error(e);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
