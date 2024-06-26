import express from 'express';
import db from '../db/connection';
import { ObjectId } from 'mongodb';
import {
	validate_name,
	validate_email,
	validate_phone,
	validate_address,
	validate_city,
	validate_state,
	validate_zip,
	validate_credit_card,
	validate_cctype,
	validate_cvv,
	validate_expiration,
	validate_routingnumber,
	validate_accountnumber
} from '../helpers/subscription-validation';
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
//--data-raw '{
//    "planid":"662d7a4e3f0b6723376bec11",
//    "firstname":"firstname",
//    "lastname":"lastname",
//    "phone":"6512344444",
//    "email":"asdf@asdf.com",
//    "address":"address",
//    "city":"city",
//    "state":"MN",
//    "zip":"54555",
//    "cc":"1111111111111111",
//    "cctype":"Visa",
//    "ccv":"344",
//    "exp":"11/2025",
//    "routingnumber":"000000000",
//    "accountnumber":"0000000000",
//    "subscriptionstatus":"freeze"
//}'

// there are no delete for this api as we want to keep records of who has been joining the subscription service, we can always cancel the subscription, or freeze it, but we want to keep the record of who has been a member of the subscription service and when they joined

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
	let newDocument = new Subscription(req.body, storeid, "post").generatingDocument();
	if(newDocument instanceof Error) {
		if(debug) {
			console.log(`Error: ${util.inspect(newDocument)}`);
		}
		return res.status(400).send(newDocument.message);
	}
	let result = await collection.insertOne(newDocument);
	res.send(result).status(204);
});

// example of updating a subscription
//curl --location --request PUT 'http://localhost:4000/subscription/update/662ddb62f2d1229c405c1625' \
//--header 'storeid: 662c848b9276a793dc1eb4cd' \
//--header 'storekey: admin' \
//--header 'Content-Type: application/json' \
//--data-raw '{
//    "planid":"662d7a4e3f0b6723376bec11",
//    "firstname":"firstname",
//    "lastname":"lastname",
//    "phone":"6512344444",
//    "email":"asdf@asdf.com",
//    "address":"address",
//    "city":"city",
//    "state":"MN",
//    "zip":"54555",
//    "cc":"1111111111111111",
//    "cctype":"Visa",
//    "ccv":"344",
//    "exp":"11/2025",
//    "routingnumber":"000000000",
//    "accountnumber":"0000000000",
//    "subscriptionstatus":"active"
//}'

router.put("/update/:id", async (req, res) => {
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
	let query = {_id: new ObjectId(req.params.id)};
	// get current document
	let currentDocument = await collection.findOne(query);
	if(!currentDocument) {
		return res.status(404).send("Document not found");
	}
	let createdDate:Date = currentDocument.createdDate;

	let newDocument = new Subscription(req.body, storeid, "put", createdDate).generatingDocument();
	if(newDocument instanceof Error) {
		if(debug) {
			console.log(`Error: ${util.inspect(newDocument)}`);
		}
		return res.status(400).send(newDocument.message);
	}
	let result = await collection.updateOne(query, {$set: newDocument});
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
	modifyDate:Date|null;
	subscriptionstatus:string;
}

class Subscription {
	data:Subscription;
	storeid:string;
	apiType:string;
	createDate:Date|null;
	constructor(data:Subscription, storeid:string, apiType:string, createDate:Date|null=null) {
		this.data = data;
		this.storeid = storeid;
		this.apiType = apiType;
		this.createDate = createDate;
	}
	generatingDocument() {
		const data = this.data;
		let error:boolean|Error = false;
		error = this.verifyFields(data);
		if(error instanceof Error) {
			return error;
		}
		let tmpCreatedDate = data.createdDate;
		if(this.apiType === "post") {
			data.createdDate = new Date();
			data.modifyDate = null;
		}
		if(this.apiType === "put") {
			data.modifyDate = new Date();
			data.createdDate = this.createDate;
		}
//		console.log(`this.createdDate: ${data.createdDate}`);
//		console.log(`tmpCreatedDate: ${tmpCreatedDate}`);

		let tmpSubscriptionStatus:string = "";
		tmpSubscriptionStatus = data.subscriptionstatus;
		data.subscriptionstatus = "active";
		if(tmpSubscriptionStatus === "freeze") {
			data.subscriptionstatus = "freeze";
		}

		if(tmpSubscriptionStatus === "cancel") {
			data.subscriptionstatus = "inactive";
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
			modifyDate: data.modifyDate,
			subscriptionstatus: data.subscriptionstatus
		}
		error = this.validateValues(document);
//		console.log(`last error ${typeof(error)}`)
		if(error instanceof Error) {
			return error;
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

	validateValues(document:any):boolean|Error {
		let error:boolean|Error = false;
		error = validate_name(document.firstname);
		if(error instanceof Error) {
			return error; 
		}
		error = validate_name(document.lastname);
		if(error instanceof Error) {
			return error;
		}
		error = validate_phone(document.phone);
		if(error instanceof Error) {
			return error;
		}
		error = validate_email(document.email);
		if(error instanceof Error) {
			return error;
		}
		error = validate_address(document.address);
		if(error instanceof Error) {
			return error;
		}
		error = validate_city(document.city);
		if(error instanceof Error) {
			return error;
		}
		error = validate_state(document.state);
		if(error instanceof Error) {
			return error;
		}
		error = validate_zip(document.zip);
		if(error instanceof Error) {
			return error;
		}
		error = validate_credit_card(document.cc);
		if(error instanceof Error) {
			return error;
		}
		error = validate_cctype(document.cctype);
		if(error instanceof Error) {
			return error;
		}
		error = validate_cvv(document.ccv);
		if(error instanceof Error) {
			return error;
		}
		error = validate_expiration(document.exp);
		if(error instanceof Error) {
			return error;
		}
		error = validate_routingnumber(document.routingnumber);
		if(error instanceof Error) {
			return error;
		}
		error = validate_accountnumber(document.accountnumber);
		if(error instanceof Error) {
			return error;
		}

		return error;
	}

}
