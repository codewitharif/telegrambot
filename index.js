// index.js
const { Telegraf, Scenes, session, Markup } = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// States (jaise Python mein MAIN_MENU, ORDER_TRACKING, PRODUCT_INFO)
const { BaseScene, Stage } = Scenes;

// FAQ Database - same as Python
const FAQS = {
  "business hours":
    "🕒 Hamare business hours:\n\nMon-Fri: 9 AM - 6 PM\nSaturday: 10 AM - 4 PM\nSunday: Closed\n\nHum aapki service ke liye available hain!",
  "return policy":
    "🔄 Return Policy:\n\n• 7 days return window\n• Product unused hona chahiye\n• Original packaging required\n• Refund 5-7 business days mein\n\nKoi issue ho to humse contact karein!",
  shipping:
    "📦 Shipping Information:\n\n• Free shipping on orders above ₹500\n• Delivery: 3-5 business days\n• Metro cities: 2-3 days\n• Tracking details order ke baad milenge\n\nAap apna order track kar sakte hain!",
  payment:
    "💳 Payment Methods:\n\n• Credit/Debit Cards\n• UPI (GPay, PhonePe, Paytm)\n• Net Banking\n• Cash on Delivery (₹50 extra)\n\nSafe aur secure payment gateway!",
};

// Products - same
const PRODUCTS = {
  1: { name: "Wireless Headphones", price: "₹2,499", stock: "In Stock" },
  2: { name: "Smart Watch", price: "₹3,999", stock: "In Stock" },
  3: { name: "Power Bank 20000mAh", price: "₹1,299", stock: "Limited Stock" },
  4: { name: "Bluetooth Speaker", price: "₹1,799", stock: "In Stock" },
};

// Main Menu Keyboard
function getMainKeyboard() {
  return Markup.keyboard([
    ["📦 Order Track karein", "🛍️ Products dekhein"],
    ["❓ FAQs", "📞 Support se baat karein"],
    ["ℹ️ Business Hours", "📍 Store Location"],
  ]).resize();
}

// FAQ Keyboard
function getFaqKeyboard() {
  return Markup.keyboard([
    ["Return Policy", "Shipping Info"],
    ["Payment Methods", "Business Hours"],
    ["🏠 Main Menu"],
  ]).resize();
}

// Scene: Main Menu
const mainMenuScene = new BaseScene("mainMenu");

mainMenuScene.enter(async (ctx) => {
  await ctx.reply(
    `नमस्ते ${ctx.from.first_name}! 🙏\nMain aapka customer support assistant hoon.\nKoi bhi option select karein:`,
    getMainKeyboard()
  );
});

mainMenuScene.on("text", async (ctx) => {
  const text = ctx.message.text;

  if (text === "📦 Order Track karein") {
    await ctx.reply(
      "🔍 Apna order number enter karein:\n\n(Format: ORD12345)",
      Markup.keyboard([["🏠 Main Menu"]]).resize()
    );
    return ctx.scene.enter("orderTracking");
  }

  if (text === "🛍️ Products dekhein") {
    let msg = "🛍️ **Hamare Products:**\n\n";
    for (const [id, p] of Object.entries(PRODUCTS)) {
      msg += `${id}. ${p.name}\n   Price: ${p.price}\n   Status: ${p.stock}\n\n`;
    }
    msg += "Kisi product ke baare mein jaanne ke liye number bhejein (1-4)";

    await ctx.reply(msg, Markup.keyboard([["🏠 Main Menu"]]).resize());
    return ctx.scene.enter("productInfo");
  }

  if (text === "❓ FAQs") {
    await ctx.reply(
      "❓ **Frequently Asked Questions**\n\nKoi topic select karein:",
      getFaqKeyboard()
    );
    return ctx.scene.reenter(); // same scene mein hi rahega
  }

  if (text === "📞 Support se baat karein") {
    const msg = `
📞 **Customer Support**

Hamare support team se contact karein:

📧 Email: support@example.com
📱 Phone: +91-9876543210
💬 WhatsApp: +91-9876543210

Support Hours: Mon-Sat, 9 AM - 6 PM

Hum 24 hours ke andar respond karenge!
    `;
    await ctx.reply(msg, getMainKeyboard());
    return ctx.scene.reenter();
  }

  if (text === "ℹ️ Business Hours") {
    await ctx.reply(FAQS["business hours"], getMainKeyboard());
    return ctx.scene.reenter();
  }

  if (text === "📍 Store Location") {
    const msg = `
📍 **Store Location**

Head Office:
123, MG Road, Connaught Place
New Delhi - 110001

Landmark: Near Metro Station

Store Timings:
Mon-Sat: 10 AM - 8 PM
Sunday: 11 AM - 6 PM

Google Maps: [Location Link]
    `;
    await ctx.reply(msg, getMainKeyboard());
    return ctx.scene.reenter();
  }

  // FAQ direct buttons handling
  const lower = text.toLowerCase();
  if (
    [
      "return policy",
      "shipping info",
      "payment methods",
      "business hours",
    ].includes(lower)
  ) {
    let key = lower.replace(" info", "").replace(" methods", "").trim();
    if (key === "shipping") key = "shipping";
    if (key === "payment") key = "payment";

    const response =
      FAQS[key] || "Sorry, is topic pe information available nahi hai.";
    await ctx.reply(response, getFaqKeyboard());
    return ctx.scene.reenter();
  }

  if (text === "🏠 Main Menu") {
    await ctx.reply("Main Menu:", getMainKeyboard());
    return ctx.scene.reenter();
  }

  await ctx.reply(
    "Sorry, samajh nahi aaya. Koi option select karein:",
    getMainKeyboard()
  );
});

// Scene: Order Tracking
const orderTrackingScene = new BaseScene("orderTracking");

orderTrackingScene.enter(async (ctx) => {
  // already message bhej chuke hain entry se pehle
});

orderTrackingScene.on("text", async (ctx) => {
  const text = ctx.message.text;

  if (text === "🏠 Main Menu") {
    return ctx.scene.enter("mainMenu");
  }

  if (text.toUpperCase().startsWith("ORD")) {
    const msg = `
📦 **Order Status**

Order ID: ${text.toUpperCase()}
Status: ✅ Out for Delivery

Timeline:
• Order Placed: 12 Jan 2026
• Shipped: 13 Jan 2026
• Out for Delivery: 14 Jan 2026
• Expected Delivery: Today by 6 PM

Tracking Link: [Track Order]

Delivery partner: BlueDart
Contact: 1800-123-4567
    `;
    await ctx.reply(msg, getMainKeyboard());
    return ctx.scene.enter("mainMenu");
  }

  await ctx.reply(
    "❌ Invalid order number format.\n\nPlease enter order number in format: ORD12345",
    Markup.keyboard([["🏠 Main Menu"]]).resize()
  );
  // same scene mein rahega
});

// Scene: Product Info
const productInfoScene = new BaseScene("productInfo");

productInfoScene.on("text", async (ctx) => {
  const text = ctx.message.text;

  if (text === "🏠 Main Menu") {
    return ctx.scene.enter("mainMenu");
  }

  if (PRODUCTS[text]) {
    const p = PRODUCTS[text];
    const msg = `
🛍️ **${p.name}**

Price: ${p.price}
Availability: ${p.stock}

Features:
• High quality product
• 1 year warranty
• Free shipping on orders above ₹500

Order karne ke liye:
📱 Call/WhatsApp: +91-9876543210
🌐 Website: www.example.com

Kuch aur jaanna chahte hain?
    `;
    await ctx.reply(msg, getMainKeyboard());
    return ctx.scene.enter("mainMenu");
  }

  await ctx.reply(
    "Invalid product number. Please select 1-4:",
    Markup.keyboard([["🏠 Main Menu"]]).resize()
  );
});

// Stage setup
const stage = new Stage([mainMenuScene, orderTrackingScene, productInfoScene], {
  default: "mainMenu",
});

bot.use(session());
bot.use(stage.middleware());

// Start command → main menu
bot.start(async (ctx) => {
  await ctx.scene.enter("mainMenu");
});

// Help / cancel
bot.command("cancel", async (ctx) => {
  await ctx.reply(
    "Dhanyavaad! Koi aur help chahiye to message karein 😊",
    getMainKeyboard()
  );
  return ctx.scene.enter("mainMenu");
});

bot.command("help", (ctx) =>
  ctx.reply("Main menu se koi bhi option choose karo!")
);

// Launch
bot
  .launch()
  .then(() => console.log("🤖 Bot is running..."))
  .catch((err) => console.error("Error launching bot:", err));

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
