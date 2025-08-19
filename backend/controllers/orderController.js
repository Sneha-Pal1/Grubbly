import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173";

  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      status: "Food Processing", // default
      payment: false, // COD, so not paid
    });

    await newOrder.save();

    // Clear the cart after order
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    // ✅ Only one response
    res.json({
      success: true,
      message: "Order placed successfully with Cash on Delivery",
      orderId: newOrder._id,
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

export { placeOrder };
