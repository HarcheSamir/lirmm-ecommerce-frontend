// src/utils/schemas.js
import { z } from 'zod';

// --- Authentication Schemas (Existing) ---
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email format' }), // Added email validation
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' })
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .min(2, { message: 'Name must be at least 2 characters' }),
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email format' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'Confirm password is required' })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// --- New Category Schema ---
export const categorySchema = z.object({
  // Renamed from 'title' in form to 'name' for API consistency
  name: z
    .string()
    .min(1, { message: 'Le nom de la catégorie est requis' }),
  slug: z
    .string()
    .optional() // Making slug optional as API might generate it or it can be empty
    .refine(value => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), {
      message: 'Le slug ne peut contenir que des lettres minuscules, des chiffres et des traits d\'union',
    }),
  description: z
    .string()
    .optional(),
  // parentId and imageUrl are handled separately, not part of basic form validation here
});

// --- New Product Schema ---
// Validates only the core product fields, not variants/images/categories which are complex objects
export const productSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Le titre du produit est requis' }),
  sku: z
    .string()
    .min(1, { message: 'Le SKU du produit est requis' })
    .refine(value => !/\s/.test(value), {
      message: 'Le SKU ne doit pas contenir d\'espaces',
    }),
  description: z
    .string()
    .optional(),
  // isActive is usually handled by a toggle/checkbox, not typically in schema unless complex logic needed
});

// --- Variant Schema (Optional - useful if editing variants directly later) ---
// This isn't directly used by the main product form validation hook, but useful for reference
export const variantSchema = z.object({
    sku: z.string().optional().refine(value => !value || !/\s/.test(value), { message: 'Le SKU ne doit pas contenir d\'espaces' }),
    price: z.preprocess(
        (val) => (val === "" ? undefined : parseFloat(String(val))),
        z.number({ invalid_type_error: 'Le prix doit être un nombre' }).positive({ message: 'Le prix doit être positif' })
    ),
    costPrice: z.preprocess(
        (val) => (val === "" ? undefined : parseFloat(String(val))),
        z.number({ invalid_type_error: 'Le prix coûtant doit être un nombre' }).positive({ message: 'Le prix coûtant doit être positif' }).optional().nullable()
    ),
    stockQuantity: z.preprocess(
        (val) => (val === "" ? undefined : parseInt(String(val), 10)),
        z.number({ invalid_type_error: 'La quantité doit être un nombre entier' }).int().nonnegative({ message: 'La quantité ne peut pas être négative' })
    ),
    lowStockThreshold: z.preprocess(
        (val) => (val === "" ? undefined : parseInt(String(val), 10)),
        z.number({ invalid_type_error: 'Le seuil doit être un nombre entier' }).int().nonnegative({ message: 'Le seuil ne peut pas être négatif' }).optional().nullable()
    ),
    attributes: z.record(z.any()).optional(), // Keep attributes flexible for now
});