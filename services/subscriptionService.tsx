// services/subscriptionService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class SubscriptionService {
    
    async createSubscription(
        userId: string,
        bundleId: string, 
        startDate: Date,  
        endDate: Date,    
        autoRenew: boolean,
    ) {
        try {
            console.log('Creating subscription with bundle:', bundleId);
            
            const subscription = await prisma.userSubscription.create({
                data: {
                    userId,
                    subscriptionBundleId: bundleId, 
                    startDate,
                    endDate,
                    renewalDate: endDate,
                    isActive: true,
                    autoRenew
                },
                include: {
                    bundle: true, 
                    user: {
                        select: { id: true, email: true }
                    }
                },
            });
            
            console.log('Subscription created successfully');
            return subscription;
            
        } catch (error) {
            console.error('Subscription creation failed:', error);
            throw error;
        }
    }
}

export const subscriptionService = new SubscriptionService();