import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
  businessName: z.string().min(2, 'Business/Cafe name is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const branchSchema = z.object({
  branchName: z.string().min(2, 'Branch name is required'),
  branchCode: z.string().min(2, 'Branch code is required (e.g. BR-01)'),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(5, 'Address is required'),
  phone: z.string().min(5, 'Phone number is required'),
  managerId: z.string().optional(),
});

export const tableSchema = z.object({
  branchId: z.string().min(1, 'Branch selection is required'),
  tableNumber: z.string().min(1, 'Table number is required (e.g. T-12)'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1').default(4),
});

export const categorySchema = z.object({
  branchId: z.string().min(1, 'Branch selection is required'),
  name: z.string().min(2, 'Category name is required'),
  description: z.string().optional(),
  sortOrder: z.coerce.number().min(1).default(1),
});

export const menuItemSchema = z.object({
  branchId: z.string().min(1, 'Branch selection is required'),
  categoryId: z.string().min(1, 'Category selection is required'),
  name: z.string().min(2, 'Item name is required'),
  description: z.string().min(5, 'Description is required'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  preparationTimeMinutes: z.coerce.number().min(1).default(10),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const restaurantSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  businessSlug: z.string().min(2, 'Slug is required'),
  logoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  brandColor: z.string().default('#7C3AED'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(5, 'Phone is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});