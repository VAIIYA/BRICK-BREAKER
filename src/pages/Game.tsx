import React from 'react';
import GameCanvas from '../components/game/GameCanvas';
import HUD from '../components/game/HUD';

const Game: React.FC = () => {
    return (
        <div className="min-h-screen bg-arcade-bg flex items-center justify-center p-4">
            <HUD />
            <GameCanvas />
        </div>
    );
};

export default Game;
