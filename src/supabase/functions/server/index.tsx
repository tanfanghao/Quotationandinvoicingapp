import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-ad0536e6/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== PRODUCTS =====

// Get all products
app.get("/make-server-ad0536e6/products", async (c) => {
  try {
    const products = await kv.getByPrefix("product:");
    return c.json({ products: products || [] });
  } catch (error) {
    console.log(`Error fetching products: ${error}`);
    return c.json({ error: "Failed to fetch products", details: String(error) }, 500);
  }
});

// Create or update a product
app.post("/make-server-ad0536e6/products", async (c) => {
  try {
    const product = await c.req.json();
    await kv.set(`product:${product.id}`, product);
    return c.json({ success: true, product });
  } catch (error) {
    console.log(`Error saving product: ${error}`);
    return c.json({ error: "Failed to save product", details: String(error) }, 500);
  }
});

// Delete a product
app.delete("/make-server-ad0536e6/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`product:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting product: ${error}`);
    return c.json({ error: "Failed to delete product", details: String(error) }, 500);
  }
});

// ===== CUSTOMERS =====

// Get all customers
app.get("/make-server-ad0536e6/customers", async (c) => {
  try {
    const customers = await kv.getByPrefix("customer:");
    return c.json({ customers: customers || [] });
  } catch (error) {
    console.log(`Error fetching customers: ${error}`);
    return c.json({ error: "Failed to fetch customers", details: String(error) }, 500);
  }
});

// Create or update a customer
app.post("/make-server-ad0536e6/customers", async (c) => {
  try {
    const customer = await c.req.json();
    await kv.set(`customer:${customer.id}`, customer);
    return c.json({ success: true, customer });
  } catch (error) {
    console.log(`Error saving customer: ${error}`);
    return c.json({ error: "Failed to save customer", details: String(error) }, 500);
  }
});

// Delete a customer
app.delete("/make-server-ad0536e6/customers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`customer:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting customer: ${error}`);
    return c.json({ error: "Failed to delete customer", details: String(error) }, 500);
  }
});

// ===== DOCUMENTS =====

// Get all documents
app.get("/make-server-ad0536e6/documents", async (c) => {
  try {
    const documents = await kv.getByPrefix("document:");
    return c.json({ documents: documents || [] });
  } catch (error) {
    console.log(`Error fetching documents: ${error}`);
    return c.json({ error: "Failed to fetch documents", details: String(error) }, 500);
  }
});

// Create or update a document
app.post("/make-server-ad0536e6/documents", async (c) => {
  try {
    const document = await c.req.json();
    await kv.set(`document:${document.documentNumber}`, document);
    return c.json({ success: true, document });
  } catch (error) {
    console.log(`Error saving document: ${error}`);
    return c.json({ error: "Failed to save document", details: String(error) }, 500);
  }
});

// Delete a document
app.delete("/make-server-ad0536e6/documents/:documentNumber", async (c) => {
  try {
    const documentNumber = c.req.param("documentNumber");
    await kv.del(`document:${documentNumber}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting document: ${error}`);
    return c.json({ error: "Failed to delete document", details: String(error) }, 500);
  }
});

// ===== GLASSES =====

// Get all glasses
app.get("/make-server-ad0536e6/glasses", async (c) => {
  try {
    const glasses = await kv.getByPrefix("glass:");
    return c.json({ glasses: glasses || [] });
  } catch (error) {
    console.log(`Error fetching glasses: ${error}`);
    return c.json({ error: "Failed to fetch glasses", details: String(error) }, 500);
  }
});

// Create or update a glass
app.post("/make-server-ad0536e6/glasses", async (c) => {
  try {
    const glass = await c.req.json();
    await kv.set(`glass:${glass.id}`, glass);
    return c.json({ success: true, glass });
  } catch (error) {
    console.log(`Error saving glass: ${error}`);
    return c.json({ error: "Failed to save glass", details: String(error) }, 500);
  }
});

// Delete a glass
app.delete("/make-server-ad0536e6/glasses/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`glass:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting glass: ${error}`);
    return c.json({ error: "Failed to delete glass", details: String(error) }, 500);
  }
});

// ===== STYLES =====

// Get all styles
app.get("/make-server-ad0536e6/styles", async (c) => {
  try {
    const styles = await kv.getByPrefix("style:");
    return c.json({ styles: styles || [] });
  } catch (error) {
    console.log(`Error fetching styles: ${error}`);
    return c.json({ error: "Failed to fetch styles", details: String(error) }, 500);
  }
});

// Create or update a style
app.post("/make-server-ad0536e6/styles", async (c) => {
  try {
    const style = await c.req.json();
    await kv.set(`style:${style.id}`, style);
    return c.json({ success: true, style });
  } catch (error) {
    console.log(`Error saving style: ${error}`);
    return c.json({ error: "Failed to save style", details: String(error) }, 500);
  }
});

// Delete a style
app.delete("/make-server-ad0536e6/styles/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`style:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting style: ${error}`);
    return c.json({ error: "Failed to delete style", details: String(error) }, 500);
  }
});

// ===== COLOURS =====

// Get all colours
app.get("/make-server-ad0536e6/colours", async (c) => {
  try {
    const colours = await kv.getByPrefix("colour:");
    return c.json({ colours: colours || [] });
  } catch (error) {
    console.log(`Error fetching colours: ${error}`);
    return c.json({ error: "Failed to fetch colours", details: String(error) }, 500);
  }
});

// Create or update a colour
app.post("/make-server-ad0536e6/colours", async (c) => {
  try {
    const colour = await c.req.json();
    await kv.set(`colour:${colour.id}`, colour);
    return c.json({ success: true, colour });
  } catch (error) {
    console.log(`Error saving colour: ${error}`);
    return c.json({ error: "Failed to save colour", details: String(error) }, 500);
  }
});

// Delete a colour
app.delete("/make-server-ad0536e6/colours/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`colour:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting colour: ${error}`);
    return c.json({ error: "Failed to delete colour", details: String(error) }, 500);
  }
});

// ===== ACCESSORIES =====

// Get all accessories
app.get("/make-server-ad0536e6/accessories", async (c) => {
  try {
    const accessories = await kv.getByPrefix("accessory:");
    return c.json({ accessories: accessories || [] });
  } catch (error) {
    console.log(`Error fetching accessories: ${error}`);
    return c.json({ error: "Failed to fetch accessories", details: String(error) }, 500);
  }
});

// Create or update an accessory
app.post("/make-server-ad0536e6/accessories", async (c) => {
  try {
    const accessory = await c.req.json();
    await kv.set(`accessory:${accessory.id}`, accessory);
    return c.json({ success: true, accessory });
  } catch (error) {
    console.log(`Error saving accessory: ${error}`);
    return c.json({ error: "Failed to save accessory", details: String(error) }, 500);
  }
});

// Delete an accessory
app.delete("/make-server-ad0536e6/accessories/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`accessory:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting accessory: ${error}`);
    return c.json({ error: "Failed to delete accessory", details: String(error) }, 500);
  }
});

Deno.serve(app.fetch);