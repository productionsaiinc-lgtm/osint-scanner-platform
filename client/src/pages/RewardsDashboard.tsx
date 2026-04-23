import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Trophy, Zap, Award, TrendingUp, Clock, Target } from "lucide-react";

export function RewardsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user rewards
  const rewardsQuery = trpc.rewards.getUserRewards.useQuery();
  const achievementsQuery = trpc.rewards.getUserAchievements.useQuery();
  const leaderboardQuery = trpc.rewards.getLeaderboard.useQuery({ limit: 10 });
  const historyQuery = trpc.rewards.getLabHistory.useQuery();
  const rankQuery = trpc.rewards.getUserRank.useQuery();

  const rewards = rewardsQuery.data?.data;
  const achievements = achievementsQuery.data?.data || [];
  const leaderboard = leaderboardQuery.data?.data || [];
  const history = historyQuery.data?.data || [];
  const rank = rankQuery.data?.data;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Diamond":
        return "from-blue-500 to-purple-500";
      case "Platinum":
        return "from-gray-300 to-gray-500";
      case "Gold":
        return "from-yellow-400 to-yellow-600";
      case "Silver":
        return "from-gray-400 to-gray-600";
      default:
        return "from-orange-400 to-orange-600";
    }
  };

  const getNextTierPoints = (currentPoints: number) => {
    const tiers = [
      { name: "Silver", points: 500 },
      { name: "Gold", points: 1500 },
      { name: "Platinum", points: 3000 },
      { name: "Diamond", points: 5000 },
    ];

    for (const tier of tiers) {
      if (currentPoints < tier.points) {
        return tier;
      }
    }
    return null;
  };

  const nextTier = rewards ? getNextTierPoints(rewards.totalPoints) : null;
  const progressToNextTier = nextTier
    ? ((rewards!.totalPoints - (nextTier.points - 1000)) / 1000) * 100
    : 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rewards & Achievements</h1>
        <p className="text-muted-foreground">Track your progress, earn points, and unlock achievements</p>
      </div>

      {rewards && (
        <div className={`bg-gradient-to-r ${getTierColor(rewards.tier)} rounded-lg p-6 text-white`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm opacity-90">Current Tier</p>
              <h2 className="text-4xl font-bold">{rewards.tier}</h2>
              <p className="text-sm opacity-75 mt-2">Level {rewards.level}</p>
            </div>
            <div className="text-right">
              <Trophy className="w-12 h-12 mb-2" />
              <p className="text-3xl font-bold">{rewards.totalPoints}</p>
              <p className="text-sm opacity-90">Total Points</p>
            </div>
          </div>

          {nextTier && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm">Progress to {nextTier.name}</p>
                <p className="text-sm font-semibold">{nextTier.points - rewards.totalPoints} points needed</p>
              </div>
              <Progress value={Math.min(progressToNextTier, 100)} className="h-2" />
            </div>
          )}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {rewards && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Labs Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{rewards.labsCompleted}</p>
                  <p className="text-xs text-muted-foreground">challenges solved</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Perfect Scores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{rewards.perfectScores}</p>
                  <p className="text-xs text-muted-foreground">flawless runs</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Current Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{rewards.streakCount}</p>
                  <p className="text-xs text-muted-foreground">consecutive labs</p>
                </CardContent>
              </Card>

              {rank && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Global Rank
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">#{rank.rank}</p>
                    <p className="text-xs text-muted-foreground">of {rank.totalUsers} users</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Tier Benefits</CardTitle>
              <CardDescription>Unlock exclusive rewards as you advance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <div>
                  <p className="font-semibold">Bronze</p>
                  <p className="text-sm text-muted-foreground">0 - 499 points</p>
                </div>
                <Badge>Starter</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <div>
                  <p className="font-semibold">Silver</p>
                  <p className="text-sm text-muted-foreground">500 - 1,499 points</p>
                </div>
                <Badge variant="secondary">+5% Bonus Points</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <div>
                  <p className="font-semibold">Gold</p>
                  <p className="text-sm text-muted-foreground">1,500 - 2,999 points</p>
                </div>
                <Badge variant="secondary">+10% Bonus Points</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <div>
                  <p className="font-semibold">Platinum</p>
                  <p className="text-sm text-muted-foreground">3,000 - 4,999 points</p>
                </div>
                <Badge variant="secondary">+15% Bonus Points</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <div>
                  <p className="font-semibold">Diamond</p>
                  <p className="text-sm text-muted-foreground">5,000+ points</p>
                </div>
                <Badge variant="secondary">+25% Bonus Points</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <Card key={achievement.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{achievement.achievementName}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        <Badge className="mt-2 capitalize">{achievement.category}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">No achievements unlocked yet. Start completing labs!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Global leaderboard rankings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry: any) => (
                  <div key={entry.rank} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold">
                        {entry.rank <= 3 ? (
                          <span className="text-lg">
                            {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                          </span>
                        ) : (
                          entry.rank
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{entry.username}</p>
                        <p className="text-sm text-muted-foreground">{entry.labsCompleted} labs completed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{entry.totalPoints} pts</p>
                      <Badge variant="outline">{entry.tier}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lab Completion History</CardTitle>
              <CardDescription>Your recent lab completions</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((entry: any) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-semibold">Lab #{entry.labId}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {Math.floor(entry.timeSpentSeconds / 60)}m
                          </Badge>
                          {entry.hintsUsed > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {entry.hintsUsed} hint{entry.hintsUsed > 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">+{entry.pointsEarned}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.completedAt
                            ? new Date(entry.completedAt).toLocaleDateString()
                            : "In Progress"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">No lab completions yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
