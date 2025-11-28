import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { subscriptionService } from '@/services/subscriptionService';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const userId = req.cookies.get('userId')?.value;
        
        if (!userId) {
            return NextResponse.json({ 
                success: false, 
                message: "User not identified" 
            }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json({ 
                success: false, 
                message: "User not found" 
            }, { status: 404 });
        }

        const subscriptions = await prisma.userSubscription.findMany({ 
            where: { 
                userId,
                isActive: true,
                endDate: { gt: new Date() } 
            },
            include: { 
                bundle: true 
            },
            
        });

       

        return NextResponse.json({ 
            success: true, 
            data: subscriptions 
        }, { status: 200 });
        
    } catch (error) {
        console.error("Subscription GET API Error:", error);
        return NextResponse.json({
            success: false, 
            message: "Internal server error" 
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { tier, billingCycle, price, autoRenew, messagesLimit } = await req.json();
        
        if(!tier || !billingCycle || price === undefined || autoRenew === undefined) {
            return NextResponse.json({ 
                success: false, 
                message: "Missing required fields" 
            }, { status: 400 });
        }

     

        let userId = req.cookies.get('userId')?.value;
     
    
        if (!userId) {
            userId = `user_${Date.now()}`; 
            await prisma.user.create({
                data: {
                    id: userId,
                    email: null,
                    createdAt: new Date(),
                }
            });
        }

        let bundle = await prisma.subscriptionBundle.findFirst({ 
            where: { 
                tier: tier.toUpperCase(),
                billingCycle: billingCycle.toUpperCase() 
            } 
        });

        if (!bundle) {
            
            bundle = await prisma.subscriptionBundle.create({
                data: {
                    tier: tier.toUpperCase(),
                    billingCycle: billingCycle.toUpperCase(),
                    maxMessages: messagesLimit === "INFINITE" ? null : messagesLimit,
                    price: price
                }
            });
            
        }

        let usageRecord = await prisma.usageRecord.findFirst({
            where: { userId }
        });
        if (!usageRecord) {
            usageRecord = await prisma.usageRecord.create({
                data: {
                    userId: userId,
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear(),
                    freeUsed: 0,
                    paidUsed: 0
                }
            });
        }
 

        const startDate = new Date();
        const endDate = new Date(startDate);

        if (billingCycle === "MONTHLY") {
            endDate.setMonth(endDate.getMonth() + 1);
        } else if (billingCycle === "YEARLY") {
            endDate.setFullYear(endDate.getFullYear() + 1);
        }

        const bundleId = bundle.id;

        const subscription = await subscriptionService.createSubscription(
            userId,
            bundleId,
            startDate,
            endDate,
            autoRenew,
        );

        const response = NextResponse.json({ 
            success: true, 
            data: subscription,
            message: `Successfully subscribed to ${tier} plan!`
        }, { status: 200 });

        if (!req.cookies.get('userId')) {
            response.cookies.set('userId', userId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 30
            });
        }

        return response;

    } catch (error) {
        console.error("Subscription API Error:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Internal server error" 
        }, { status: 500 });
    }
}