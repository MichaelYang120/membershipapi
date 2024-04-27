import express from 'express';
import db from '../db/connection';
import { ObjectId } from 'mongodb';
const router = express.Router();

// headers should be set to storeid and storekey
// example: storeid: storeid=objectid, storekey: admin


let debug = true;
//debug = false;

// example of subscription creation
//curl --location 'http://localhost:4000/subscription/create' \
//--header 'storeid: 662c848b9276a793dc1eb4cd' \
//--header 'storekey: admin' \
//--header 'Content-Type: application/json' \
//--data '{
//    "firstname":"firstname",
//    "lastname":"lastname",
//    "phone":"phone",
//    "email":"email",
//    "address":"address",
//    "city":"city",
//    "state":"state",
//    "zip":"zip",
//    "cc":"cc",
//    "cctype":"cctype",
//    "ccv":"ccv",
//    "exp":"exp",
//    "routingnumber":"routingnumber",
//    "accountnumber":"accountnumber",
//    "createdDate":"createdDate",
//    "updatedDate":"updatedDate",
//    "subscriptionstatus":"subscriptionstatus"
//}'

router.post("/create", async (req, res) => {
	let error:boolean|Error = false;
	let headers = req.headers;
	if(!headers.storeid) {
		return res.status(400).send("storeid is required");
	}
	error = verifyHeaders(headers);
	if(error instanceof Error) {
		return res.status(400).send(error.message);
	}

	let storeid:any = headers.storeid;
	error = await verifyValidStore(storeid);
	if(error instanceof Error) {
		return res.status(400).send(error.message);
	}
	error = await verifyValidPlan(storeid, req.body.planid);
	if(error instanceof Error) {
		return res;
	}

	let collectionName:string|Error = "";
	let util = require('util');
	collectionName = getCollectionName(headers);
	let collection = await db.collection(collectionName);
	let newDocument = new Subscription(req.body, storeid).generatingDocument();
	if(newDocument instanceof Error) {
		if(debug) {
			console.log(`Error: ${util.inspect(newDocument)}`);
		}
		return res.status(400).send(newDocument.message);
	}
	let result = await collection.insertOne(newDocument);
	res.send(result).status(204);
});

export default router;


const verifyHeaders = (headers:any) => {
	if(!headers.storeid || !headers.storekey) {
		return new Error("storeid and storekey are required");
	}
	return true;
}

const getCollectionName = (headers:any) => {
	const collectionName = "subscription";
	//return headers.storeid + "_" + collectionName;
	return `${collectionName}_${headers.storeid}`;
}

const verifyValidStore = async (storeid:string) => {
	let collection = db.collection("membership_store");
	let query = {_id: new ObjectId(storeid)};
	let result = collection.findOne(query);
	if(!result) {
		return new Error("storeid is not valid");
	}
	return true;
}

const verifyValidPlan = async (storeid:string, planid:string) => {
//	let collection = await db.collection("plan_" + storeid);
//	let results = await collection.find({planid: planid})
//		.limit(1)
//		.toArray();
//	if(results.length === 0) {
//		return new Error("planid is not valid");
//	}
	let collection = db.collection("plan_" + storeid);
	let query = {planid: planid};
	let result = collection.findOne(query);
	if(!result) {
		return new Error("planid is not valid");
	}
	return true;
}

interface Subscription {
	_id:any;
	storeid:string;
	planid:string;
	firstname:string;
	lastname:string;
	phone:string;
	email:string;
	address:string;
	city:string;
	state:string;
	zip:string;
	cc:string;
	cctype:string;
	ccv:string;
	exp:string;
	routingnumber:string|null;
	accountnumber:string|null;
	createdDate:Date|null;
	updatedDate:Date|null;
	subscriptionstatus:string;
}

class Subscription {
	data:Subscription;
	storeid:string;
	constructor(data:Subscription, storeid:string) {
		this.data = data;
		this.storeid = storeid;
	}
	generatingDocument() {
		const data = this.data;
		let error:boolean|Error;
		error = this.verifyFields(data);
		if(error instanceof Error) {
			return error;
		}
		if(data.createdDate) {
			if(data.createdDate == null || data.createdDate == undefined) {
				data.createdDate = new Date();
				data.updatedDate = null;
			} else {
				data.createdDate = null;
				data.updatedDate = new Date();
			}
		}

		if(data.subscriptionstatus == null || data.subscriptionstatus == undefined) {
			data.subscriptionstatus = "active";
		}

		let document = {
			storeid: this.storeid,
			planid: data.planid,
			firstname: data.firstname,
			lastname: data.lastname,
			phone: data.phone,
			email: data.email,
			address: data.address,
			city: data.city,
			state: data.state,
			zip: data.zip,
			cc: data.cc,
			cctype: data.cctype,
			ccv: data.ccv,
			exp: data.exp,
			routingnumber: data.routingnumber,
			accountnumber: data.accountnumber,
			createdDate: data.createdDate,
			updatedDate: data.updatedDate,
			subscriptionstatus: data.subscriptionstatus
		}
		return document;

	}

	verifyFields(data:Subscription):boolean|Error {
		switch(true) {
			case !data.planid:
				return new Error("planid is required");
			case !data.firstname:
				return new Error("firstname is required");
			case !data.lastname:
				return new Error("lastname is required");
			case !data.phone:
				return new Error("phone is required");
			case !data.email:
				return new Error("email is required");
			case !data.address:
				return new Error("address is required");
			case !data.city:
				return new Error("city is required");
			case !data.state:
				return new Error("state is required");
			case !data.zip:
				return new Error("zip is required");
			case !data.cc:
				return new Error("cc is required");
			case !data.cctype:
				return new Error("cctype is required");
			case !data.ccv:
				return new Error("ccv is required");
			case !data.exp:
				return new Error("exp is required");
		}
		return false;
	}

	checkVaildEntries(data:object, document:any) {
		const keys = Object.keys(data);
		const documentKeys = Object.keys(document);
		let error:boolean|Error = false;
		let tmpkey:string = "";
		for(let i = 0; i < keys.length; i++) {
			if(!documentKeys.includes(keys[i])) {
				tmpkey = keys[i];
				error = true;
				break;
			}
		}
		if(error) {
			return new Error(`Invalid key: ${tmpkey}`);
		}
		return false;
	}

	verifyHeaders(headers:any):boolean|Error {
		if(!headers.storeid || !headers.storekey) {
			return new Error("storeid and storekey are required");
		}
		if(headers.storekey !== "admin") {
			return new Error("storekey is invalid");
		}
		return true;
	}
}
