import express from 'express';
import db from '../db/connection';
import { ObjectId } from 'mongodb';

const router = express.Router();
// headers should be like this
// example: membershipid: storeid, membershipkey: admin
//

let debug = true;
// debug = false;

router.post('/create', async (req, res) => {
	let headers = req.headers;
	let error:boolean|Error = false;
	error = verifyHeaders(headers);
	if(error instanceof Error || error) {
		return res.status(400).send("Error invalid headers");
	}
	let storeid:string = getStoreId(headers);
	error = verifyStoreId(storeid);
	if(error instanceof Error || error) {
		return res.status(400).send("Error invalid storeid");
	}
	let collectionName:string = getCollectionName(storeid);
	let collection = await db.collection(collectionName);
	let newDocument = new Plan(req.body, storeid).gerneratingDocument();
	if(newDocument instanceof Error) {
		return res.status(400).send(newDocument.message);
	}
	let result = await collection.insertOne(newDocument);
	res.send(result).status(204);

});

export default router;

interface Plan {
	name: string;
	description: string;
	price: number;
	storeid: string;
	type: string;
	billingcycle: string;
	duedate: Date;
	createDate: Date;
	modifyDate: Date;
}

class Plan {
	data: Plan;
	storeid: string;
	constructor(data: Plan, storeid: string) {
		this.data = data;
		this.storeid = storeid;
	}

	gerneratingDocument() {
		let data = this.data;
		let storeid = this.storeid;

		let error: boolean|Error = false;
		error = this.checkValues();
		if(error instanceof Error) {
			return error;
		}
		error = this.checkValidValues();
		if(error instanceof Error) {
			return error;
		}
		
		let document = {
			name: data.name,
			description: data.description,
			price: data.price,
			storeid: storeid,
			type: data.type,
			billingcycle: data.billingcycle,
			duedate: data.duedate,
			createDate: new Date(),
			modifyDate: ''
		}
		if(!document) {
			return new Error('Invalid document');
		}
		error = this.checkValidEntries(document);
		if(error instanceof Error) {
			return error;
		}
		return document;
	}	

	checkValues():boolean|Error {
		let data = this.data;
		if(!data.name || !data.description || !data.price || !data.type || !data.billingcycle || !data.duedate) {
			return new Error('Invalid data');
		}
		return false;
	}

	checkValidValues():boolean|Error {
		let data = this.data;
		if(data.price < 0) {
			return new Error('Invalid price');
		}
		if(data.type !== 'recurring' && data.type !== 'one-time') {
			return new Error('Invalid type');
		}
		if(data.billingcycle !== 'monthly' && data.billingcycle !== 'yearly') {
			return new Error('Invalid billingcycle');
		}
		return false;
	}

	checkValidEntries(document: any):boolean|Error {
		const tmpdata:any = this.data;
		let tmpkey:string = "";
		// see if data is in document
		for(let key in tmpdata) {
			// verify key that is not in the document and failing the request
			if(document[key] !== tmpdata[key] && key !== "_id" && key !== "date") {

				if(debug) {
					console.log(`Key: ${key}`);
				}
				
				tmpkey = key;
				break;
			}
		}

		if(tmpkey !== "" && tmpkey !== "storeid") {
			return new Error(`Invalid key: ${tmpkey}`);
		}
		return false;
	}

}


const verifyHeaders = (headers: any):boolean|Error => {
	if (!(headers.membershipid || headers.membershipkey)) {
		if(!headers.membershipid) {
			return new Error('membershipid not found');
		} else {
			return new Error('membershipkey not found');
		}
	} 
	return false;
}

const verifyStoreId = (storeid: string):boolean|Error => {
	let collection = db.collection('membership_store');
	console.log('storeid');
	console.log(storeid);
	let query = {_id: new ObjectId(storeid)};
	let result = collection.findOne(query);
	if(!result) {
		console.log('storeid not found');
		return new Error('storeid not found');
	}
	return false;
}

const getStoreId = (headers: any):string => {
	return headers.membershipid;
}

const getCollectionName = (storeid: string):string => {
	return storeid + '_plans';
}
