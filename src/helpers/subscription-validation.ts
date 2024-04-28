// this file is to help with the validation of subscription data from src/routes/subscription.ts
//

export interface ErrorInterface {
	[key: string]: string;
	error: string;
	errorResolution: string;
	errorMessage: string;
}

export function validate_name (name: string): Error|boolean {
	let isError:boolean|Error = false;
	if(name === undefined || name === null || name === ""){
		return new Error("Name must be provided");
	}
	if(name.length > 20){
		return new Error("Name must be less than 20 characters");
	}
	// alphabetic characters and spaces only
	let pattern = /^[a-zA-Z\s]+$/;
	if(!pattern.test(name)){
		return new Error("Name must be alphabetic");
	}
	return isError;
}

export function validate_email (email: string): Error|boolean {
	let isError:boolean|Error = false;
	if(email === undefined || email === null || email === ""){
		return new Error("Email must be provided");
	}
	// email pattern
	let pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	if(!pattern.test(email)){
		return new Error("Email must be valid");
	}
	return isError;
}

export function validate_phone (phone: string): Error|boolean {
	let isError:boolean|Error = false;
	if(phone === undefined || phone === null || phone === ""){
		return new Error("Phone must be provided");
	}
	// phone pattern
	// we are assuming that the phone number is a 10 digit number with no spaces or special characters
	let pattern = /^\d{10}$/;
	if(!pattern.test(phone)){
		return new Error(`Phone must be 10 digits. ${phone} is invalid`);
	}
	if(phone.length > 10){
		return new Error(`Phone is too long. ${phone.length} characters`);
	}
	if(phone.length < 10){
		return new Error(`Phone is too short. ${phone.length} characters`);
	}
	return isError;
}

// check credit card number
export function validate_credit_card (credit_card: string): Error|boolean {
	let isError:boolean|Error = false;
	if(credit_card === undefined || credit_card === null || credit_card === ""){
		return new Error("Credit Card must be provided");
	}
	if(credit_card.length > 17){
		return new Error(`Credit Card is too long. ${credit_card.length} characters`);
	}
	if(credit_card.length < 16){
		return new Error(`Credit Card is too short. ${credit_card.length} characters`);
	}
	return isError;
}

// check credit card expiration
export function validate_expiration (expiration: string): Error|boolean {
	let isError:boolean|Error = false;
	if(expiration === undefined || expiration === null || expiration === ""){
		return new Error("Expiration must be provided");
	}
	// expiration pattern
	let pattern = /^(0[1-9]|1[0-2])\/\d{4}$/;
	if(!pattern.test(expiration)){
		return new Error("Expiration must be in the format MM/YYYY");
	}
	// checking valid date
	let date = expiration.split('/');
	let month = parseInt(date[0]);
	let year = parseInt(date[1]);
	let current_date = new Date();
	let current_month = current_date.getMonth() + 1;
	let current_year = current_date.getFullYear();
	if(year < current_year){
		return new Error(`Expiration must be in the future. ${year} year is invalid`);
	}
	if(year === current_year && month < current_month){
		return new Error(`Expiration must be in the future. ${month} month is invalid`);
	}
	return isError;
}

export function validate_cctype (cctype: string): Error|boolean {
	let isError:boolean|Error = false;
	if(cctype === undefined || cctype === null || cctype === ""){
		return new Error("Credit Card Type must be provided");
	}
	// credit card type pattern
	let pattern = /^(Visa|MasterCard|American Express|Discover)$/;
	if(!pattern.test(cctype)){
		return new Error("Credit Card Type must be Visa, MasterCard, American Express, or Discover");
	}
	return isError;
}

export function validate_cvv (cvv: string): Error|boolean {
	let isError:boolean|Error = false;
	if(cvv === undefined || cvv === null || cvv === ""){
		return new Error("CVV must be provided");
	}
	if(cvv.length > 4){
		return new Error(`CVV is too long. ${cvv.length} characters`);
	}
	if(cvv.length < 3){
		return new Error(`CVV is too short. ${cvv.length} characters`);
	}
	return isError;
}

export function validate_city (city: string): Error|boolean {
	let isError:boolean|Error = false;
	if(city === undefined || city === null || city === ""){
		return new Error("City must be provided");
	}
	// alphabetic characters and spaces only
	let pattern = /^[a-zA-Z\s]+$/;
	if(!pattern.test(city)){
		return new Error("City must be alphabetic");
	}
	return isError;
}

export function validate_state (state: string): Error|boolean {
	let isError:boolean|Error = false;
	if(state === undefined || state === null || state === ""){
		return new Error("State must be provided");
	}
	// alphabetic characters and spaces only
	let pattern = /^[a-zA-Z\s]+$/;
	if(!pattern.test(state)){
		return new Error("State must be alphabetic");
	}
	if(state.length !== 2){
		return new Error("State must be 2 characters");
	}
	if(state !== state.toUpperCase()){
		return new Error("State must be uppercase");
	}
	if(state_abbr[state] === undefined){
		return new Error("State must be a valid state");
	}
	return isError;
}

// this is only testing for zip code pattern in the US
export function validate_zip (zip: string): Error|boolean {
	let isError:boolean|Error = false;
	if(zip === undefined || zip === null || zip === ""){
		return new Error("Zip must be provided");
	}
	// zip code pattern
	let pattern = /^\d{5}$/;
	if(!pattern.test(zip)){
		return new Error("Zip must be 5 digits");
	}
	return isError;
}

export function validate_address (address: string): Error|boolean {
	let isError:boolean|Error = false;
	if(address === undefined || address === null || address === ""){
		return new Error("Address must be provided");
	}
	// address pattern
	// we are assuming that the address is alphanumeric with spaces no special characters
	let pattern = /^[a-zA-Z0-9\s]+$/;
	if(!pattern.test(address)){
		return new Error("Address must be alphanumeric");
	}
	return isError;
}

export function validate_routingnumber (routingnumber: string): Error|boolean {
	let isError:boolean|Error = false;
	if(routingnumber === undefined || routingnumber === null || routingnumber === ""){
		return new Error("Routing Number must be provided");
	}
	// routing number pattern
	let pattern = /^\d{9}$/;
	if(!pattern.test(routingnumber)){
		return new Error("Routing Number must be 9 digits");
	}
	return isError;
}

export function validate_accountnumber (accountnumber: string): Error|boolean {
	let isError:boolean|Error = false;
	if(accountnumber === undefined || accountnumber === null || accountnumber === ""){
		return new Error("Account Number must be provided");
	}
	// account number pattern
	let pattern = /^\d{10,12}$/;
	if(!pattern.test(accountnumber)){
		return new Error("Account Number must be 10 to 12 digits");
	}
	return isError;
}

const state_abbr:any = {
	"AL": "Alabama",
	"AK": "Alaska",
	"AZ": "Arizona",
	"AR": "Arkansas",
	"CA": "California",
	"CO": "Colorado",
	"CT": "Connecticut",
	"DE": "Delaware",
	"FL": "Florida",
	"GA": "Georgia",
	"HI": "Hawaii",
	"ID": "Idaho",
	"IL": "Illinois",
	"IN": "Indiana",
	"IA": "Iowa",
	"KS": "Kansas",
	"KY": "Kentucky",
	"LA": "Louisiana",
	"ME": "Maine",
	"MD": "Maryland",
	"MA": "Massachusetts",
	"MI": "Michigan",
	"MN": "Minnesota",
	"MS": "Mississippi",
	"MO": "Missouri",
	"MT": "Montana",
	"NE": "Nebraska",
	"NV": "Nevada",
	"NH": "New Hampshire",
	"NJ": "New Jersey",
	"NM": "New Mexico",
	"NY": "New York",
	"NC": "North Carolina",
	"ND": "North Dakota",
	"OH": "Ohio",
	"OK": "Oklahoma",
	"OR": "Oregon",
	"PA": "Pennsylvania",
	"RI": "Rhode Island",
	"SC": "South Carolina",
	"SD": "South Dakota",
	"TN": "Tennessee",
	"TX": "Texas",
	"UT": "Utah",
	"VT": "Vermont",
	"VA": "Virginia",
	"WA": "Washington",
	"WV": "West Virginia",
	"WI": "Wisconsin",
	"WY": "Wyoming"
};
