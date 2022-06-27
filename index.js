const express = require('express')
require("dotenv").config()
const { MongoClient } = require('mongodb');

const { MONGODB_URL, DATABASE } = process.env
const client = new MongoClient(MONGODB_URL);
const app = express()
const database = client.db(DATABASE);
const CustomerCollection = database.collection('customers');
const OrdersCollection = database.collection('orders');

app.get("/part1", async (req, res) => {

    const commonfacet = [{
        $lookup:{
            from:"orders",
            localField:"_id",
            foreignField:"customer",
            as:"allorders"
        }
    },

    {
        $unwind:"$allorders"
    }]

    const customerData = await CustomerCollection.aggregate([
        {
            $facet:{
                total:[...commonfacet, {
                    $group:{
                        _id:"$_id",
                        total:{$sum:"$allorders.total"}
                    }
                }],
                count:[...commonfacet, {
                    $group:{
                        _id:"$_id",
                        total:{$count:{}}
                    }
                }],
            }
        } 
    ]).toArray()

    res.json({customerData})
})

app.get("/part2", async(req, res) => {

    const maxitems = await OrdersCollection.aggregate([
        {$unwind:"$items"},
        {
            $group:{
                _id:"$items",
                count:{$count:{}}
            }
        },
        {
            $sort:{
                count:-1
            }
        },
        {
            $limit:5
        }

    ]).toArray()

    res.json({maxitems})
})

app.listen(3000, async () => {
    await client.connect()
})