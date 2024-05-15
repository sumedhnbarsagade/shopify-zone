const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()
const connectDB = require('./config/db')
const router = require('./routes')
const Stripe = require('stripe')


const app = express()

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.use("/api", router)

const PORT = 8080 || process.env.PORT

// payment gateway - stripe
console.log(process.env.STRIPE_SECRET_KEY)

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    app.post("/checkout-payment", async (req, res) => {
    // console.log(req.body);

    try {
        const params = {
            submit_type: 'pay',
            mode: "payment",
            payment_method_types: ['cart'],
            billing_address_collection: "auto",
            shipping_option: [{ shipping_rate: "shr_1PGgGYSCT12tjdoSAxqnuweu"}],

            line_items: req.body.map((item) => {
                return {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: item.productName,
                            // images : [item.image]
                        },
                        unit_amount: item.price * 100,
                    },
                    adjustable_quatity: {
                        enable: true,
                        minimum: 1,
                    },
                    quantity: item.qty
                }
            }),

            success_url: `${process.env.FRONTEND_URL}/success`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`
        }
        const session = await stripe.checkout.sessions.create(params)
        res.status(200).json(session.id)
    }
    catch (err) {
        res.status(err.statusCode || 500).json(err.message)
    }

    // res.send({message: "payment gateway", success: true})
})


connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("connnect to DB")
        console.log("Server is running " + PORT)
    })
})
