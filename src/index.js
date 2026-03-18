import express from "express";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from express");
});

app.listen(8000, () => {
  console.log("Server running in port number 8000");
});
