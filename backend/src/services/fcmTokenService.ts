import prisma from "../config/prisma.js";

class FcmTokenService {
  async registerToken(userId: string, token: string) {
    return prisma.fcmToken.upsert({
      where: {
        token,
      },
      update: {
        userId,
      },
      create: {
        userId,
        token,
      },
    });
  }

  async removeToken(userId: string, token: string) {
    return prisma.fcmToken.deleteMany({
      where: {
        userId,
        token,
      },
    });
  }

  async getUserTokens(userId: string) {
    return prisma.fcmToken.findMany({
      where: {
        userId,
      },
      select: {
        token: true,
      },
    });
  }
}

export default new FcmTokenService();
