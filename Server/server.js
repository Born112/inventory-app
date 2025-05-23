import express from "express";
import dotenv from "dotenv";
import supabase from "./supabaseClient.js";
import { productSchema } from "../schemas/productSchema.js";
import authRoutes from "./routes/authRoutes.js";
import { authenticateToken } from "./middlewares/authenticateToken.js";
import { authorizeRoles } from "./middlewares/authorizeRoles.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(authRoutes);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../public")));

// POST /products — добавить новый товар
app.post("/products",
  authenticateToken,
  authorizeRoles("admin", "worker"),
  async (req, res) => {
  try {
    const parsed = productSchema.parse(req.body); // ВАЛИДАЦИЯ

    const { data, error } = await supabase
      .from("products")
      .insert([parsed])
      .select();

    if (error) throw error;

    res.status(201).json({ success: true, product: data[0] });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ success: false, error: err.errors });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});


app.put("/products/:id", authenticateToken,
  authorizeRoles("admin", "worker"),
  async (req, res) => {
  const { id } = req.params;

  try {
    const parsed = productSchema.parse(req.body); // ВАЛИДАЦИЯ

    const { data, error } = await supabase
      .from("products")
      .update(parsed)
      .eq("id", id)
      .select();

    if (error) throw error;
    if (data.length === 0) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    res.json({ success: true, product: data[0] });
  } catch (err) {
    if (err.name === "ZodError") {
      return res.status(400).json({ success: false, error: err.errors });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});


app.delete("/products/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
  const id = req.params.id;

  try {
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .select();  // Вот эта строка!

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    return res.json({ success: true, deletedProduct: data[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});



// GET /products — получить список всех товаров
app.get("/products", async (req, res) => {
  try {
    const { data, error } = await supabase.from("products").select("*");

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Корневой маршрут — для проверки работы API
app.get("/", (req, res) => {
  res.send("Inventory API is running");
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
