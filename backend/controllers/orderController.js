import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpayInstance = null;

// Helper to initialize Razorpay lazily.
// This prevents initialization errors when orderController is imported in server.js
// before dotenv.config() has loaded environment variables.
const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET_KEY) {
      throw new Error('Missing RAZORPAY_KEY_ID or RAZORPAY_SECRET_KEY in environment variables.');
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET_KEY,
    });
  }
  return razorpayInstance;
};

/**
 * Controller to handle order placement.
 * Supports Cash on Delivery (COD) and Online Payment via Razorpay.
 */
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address, coordinates, paymentMethod } = req.body;
    console.log('📥 Incoming order placement request:', req.body);

    // Extract the vendorId from the first food item in the order to route it to the correct vendor
    const vendorId = items && items[0] ? items[0].vendorId : null;

    // Create the draft order record in the database
    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address,
      coordinates, // Store coordinates captured from the map
      vendorId,
      status: 'Food Processing', // Initial status
      payment: paymentMethod === 'cod' ? false : false, // Paid status starts as false for both
    });

    await newOrder.save();
    console.log('✅ Order saved in DB:', newOrder);

    // 1. CASH ON DELIVERY (COD) FLOW
    if (paymentMethod === 'cod') {
      // Clear the user's cart in the DB since order is placed
      await userModel.findByIdAndUpdate(userId, { cartData: {} });

      return res.json({
        success: true,
        message: 'Order placed successfully with Cash on Delivery',
        orderId: newOrder._id,
        paymentMethod: 'cod',
      });
    }

    // 2. ONLINE PAYMENT (RAZORPAY) FLOW
    // Create a Razorpay Order receipt matching the MongoDB Order ID
    const options = {
      amount: amount * 100, // Razorpay amount must be in paise (e.g. ₹500 = 50000 paise)
      currency: 'INR',
      receipt: String(newOrder._id),
    };

    const razorpayOrder = await getRazorpayInstance().orders.create(options);
    console.log('💳 Razorpay Order Created:', razorpayOrder);

    // Update order with the Razorpay Order ID for tracking signature validation
    newOrder.razorpayOrderId = razorpayOrder.id;
    await newOrder.save();

    // Respond with Razorpay details to initiate the client checkout modal
    res.json({
      success: true,
      razorpayOrder,
      key_id: process.env.RAZORPAY_KEY_ID,
      orderId: newOrder._id,
      paymentMethod: 'razorpay',
    });
  } catch (error) {
    console.error('❌ Order placement failed:', error);
    res.status(500).json({ success: false, message: 'Failed to place order: ' + error.message });
  }
};

/**
 * Controller to verify Razorpay signature on payment completion.
 * This ensures the payment was genuine and not spoofed by the client.
 */
const verifyOrder = async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    // Generate the expected signature according to Razorpay's hashing formula:
    // HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY)
      .update(text)
      .digest('hex');

    // Match signature to authenticate payment authenticity
    if (expectedSignature === razorpay_signature) {
      // Payment matches signature! Update DB status and clear user's cart
      const updatedOrder = await orderModel.findByIdAndUpdate(orderId, {
        payment: true,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      });

      // Clear the cart
      await userModel.findByIdAndUpdate(updatedOrder.userId, { cartData: {} });

      console.log('💳 Razorpay Payment Verified Success for order:', orderId);
      res.json({
        success: true,
        message: 'Payment successfully verified! Cart cleared.',
      });
    } else {
      // Signatures do not match! Cancel the transaction and delete the unpaid order record
      await orderModel.findByIdAndDelete(orderId);
      console.warn('⚠️ Razorpay Signature Verification Failed. Order Deleted:', orderId);
      res.json({
        success: false,
        message: 'Security verification failed. Invalid signature.',
      });
    }
  } catch (error) {
    console.error('❌ Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during payment verification.',
    });
  }
};

// User orders query for Customer dashboard
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId }).sort({ date: -1 });
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: 'Error fetching user orders.',
    });
  }
};

// Admin & Vendor order listing
const listOrders = async (req, res) => {
  try {
    // If the caller is a Vendor, only show orders belonging to their vendorId.
    // If Admin, show all orders.
    let filter = {};
    if (req.body.userRole === 'vendor') {
      filter = { vendorId: req.body.userId };
    }

    const orders = await orderModel.find(filter).sort({ date: -1 });
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Error listing orders:', error);
    res.json({
      success: false,
      message: 'Failed to list orders.',
    });
  }
};

// Update order status (with WebSockets triggered to push real-time updates to customer)
const updateStatus = async (req, res) => {
  try {
    const updatedOrder = await orderModel.findByIdAndUpdate(
      req.body.orderId,
      {
        status: req.body.status,
      },
      { new: true },
    );

    // Retrieve the Socket.io instance from the Express app context
    const io = req.app.get('io');
    if (io) {
      // Broadcast the new status to the client room: order_<id>
      io.to(`order_${req.body.orderId}`).emit('status_update', {
        orderId: req.body.orderId,
        status: req.body.status,
      });
      console.log(
        `📣 WebSocket broadcast: Order ${req.body.orderId} updated to "${req.body.status}"`,
      );
    }

    res.json({
      success: true,
      message: 'Status Updated',
      data: updatedOrder,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: 'Error updating order status.',
    });
  }
};

// Get single order details (highly useful for order tracking screen)
const getOrderDetails = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.orderId);
    if (!order) {
      return res.json({ success: false, message: 'Order not found' });
    }

    // Security: Validate that the user requesting details owns the order, or is a vendor/admin
    if (
      req.body.userRole !== 'admin' &&
      req.body.userRole !== 'vendor' &&
      order.userId !== req.body.userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Not authorized to view this order.',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order details.',
    });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, getOrderDetails };
