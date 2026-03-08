import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import Home from './pages/Home';
import Game from './pages/Game';
import GameOver from './pages/GameOver';
import Leaderboard from './pages/Leaderboard';
import HowToPlay from './pages/HowToPlay';
import { useWalletStore } from './store/walletStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { connected } = useWallet();
  const isVerified = useWalletStore((state) => state.isVerified);

  // Also check session storage as a secondary source of truth for SIWS
  const sessionVerified = sessionStorage.getItem('siws_verified') === 'true';

  if (!connected || (!isVerified && !sessionVerified)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen w-full bg-arcade-bg text-white selection:bg-neon-cyan/30">
        {/* CRT Overlays */}
        <div className="scanline" />
        <div className="crt-glow" />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/how-to-play" element={<HowToPlay />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          <Route
            path="/game"
            element={
              <ProtectedRoute>
                <Game />
              </ProtectedRoute>
            }
          />

          <Route
            path="/game-over"
            element={
              <ProtectedRoute>
                <GameOver />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
