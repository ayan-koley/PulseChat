import z from 'zod';

export const signupPostRequestBodySchema = z.object(
    {
        username: z.string().trim().toLowerCase().min(3),
        fullName: z.string().trim(),
        email: z.email(),
        password: z.string().min(4).trim()
    }
)

export const loginPostRequestBodySchema = z.object(
    {
        username: z.string().optional(),
        email: z.string().optional(),
        password: z.string().min(4).trim()
    }
)

export const changePasswordPostRequestBodySchema = z.object({
    currentPassword: z.string().min(4).trim(),
    newPassword: z.string().min(4).trim()
})