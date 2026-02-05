import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(` Server started on port ${PORT}`);
});

console.log("Gemini key loaded:", !!process.env.GEMINI_API_KEY);

