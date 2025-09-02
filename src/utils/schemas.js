//src/utils/schemas.js

import { z } from 'zod';

// --- Language-specific Schemas ---
const langStringSchema = (field = 'field') => z.string().min(1, { message: `Le ${field} est requis` });

const multiLangSchema = (field = 'field') => z.object({
  fr: langStringSchema(`${field} (FR)`),
  en: langStringSchema(`${field} (EN)`),
  ar: langStringSchema(`${field} (AR)`),
});

const multiLangSchemaOptional = () => z.object({
  fr: z.string().optional(),
  en: z.string().optional(),
  ar: z.string().optional(),
}).optional();


// --- Authentication Schemas (Existing) ---
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email format' }),
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

// --- Category Schemas ---
export const categorySchema = z.object({
  name: multiLangSchema('nom'),
  slug: z
    .string()
    .optional()
    .refine(value => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), {
      message: 'Le slug ne peut contenir que des lettres minuscules, des chiffres et des traits d\'union',
    }),
  description: multiLangSchemaOptional(),
});

// --- Product Schema ---
export const productSchema = z.object({
  name: multiLangSchema('nom du produit'),
  sku: z
    .string()
    .min(1, { message: 'Le SKU du produit est requis' })
    .refine(value => !/\s/.test(value), {
      message: 'Le SKU ne doit pas contenir d\'espaces',
    }),
  description: multiLangSchemaOptional(),
});

// --- Variant Schema (Optional - useful if editing variants directly later) ---
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
    attributes: z.record(z.any()).optional(),
});

export const setPasswordSchema = z.object({
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

export const inviteUserSchema = z.object({
  name: z
    .string()
    .min(2, { message: "User's name must be at least 2 characters" }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" }),
  roleId: z
    .string()
    .min(1, { message: "You must select a role for the user" }),
});

export const roleSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Role name must be at least 2 characters' }),
  description: z
    .string()
    .optional(),
});

export const currencySchema = z.object({
  code: z.string()
    .min(3, { message: 'Code must be 3 characters' })
    .max(3, { message: 'Code must be 3 characters' })
    .regex(/^[A-Z]+$/, { message: 'Code must be uppercase letters' }),
  rateVsBase: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number({ required_error: 'Rate is required', invalid_type_error: 'Rate must be a number' })
      .positive({ message: 'Rate must be a positive number' })
  ),
});

export const promotionSchema = z.object({
  title: multiLangSchema('titre'),
  subtitle: multiLangSchemaOptional(),
  tagline: multiLangSchemaOptional(),
  ctaText: multiLangSchema('texte du bouton'),
  ctaLink: z.string().min(1, { message: "Le lien du bouton est requis" }).url({ message: "Veuillez entrer une URL valide" }),
  displayOrder: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number({ invalid_type_error: "L'ordre d'affichage doit être un nombre" }).int().default(0)
  ),
  isActive: z.boolean().default(false),
  // --- START: SURGICAL CORRECTION ---
  expiresAt: z.preprocess((val) => {
    if (!val) return undefined; // Handles empty string or null from the form
    const date = new Date(val);
    // Handles 'Invalid Date' object from react-hook-form's valueAsDate
    return date instanceof Date && !isNaN(date) ? date : undefined;
  }, z.date().optional().nullable()),
  // --- END: SURGICAL CORRECTION ---
});