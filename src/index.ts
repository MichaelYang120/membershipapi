import express from 'express';
import env from 'dotenv';
import membership from './routes/membership';

env.config();
const port = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

app.use("/membership", membership);
