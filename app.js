const express = require("express");
const app = express();
const cors = require("cors");
const mongo = require("mongodb");
const path = require("path");
require("dotenv").config();

app.use(cors());

const MongoClient = mongo.MongoClient;
const dbName = "fiboSearches";
const collection = "requestedNumbers";
const url = process.env.MONGODB_URI || process.env.DB_CONNECTION;

//connecting
MongoClient.connect(
  url,
  { useUnifiedTopology: true, useNewUrlParser: true },
  function (err, db) {
    if (err) throw err;
    const dbo = db.db(dbName);
  }
);

function wait(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

function fibonacci(n, memo) {
  memo = memo || {};
  if (n === 0) return 0;
  if (n < 2) return 1;
  if (n in memo) return memo[n];
  return (memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo));
}

app.get("/fibonacci/:number", async (req, res) => {
  await wait(400);
  const number = +req.params.number;
  if (number === 42) return res.status(400).send("42 is the meaning of life");
  if (number > 50)
    return res.status(400).send("number can't be bigger than 50");
  if (number < 0) return res.status(400).send("number can't be smaller than 0");
  const result = fibonacci(number);
  const payload = { number, result, createdDate: Date.now() };
  MongoClient.connect(
    url,
    { useUnifiedTopology: true, useNewUrlParser: true },
    (err, db) => {
      if (err) throw err;
      const dbo = db.db(dbName);
      dbo.collection(collection).insertOne(payload, (err, response) => {
        if (err) throw err;
        return res.status(200).send(response.ops[0]);
      });
    }
  );
});

app.get("/getFibonacciResults", async (req, res) => {
  await wait(600);
  data = await MongoClient.connect(
    url,
    { useUnifiedTopology: true, useNewUrlParser: true },
    (err, client) => {
      if (err) throw err;
      const dbo = client.db(dbName);
      dbo
        .collection(collection)
        .find()
        .toArray((err, docs) => {
          if (err) throw err;
          return res.status(200).send(docs);
        });
    }
  );
});

const PORT = process.env.PORT || 5020;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}. \nPress Ctrl+C to quit.`);
});
