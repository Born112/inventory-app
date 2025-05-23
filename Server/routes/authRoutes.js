// routes/authRoutes.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import supabase from "../supabaseClient.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Лучше вынести в .env

// POST /register
router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("users")
      .insert([{ email, password: hashedPassword, role }])
      .select();

    if (error) throw error;

    res.status(201).json({ success: true, user: data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, data.password);

    if (!valid) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: data.id, email: data.email, role: data.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token, user: { email: data.email, role: data.role } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
