import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

@Injectable()
export class RewardsService {
  async list(){ return prisma.reward.findMany({ where: { active: true }}) }

  async redeem(userId: string, rewardId: string){
    const reward = await prisma.reward.findUnique({ where: { id: rewardId } })
    if (!reward || !reward.active) throw new BadRequestException('Reward not available')
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new BadRequestException('User not found')
    if (user.points < reward.cost) throw new BadRequestException('Insufficient points')
    if (reward.stock <= 0) throw new BadRequestException('Out of stock')
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { points: { decrement: reward.cost } } }),
      prisma.reward.update({ where: { id: rewardId }, data: { stock: { decrement: 1 } } }),
      prisma.pointsLedger.create({ data: { userId, delta: -reward.cost, reason: `redeem:${reward.title}` } })
    ])
    return { ok: true, reward: { id: reward.id, title: reward.title } }
  }
}
