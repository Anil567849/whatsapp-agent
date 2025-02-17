import { config } from "dotenv";
config();
import express from 'express';
import cors from 'cors';
import agentRoute from './routes/agent';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use(agentRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});