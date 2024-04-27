import express from 'express';
import env from 'dotenv';
import membership from './routes/membership';

env.config();
const port = process.env.PORT || 3000;
const app = express();
let debug = true;
//debug = false;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
	if(debug) {
		console.log(`Server is running on port ${port}`);
	}
});

//notes: this is a testing api, if this cannot connect to the database, it will throw an error, if so check mongodb atlas and add current ip address
app.use("/membership", membership);
