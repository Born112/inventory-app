import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  quantity: z.number().int().nonnegative("Количество не может быть отрицательным"),
  price: z.number().nonnegative("Цена не может быть отрицательной"),
  description: z.string().optional(),
});
