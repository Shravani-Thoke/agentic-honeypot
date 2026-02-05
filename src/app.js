import express from "express";
import cors from "cors";
import honeypotRoute from "./routes/honeypot.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/honeypot", honeypotRoute);

app.get("/", (req, res) => {
  res.send("Agentic Honeypot API running ");
});

export default app;
