import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
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

        const existingSubscription = await prisma.userSubscription.findUnique({
            where: { id: subscriptionId }
        });

        if (!existingSubscription) {
            return NextResponse.json({
                success: false,
                message: "Subscription not found"
            }, { status: 404 });
        }

        const cancelledSubscription = await prisma.userSubscription.update({
            where: { id: subscriptionId },
            data: { 
                autoRenew: false,
                isActive: false
            }
        });


        return NextResponse.json({
            success: true,
            data: cancelledSubscription,
            message: "Subscription cancelled successfully"
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 });
    }
}