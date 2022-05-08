const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// MongoDB Connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ddxnu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {

    await client.connect();
    const productsCollection = client.db('bikewarehouse').collection('productCollection');
    // All Products API
    app.get('/products', async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    // My items APi
    app.get('/myitems/:email', async (req, res) => {
      const query = { email: req.params.email };
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });


    // Product details api
    app.get('/inventory/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.send(product);
    });

    // Add Product API
    app.post('/products', async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct)
      const result = await productsCollection.insertOne({ ...newProduct, sold: 0 });
      res.send(result);
    });

    //update quantity api
    app.put('/inventory/quantityupdate/:id', async (req, res) => {
      const productId = req.params.id;
      const product = await productsCollection.findOne({ _id: ObjectId(productId) });
      const updateQuantity = await productsCollection.updateOne(
        { _id: ObjectId(productId) },
        { $set: { "quantity": (parseInt(product.quantity) + parseInt(req.body.newQuantity)) } }
      );
      res.send(updateQuantity);
    });

    // delivered udate api
    app.put('/inventory/delivered/:id', async (req, res) => {
      const productId = req.params.id;
      const product = await productsCollection.findOne({ _id: ObjectId(productId) });
      const deliveredQuantity = await productsCollection.updateOne(
        { _id: ObjectId(productId) },
        { $set: { "quantity": (parseInt(product.quantity) - 1), "sold": (parseInt(product.sold) + 1) } }
      );
      res.send(deliveredQuantity)
    });

    // Delete API
    app.delete('/inventory/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await productsCollection.deleteOne(query);
      res.send(result)
    })

  }
  finally {
    // finally
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send("Running BikeWarehouse Server is Running")
})

app.listen(port, () => {
  console.log('Listening to port', port)
})