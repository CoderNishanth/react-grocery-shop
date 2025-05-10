import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Stripe from "stripe";


//PLace Order COD :  /api/order/cod
export const placeOrderCOD = async (req, res) => {
    try {
        const {userId,items, address} = req.body;
        if(!address || items.length === 0){
            return res.json({
                success:false,message:"Invalid data"
            })
        }

        let amount = await items.reduce(async (acc,item)=> {
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        },0)

        amount += Math.floor(amount * 0.02);

        await Order.create({userId,items,address,amount,paymentType:"COD"})
        res.json({
            success: true,
            message: "Order placed successfully"
        })
    } catch (error) {
        console.log(error.message);
        res.json({
            success: false,
            message: error.message
        });
    }
}

//PLace Order Stripe :  /api/order/stripe
export const placeOrderStripe = async (req, res) => {
  try {
      const {userId,items, address} = req.body;
      const {origin} = req.headers;

      if(!address || items.length === 0){
          return res.json({
              success:false,message:"Invalid data"
          })
      }

      let productData = [];

      let amount = await items.reduce(async (acc,item)=> {
          const product = await Product.findById(item.product);
          productData.push({
              name:product.name,
              price:product.offerPrice,
              quantity:item.quantity
          })
          return (await acc) + product.offerPrice * item.quantity;
      },0)

      amount += Math.floor(amount * 0.02);

      const order = await Order.create({userId,items,address,amount,paymentType:"Online"})

      const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
      const lineItems = productData.map(item => {
          return {
              price_data: {
                  currency: "usd",
                  product_data: {
                      name: item.name,
                  },
                  unit_amount: Math.floor((item.price + item.price * 0.02) * 100),
              },
              quantity: item.quantity,
          }
      });

      const session = await stripeInstance.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          success_url: `${origin}/loader?next=my-orders`,
          cancel_url: `${origin}/cart`,
          metadata: {
              orderId: order._id.toString(),
              userId,
          }
      });

      res.json({
          success: true,url:session.url
      })
  } catch (error) {
      res.json({
          success: false,
          message: error.message
      });
  }
}

//Stripe Webhooks to verify payment: /stripe
export const stripeWebhooks = async (req, res) => {
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers["stripe-signature"];
    let event;
    try{
        event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
    catch(err){
        return res.status(400).send(
            `Webhook Error: ${err.message}`
        );
    }

    switch(event.type){
        case "payment_intent.succeeded":{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId
            });
            const {orderId,userId} = session.data[0].metadata;
            
            await Order.findByIdAndUpdate(orderId,{isPaid:true});
            await User.findByIdAndUpdate(userId,{cartItems:{}});
            break;
        }
        case "payment_intent.payment_failed":{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId
            });
            const {orderId,userId} = session.data[0].metadata;
            
            await Order.findByIdAndDelete(orderId);
            break;
        }
        default:{
            console.log(`Unhandled event type ${event.type}`);
            break;
        }
    }
    res.json({received:true});
}

//Get Orders By User ID : /api/order/user
export const getOrdersByUserId = async (req, res) => {
    try {
      const {userId} = req.body;
      const orders = await Order.find({userId,$or:[{isPaid:true},{paymentType:"COD"}]}).populate("items.product address").sort({createdAt: -1});
      return res.json({
        success: true,
        message: "Orders fetched successfully",
        orders
      });
    } catch (error) {
      console.log(error.message);
      res.json({
        success: false,
        message: error.message
      });
    }
}

//Get All Orders (for seller | admin) : /api/order/seller 
export const getAllOrders = async (req, res) => {
    try {
      const orders = await Order.find({$or:[{isPaid:true},{paymentType:"COD"}]}).populate("items.product address").sort({createdAt : -1});
      return res.json({
        success: true,
        message: "Orders fetched successfully",
        orders
      });
    } catch (error) {
      console.log(error.message);
      res.json({
        success: false,
        message: error.message
      });
    }
}