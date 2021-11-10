const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');

const app = express()
app.use(cors())
app.use(express.json())
const port = process.env.PORT || 5000



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1qogd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {

    try {

        await client.connect();
        const database = client.db('Doctors_portal')
        const appointmentsCollection = database.collection('appointments')
        const usersCollection = database.collection('users')

        // post an user 
        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await usersCollection.insertOne(user)
            res.json(result)
        })

        // update the user 
        app.put('/users', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const options = { upsert: true }
            const updateDoc = { $set: user }
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            console.log(result)
        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result)

        })

        // find admin 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let isAdmin = false
            if (user?.role === 'admin') {
                isAdmin = true
            }
            res.json({ admin: isAdmin })
        })


        // get all apointments 
        app.get('/appointments', async (req, res) => {
            const email = req.query.email;
            const date = new Date(req.query.date).toLocaleDateString();

            const query = { patientEmail: email, date: date }
            console.log(query)
            const cursor = await appointmentsCollection.find(query).toArray();
            res.json(cursor)
            // const appointments = await cursor;
            // console.log(appointments);
        })

        app.post('/appointments', async (req, res) => {
            const appoinment = req.body
            const result = await appointmentsCollection.insertOne(appoinment)
            console.log(result)
            res.json(result)
        })



    } finally {

        //   await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello doctors portal!')
})

app.listen(port, () => {
    console.log('My server running at', port)
})