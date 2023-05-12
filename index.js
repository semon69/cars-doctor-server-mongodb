const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Cars doctor server is running')
})


const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.kyulyzl.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const serviceCollection = client.db('carDoctorDB').collection('services');
        const bookingCollection = client.db('carDoctorDB').collection('bookings')

        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            // const options = {
            //     // Include only the `title` and `imdb` fields in the returned document
            //     projection: { _id: 1, title: 1, service_id: 1, price: 1 },
            //   };
            const result = await serviceCollection.findOne(query)
            res.send(result)
        })

        app.get('/bookings', async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingCollection.find(query).toArray()
            res.send(result)
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking)
            res.send(result)
        })

        app.put('/bookings/:id', async(req, res)=> {
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)}
            const updateBooking = req.body;
            const updateDoc = {
                $set: {
                  status: updateBooking.status
                },
              };
              const result = await bookingCollection.updateOne(filter, updateDoc)
              res.send(result)

        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.deleteOne(query)
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, (req, res) => {
    console.log(`cars doctor server is running on port ${port}`);
})