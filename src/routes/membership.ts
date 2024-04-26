import express from 'express';
import db from '../db/connection';
import { ObjectId } from 'mongodb';

const router = express.Router();
const collectionName = "membership_store";

// get membership store
router.get('/', async (req, res) => {
	// collection name
	let collection = await db.collection(collectionName);
	let results = await collection.find({})
		.limit(50)
		.toArray();
	res.send(results).status(200);
});

// create new membership store
router.post("/", async (req, res) => {
	let util = require('util');
	let collection = await db.collection(collectionName);
	let newDocument = new MembershipStore(req.body).generatingDocument();
	if(newDocument instanceof Error) {
		console.log(`Error: ${util.inspect(newDocument)}`);
		return res.status(400).send(newDocument.message);
	}
	let result = await collection.insertOne(newDocument);
	res.send(result).status(204);
});

// Get a single membership store
router.get("/:id", async (req, res) => {
	let collection = await db.collection(collectionName);
	let query = {_id: new ObjectId(req.params.id)};
	let result = await collection.findOne(query);
	if (!result) res.status(404).send(`No document with id ${req.params.id} was found`);
	else res.send(result).status(200);
});

// Delete an membership store
router.delete("/:id", async (req, res) => {
	const query = { _id: new ObjectId(req.params.id) };
	const collection = db.collection(collectionName);
	let result = await collection.deleteOne(query);
	res.send(result).status(200);
});

// patch, sending a comment to the membership store
router.patch("/comment/:id", async (req, res) => {
	const query = { _id:new ObjectId(req.params.id) };
	const updates = {
		$push: { comments: req.body }
	};
	let collection = await db.collection(collectionName);
	let result = await collection.updateOne(query, updates);
	res.send(result).status(200);
});

// put, update a membership store
router.put("/:id", async (req, res) => {
	const query = { _id: new ObjectId(req.params.id) };
	const updates = {
		$set: req.body
	};
	let collection = await db.collection(collectionName);
	let result = await collection.updateOne(query, updates);
	res.send(result).status(200);
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

		// console.log(`Document: ${JSON.stringify(document)}`);
		// console.log values not in the document
		let isChecked = this.checkValidEntries(this.data, document);
		if(isChecked instanceof Error) {
			return isChecked;
		}
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

	}

	checkValidEntries(data: object, document: any) {
		const tmpdata:any = this.data;
		console.log(`Data: ${JSON.stringify(data)}`);
		// if key is not in MembershipStore
		if(!data || !document) {
			return new Error("Invalid MembershipStore");
		}
		let tmpkey:string = "";
		// see if data is in document
		for(let key in tmpdata) {
			// verify key that is not in the document and failing the request
			if(document[key] !== tmpdata[key] && key !== "_id" && key !== "date") {
				console.log(`Key: ${key}`);
				tmpkey = key;
				break;
			}
		}

		if(tmpkey !== "") {
			return new Error(`Invalid key: ${tmpkey}`);
		}
	}
}
