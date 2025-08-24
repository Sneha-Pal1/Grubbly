import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173/";

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
    });
  } catch (error) {
    console.error("❌ Error placing order:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success == "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({
        success: true,
        message: "Paid",
      });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({
        success: false,
        message: "Not Paid",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error",
    });
  }
};
//user orders for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Error",
    });
  }
};
//listing orders for admin panel
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: false,
    });
  }
};
//api for updating order status
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });
    res.json({
      success: true,
      message: "Status Updated",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error",
    });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
