import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class ChatServices {
    async generateAnswer(question: string): Promise<string> {
        const answer = `You said: ${question}`;
        await new Promise((resolve) => setTimeout(resolve, 1000)); 
        return answer;
    }

   
    private isFirstDayOfMonth(): boolean {
        const today = new Date();
        return today.getDate() === 1;
    }

  
    private async getOrCreateUsageRecord(userId: string) {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
     
        if (this.isFirstDayOfMonth()) {
            console.log(`🔄 First day of month - checking reset for user: ${userId}`);
            
     
            await prisma.usageRecord.deleteMany({
                where: { 
                    userId,
                    month: currentMonth,
                    year: currentYear 
                }
            });
            
            console.log(`✅ Reset usage record for user: ${userId}`);
        }

   
        let usageRecord = await prisma.usageRecord.findFirst({
            where: { 
                userId, 
                month: currentMonth, 
                year: currentYear 
            }
        });

        if (!usageRecord) {
            usageRecord = await prisma.usageRecord.create({
                data: {
                    userId: userId,
                    month: currentMonth,
                    year: currentYear,
                    freeUsed: 0,
                    paidUsed: 0 
                }
            });
            console.log(`Created new usage record for user: ${userId}`);
        }

        return usageRecord;
    }

   
    async resetAllMonthlyQuotas() {
        try {
            if (!this.isFirstDayOfMonth()) {
                return { 
                    success: false, 
                    message: 'Not the first day of month - no reset needed' 
                };
            }

            const currentMonth = new Date().getMonth() + 1;
            const currentYear = new Date().getFullYear();

            console.log(`🔄 Resetting all monthly quotas for ${currentMonth}/${currentYear}...`);

        
            const deleteResult = await prisma.usageRecord.deleteMany({
                where: {
                    month: currentMonth,
                    year: currentYear
                }
            });

            console.log(`✅ Reset ${deleteResult.count} user quotas`);
            
            return { 
                success: true, 
                message: `Reset ${deleteResult.count} user quotas for ${currentMonth}/${currentYear}`,
                count: deleteResult.count 
            };

        } catch (error) {
            console.error('❌ Error resetting quotas:', error);
            throw error;
        }
    }

    async processMessage(userId: string, message: string) { 
        const user = await prisma.user.findUnique({ 
            where: { id: userId },
            include: {
                subscriptions: {
                    where: {
                        isActive: true,
                        endDate: { gt: new Date() }
                    },
                    include: { bundle: true }
                }
            }
        });

        if (!user) {
            throw new Error('USER_NOT_FOUND');
        }

        
        const usageRecord = await this.getOrCreateUsageRecord(user.id);

        const activeSubscription = user.subscriptions[0];
        
        if (!activeSubscription) {
     
            if (usageRecord.freeUsed >= 3) { 
                throw new Error('FREE_QUOTA_EXCEEDED');
            }
            
            const answer = await this.generateAnswer(message);
            const tokensUsed = answer.split(' ').length;

            await prisma.usageRecord.update({
                where: { id: usageRecord.id },
                data: { freeUsed: { increment: 1 } }
            });

            return {
                answer,
                messageId: `free_${Date.now()}`,
                tokensUsed,
                quotaInfo: {
                    freeRemaining: 3 - (usageRecord.freeUsed + 1),
                    isFree: true,
                    requiresSubscription: (usageRecord.freeUsed + 1) >= 3,
                    resetDate: this.getNextResetDate(), 
                    isFirstDayOfMonth: this.isFirstDayOfMonth() 
                }
            };
        } else {

            const maxMessages = activeSubscription.bundle.maxMessages;
            
            if (maxMessages !== null && usageRecord.paidUsed >= maxMessages) {
                throw new Error('PAID_QUOTA_EXCEEDED');
            }
            
            const answer = await this.generateAnswer(message);
            const tokensUsed = answer.split(' ').length;

            await prisma.usageRecord.update({
                where: { id: usageRecord.id },
                data: { paidUsed: { increment: 1 } }
            });

            const messagesRemaining = maxMessages !== null 
                ? maxMessages - usageRecord.paidUsed - 1  
                : 'Unlimited';
            
            await prisma.chatMessage.create({
                data: {
                    userId: user.id,
                    question: message,
                    answers: answer,
                    token: tokensUsed,
                }
            });
            return {
                answer,
                messageId: `paid_${Date.now()}`,
                tokensUsed,
                quotaInfo: {
                    freeRemaining: 0,
                    isFree: false,
                    bundleTier: activeSubscription.bundle.tier,
                    maxMessages: maxMessages,
                    messagesRemaining: messagesRemaining,
                    usedMessages: usageRecord.paidUsed + 1,
                    resetDate: this.getNextResetDate(), 
                    isFirstDayOfMonth: this.isFirstDayOfMonth() 
                }
            };
        }
    }


    private getNextResetDate(): string {
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return nextMonth.toISOString().split('T')[0]; 
    }

 
    getCurrentMonthInfo() {
        const today = new Date();
        return {
            currentMonth: today.getMonth() + 1,
            currentYear: today.getFullYear(),
            isFirstDay: today.getDate() === 1,
            nextResetDate: this.getNextResetDate()
        };
    }
}

export const chatService = new ChatServices();