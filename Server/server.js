import express from "express"
import dotenv from "dotenv"
import supabase from "./supabaseClient.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get("/", (req, res) => {
  res.send("Inventory API is running")
})

app.get("/products", async (req, res) => {
  const { data, error } = await supabase.from("products").select("*")
  if (error) {
    return res.status(500).json({ error: error.message })
  }
  res.json(data)
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
