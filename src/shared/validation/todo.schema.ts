import { z } from "zod";

export const todoIdSchema = z.string().min(1);

export const createTodoInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Todo title is required")
    .max(200, "Todo title is too long"),
});

export const updateTodoInputSchema = z.object({
  id: z.string().min(1),

  title: z
    .string()
    .trim()
    .min(1, "Todo title is required")
    .max(200, "Todo title is too long"),

  completed: z.boolean(),
});

export const todoSchema = z
  .object({
    id: z.string().min(1),

    title: z.string().min(1).max(200),

    completed: z.boolean(),

    createdAt: z.string().min(1),

    updatedAt: z.string().min(1),
  })
  .strict();

export const todoFileSchema = z
  .array(todoSchema)
  .max(10_000, "Todo file contains too many todos");
