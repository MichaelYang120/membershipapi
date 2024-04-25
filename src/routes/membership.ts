import express from 'express';
import db from '../db/connection';

const router = express.Router();

router.get('/', async (req, res) => {
	// collection name
	let collection = await db.collection("membership_store");
	let results = await collection.find({})
		.limit(50)
		.toArray();
	res.send(results).status(200);
});

export default router;
