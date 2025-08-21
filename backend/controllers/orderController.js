import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173";

  try {
    console.log("📥 Incoming order data:", req.body);

    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      status: "Food Processing", // default
      payment: false, // COD, so not paid
    });

    await newOrder.save();
    console.log("✅ Order saved:", newOrder);

    // Clear the cart
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    res.json({
      success: true,
      message: "Order placed successfully with Cash on Delivery",
      orderId: newOrder._id,
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });
  } catch (error) {
    console.error("❌ Error placing order:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { placeOrder };
