import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const userSchema = z.object({
  fullname: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["mentor", "mentee", "both"], {
    errorMap: () => ({ message: "Invalid role" }),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the input
    const result = userSchema.safeParse(body);
    
    if (!result.success) {
      // Return validation errors as JSON
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { fullname, username, email, password, role } = result.data;
    
    // Check if email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }
    
    // Check if username already exists
    const existingUserByUsername = await prisma.user.findFirst({
      where: { 
        username: username 
      },
    });
    
    if (existingUserByUsername) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }
    
    // Hash the password
    const hashedPassword = await hash(password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        fullname,
        username,
        email,
        password: hashedPassword,
        role: role.toUpperCase(),
      },
    });
    
    // Return success response (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      { user: userWithoutPassword, message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    
    // Always return errors as JSON
    return NextResponse.json(
      { error: "Something went wrong during registration" },
      { status: 500 }
    );
  }
}