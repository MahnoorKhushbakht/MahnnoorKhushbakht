import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } 
) {
    try {
        const { id } = await params;
        const subscriptionId = id;
        
        if (!subscriptionId) {
            return NextResponse.json({
                success: false,
                message: "Subscription ID is required"
            }, { status: 400 });
        }

        const { autoRenew } = await req.json();

        const updatedSubscription = await prisma.userSubscription.update({
            where: { id: subscriptionId },
            data: { autoRenew }
        });

        return NextResponse.json({
            success: true,
            data: updatedSubscription
        }, { status: 200 });

    } catch (error) {
        console.error("Subscription PATCH API Error:", error);
        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}