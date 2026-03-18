'use client';
import { useStore } from '@/store';
import { AppHeader } from './AppHeader';
import { XPStrip } from './XPStrip';
import { TabBar } from './TabBar';
import { ToastContainer } from './atoms/Toast';
import { AmbientBackground } from './AmbientBackground';

// Screens
import { DashboardScreen } from './screens/DashboardScreen';
import { TimerScreen } from './screens/TimerScreen';
import { PlanScreen } from './screens/PlanScreen';
import { AvatarScreen } from './screens/AvatarScreen';
import { MarketScreen } from './screens/MarketScreen';
import { CommunityScreen } from './screens/CommunityScreen';
import { TournamentScreen } from './screens/TournamentScreen';
import { RandoScreen } from './screens/RandoScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { ProfileScreen } from './screens/ProfileScreen';

export function AppShell() {
  const { activeTab } = useStore();

  const screenMap = {
    dashboard: <DashboardScreen />,
    timer: <TimerScreen />,
    plan: <PlanScreen />,
    avatar: <AvatarScreen />,
    market: <MarketScreen />,
    community: <CommunityScreen />,
    tournament: <TournamentScreen />,
    rando: <RandoScreen />,
    leaderboard: <LeaderboardScreen />,
    analytics: <AnalyticsScreen />,
    profile: <ProfileScreen />,
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative', minHeight: '100vh' }}>
      <AmbientBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <AppHeader />
        <XPStrip />
        <TabBar />
        <main style={{ padding: '12px 12px 80px' }}>
          {screenMap[activeTab]}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
