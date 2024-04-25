import express from 'express';
import db from '../db/connection';
import  mongodb from 'mongodb';

const router = express.Router();

// get membership store
router.get('/', async (req, res) => {
	// collection name
	let collection = await db.collection("membership_store");
	let results = await collection.find({})
		.limit(50)
		.toArray();
	res.send(results).status(200);
});

// create new membership store
router.post("/", async (req, res) => {
	let util = require('util');
	let collection = await db.collection("membership_store");
	let newDocument = new MembershipStore(req.body).generatingDocument();
	if(newDocument instanceof Error) {
		console.log(`Error: ${util.inspect(newDocument)}`);
		return res.status(400).send(newDocument.message);
	}
	let result = await collection.insertOne(newDocument);
	res.send(result).status(204);
});

export default router;

interface MembershipStore {
	storeName: string,
	storeType: string,
	date: Date,
	status: string,
}

class MembershipStore {
	data: MembershipStore;
	constructor(data: MembershipStore) {
		this.data = data;
	}

	generatingDocument() {
		let errorHandler = this.checkValues();
		if(errorHandler instanceof Error) {
			return errorHandler;
		}
		const data = this.data;
		const storeName = data.storeName;
		const storeType = data.storeType;
		const date = new Date();
		const status = data.status;

		let document = {
			storeName: storeName,
			storeType: storeType,
			date: date,
			status: status,
		};

		console.log(`Document: ${JSON.stringify(document)}`);
		// console.log values not in the document
		return document;

	}
	// fail req that is not a MembershipStore
	checkValues() {
		if(this.data === undefined) {
			return new Error("Invalid MembershipStore");
		}
		if(this.data.storeName === undefined) {
			return new Error("Invalid MembershipStore");
		}
		if(this.data.storeType === undefined) {
			return new Error("Invalid MembershipStore");
		}
		if(this.data.date === undefined) {
			return new Error("Invalid MembershipStore");
		}
		if(this.data.status === undefined) {
			return new Error("Invalid MembershipStore");
		}
		let isChecked = this.checkValidEntries(this.data);
		if(isChecked instanceof Error) {
			return isChecked;
		}

	}

}
