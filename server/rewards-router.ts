/**
 * Pentest Lab Rewards System Router
 * Handles points, achievements, levels, and leaderboard
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";

// Achievement definitions
const ACHIEVEMENTS = {
  FIRST_LAB: {
    id: "first_lab",
    name: "First Steps",
    description: "Complete your first lab",
    category: "milestone",
    icon: "🎯",
  },
  FIVE_LABS: {
    id: "five_labs",
    name: "Lab Enthusiast",
    description: "Complete 5 labs",
    category: "milestone",
    icon: "⭐",
  },
  TEN_LABS: {
    id: "ten_labs",
    name: "Lab Master",
    description: "Complete 10 labs",
    category: "milestone",
    icon: "👑",
  },
  PERFECT_SCORE: {
    id: "perfect_score",
    name: "Perfect Execution",
    description: "Complete a lab with a perfect score",
    category: "skill",
    icon: "💯",
  },
  SPEED_DEMON: {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Complete a lab in under 5 minutes",
    category: "skill",
    icon: "⚡",
  },
  NO_HINTS: {
    id: "no_hints",
    name: "Self-Reliant",
    description: "Complete a lab without using hints",
    category: "skill",
    icon: "🧠",
  },
  GOLD_TIER: {
    id: "gold_tier",
    name: "Golden Achievement",
    description: "Reach Gold tier",
    category: "milestone",
    icon: "🏆",
  },
  DIAMOND_TIER: {
    id: "diamond_tier",
    name: "Diamond Elite",
    description: "Reach Diamond tier",
    category: "milestone",
    icon: "💎",
  },
};

// Point calculation
const POINTS_CONFIG = {
  BASE_POINTS: 100,
  PERFECT_BONUS: 50,
  SPEED_BONUS: 25, // Under 5 minutes
  NO_HINTS_BONUS: 30,
  DIFFICULTY_MULTIPLIER: {
    Beginner: 1,
    Intermediate: 1.5,
    Advanced: 2,
    Expert: 2.5,
  },
};

// Tier progression
const TIER_THRESHOLDS = {
  Bronze: 0,
  Silver: 500,
  Gold: 1500,
  Platinum: 3000,
  Diamond: 5000,
};

export const rewardsRouter = router({
  // Get user rewards summary
  getUserRewards: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return { success: false, error: "Database not available" };

      // Simulated rewards data - in production, query from database
      const mockRewards = {
        id: 1,
        userId: ctx.user.id,
        totalPoints: 1250,
        level: 3,
        currentTierPoints: 1250,
        tier: "Gold",
        labsCompleted: 12,
        perfectScores: 3,
        streakCount: 5,
        lastActivityDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return { success: true, data: mockRewards };
    } catch (error) {
      console.error("Failed to get user rewards:", error);
      return { success: false, error: "Failed to retrieve rewards" };
    }
  }),

  // Get user achievements
  getUserAchievements: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return { success: false, error: "Database not available" };

      // Simulated achievements
      const mockAchievements = [
        {
          id: 1,
          userId: ctx.user.id,
          achievementId: "first_lab",
          achievementName: "First Steps",
          description: "Complete your first lab",
          icon: "🎯",
          category: "milestone",
          unlockedAt: new Date(),
          progress: 100,
          maxProgress: 100,
          createdAt: new Date(),
        },
        {
          id: 2,
          userId: ctx.user.id,
          achievementId: "five_labs",
          achievementName: "Lab Enthusiast",
          description: "Complete 5 labs",
          icon: "⭐",
          category: "milestone",
          unlockedAt: new Date(),
          progress: 100,
          maxProgress: 100,
          createdAt: new Date(),
        },
        {
          id: 3,
          userId: ctx.user.id,
          achievementId: "gold_tier",
          achievementName: "Golden Achievement",
          description: "Reach Gold tier",
          icon: "🏆",
          category: "milestone",
          unlockedAt: new Date(),
          progress: 100,
          maxProgress: 100,
          createdAt: new Date(),
        },
      ];

      return { success: true, data: mockAchievements };
    } catch (error) {
      console.error("Failed to get achievements:", error);
      return { success: false, error: "Failed to retrieve achievements" };
    }
  }),

  // Record lab completion and award points
  recordLabCompletion: protectedProcedure
    .input(
      z.object({
        labId: z.number(),
        timeSpentSeconds: z.number(),
        hintsUsed: z.number().default(0),
        difficulty: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
        isPerfectScore: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Calculate points
        let points = POINTS_CONFIG.BASE_POINTS;
        const multiplier =
          POINTS_CONFIG.DIFFICULTY_MULTIPLIER[
            input.difficulty as keyof typeof POINTS_CONFIG.DIFFICULTY_MULTIPLIER
          ] || 1;
        points = Math.floor(points * multiplier);

        if (input.isPerfectScore) points += POINTS_CONFIG.PERFECT_BONUS;
        if (input.timeSpentSeconds < 300) points += POINTS_CONFIG.SPEED_BONUS;
        if (input.hintsUsed === 0) points += POINTS_CONFIG.NO_HINTS_BONUS;

        return {
          success: true,
          data: { pointsEarned: points, message: "Lab completion recorded!" },
        };
      } catch (error) {
        console.error("Failed to record lab completion:", error);
        return { success: false, error: "Failed to record completion" };
      }
    }),

  // Get leaderboard
  getLeaderboard: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(10) }))
    .query(async () => {
      try {
        // Simulated leaderboard data
        const mockLeaderboard = [
          {
            rank: 1,
            userId: 1,
            username: "SecurityMaster",
            totalPoints: 5250,
            labsCompleted: 25,
            tier: "Diamond",
          },
          {
            rank: 2,
            userId: 2,
            username: "PentestPro",
            totalPoints: 3800,
            labsCompleted: 18,
            tier: "Platinum",
          },
          {
            rank: 3,
            userId: 3,
            username: "HackerElite",
            totalPoints: 2100,
            labsCompleted: 12,
            tier: "Gold",
          },
          {
            rank: 4,
            userId: 4,
            username: "CyberNinja",
            totalPoints: 1500,
            labsCompleted: 8,
            tier: "Silver",
          },
          {
            rank: 5,
            userId: 5,
            username: "SecuritySeeker",
            totalPoints: 850,
            labsCompleted: 5,
            tier: "Bronze",
          },
        ];

        return { success: true, data: mockLeaderboard };
      } catch (error) {
        console.error("Failed to get leaderboard:", error);
        return { success: false, error: "Failed to retrieve leaderboard" };
      }
    }),

  // Get user's lab completion history
  getLabHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Simulated lab history
      const mockHistory = [
        {
          id: 1,
          userId: ctx.user.id,
          labId: 1,
          status: "completed",
          pointsEarned: 175,
          attemptsCount: 2,
          hintsUsed: 0,
          timeSpentSeconds: 420,
          completedAt: new Date(Date.now() - 86400000),
          createdAt: new Date(Date.now() - 86400000),
          updatedAt: new Date(Date.now() - 86400000),
        },
        {
          id: 2,
          userId: ctx.user.id,
          labId: 2,
          status: "completed",
          pointsEarned: 150,
          attemptsCount: 1,
          hintsUsed: 1,
          timeSpentSeconds: 600,
          completedAt: new Date(Date.now() - 172800000),
          createdAt: new Date(Date.now() - 172800000),
          updatedAt: new Date(Date.now() - 172800000),
        },
      ];

      return { success: true, data: mockHistory };
    } catch (error) {
      console.error("Failed to get lab history:", error);
      return { success: false, error: "Failed to retrieve history" };
    }
  }),

  // Get user's rank
  getUserRank: protectedProcedure.query(async () => {
    try {
      return {
        success: true,
        data: { rank: 15, totalUsers: 342 },
      };
    } catch (error) {
      console.error("Failed to get user rank:", error);
      return { success: false, error: "Failed to retrieve rank" };
    }
  }),
});
