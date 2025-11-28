import { NextRequest, NextResponse } from "next/server";
import { chatService } from "@/services/chatServices";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    console.log("Received question:", question);
    
    if(!question) {
      return NextResponse.json(
        { error: "No question provided" }, 
        { status: 400 }
      );
    }

    let userId = req.cookies.get('userId')?.value;
    
    if (!userId) {
      userId = `user_${Date.now()}`; 
      await prisma.user.create({
        data: {
          id: userId,
          createdAt: new Date(),
        }
      });
    }

    const result = await chatService.processMessage(userId, question);

    const response = NextResponse.json({ 
      success: true,
      data: result 
    }, { status: 200 });

    if (!req.cookies.get('userId')) {
      response.cookies.set('userId', userId, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30
      });
    }

    return response;

  } catch (error) { 
    console.error("API Error:", error);
    

    if (error instanceof Error) {
      if (error.message === 'FREE_QUOTA_EXCEEDED') {
        return NextResponse.json(
          { 
            success: false,
            error: {
              code: 'FREE_QUOTA_EXCEEDED',
              message: 'Free messages ended! Please subscribe.'
            }
          }, 
          { status: 402 }
        );
      }

      if (error.message === 'USER_NOT_FOUND') {
        return NextResponse.json(
          { error: "User not found" }, 
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}