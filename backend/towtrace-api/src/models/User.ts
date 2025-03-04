import { z } from 'zod';

// User Schema for validation
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'dispatcher', 'driver', 'manager', 'system_admin', 'client_admin']),
  tenant_id: z.string().uuid(),
  two_factor_secret: z.string().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

// Type based on the schema
export type User = z.infer<typeof UserSchema>;

// Schema for creating a new user
export const CreateUserSchema = UserSchema.omit({ 
  id: true, 
  created_at: true, 
  updated_at: true 
});

// Type for creating a new user
export type CreateUser = z.infer<typeof CreateUserSchema>;

// Schema for updating a user
export const UpdateUserSchema = UserSchema.partial().omit({ 
  id: true, 
  created_at: true,
  updated_at: true 
});

// Type for updating a user
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// User response schema (what is returned to the client)
export const UserResponseSchema = UserSchema.omit({
  two_factor_secret: true
});

// Type for user response
export type UserResponse = z.infer<typeof UserResponseSchema>;