'use client';

import { useEffect, useState, useRef } from 'react';

const TILE_SIZE = 32; 
const MAP_SIZE = 320; 

const INITIAL_MAZE = [
    [0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 1, 0],
    [0, 0, 0, 1, 2, 0, 0, 1, 0, 0], // Flor 2
    [1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0, 1, 1, 1, 0, 0],
    [0, 1, 3, 1, 0, 0, 0, 1, 1, 0], // Flor 3
    [0, 1, 0, 1, 1, 1, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 4, 1], // Flor 4 (Última)
    [1, 1, 1, 1, 0, 0, 0, 1, 0, 0]
];

// Mensagens personalizadas atualizadas
const FLOWER_MESSAGES = {
    2: "🌷 'Oii gatinha!!'",
    3: "🌻 'Mais uma flor, para a melhor produtora rumo a cannes'",
    4: "🌹 'Você decifrou o labirinto meu bem! Final do jogo: Prepare o coração, aumenta o som e solta o Jazz!! ❤️'"
};

export default function Game() {
    const canvasRef = useRef(null);
    const audioRef = useRef(null);
    const [maze, setMaze] = useState(INITIAL_MAZE);
    const [player, setPlayer] = useState({ x: 0, y: 0 });
    const [message, setMessage] = useState("Encontre as flores na tela para liberar os recados...");

    const drawMaze = (ctx, currentMaze, currentPlayer) => {
        ctx.clearRect(0, 0, MAP_SIZE, MAP_SIZE);
        
        for (let r = 0; r < currentMaze.length; r++) {
            for (let c = 0; c < currentMaze[r].length; c++) {
                if (currentMaze[r][c] === 1) {
                    ctx.fillStyle = "#3d348b"; 
                    ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                } else if ([2, 3, 4].includes(currentMaze[r][c])) {
                    ctx.font = "20px serif"; 
                    ctx.fillText("🌸", c * TILE_SIZE + 4, r * TILE_SIZE + 24);
                }
            }
        }
        
        ctx.font = "18px serif";
        ctx.fillText("👩🏽‍🎤🎸", currentPlayer.x * TILE_SIZE + 1, currentPlayer.y * TILE_SIZE + 24);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            drawMaze(ctx, maze, player);
        }
    }, [maze, player]);

    const movePlayer = (direction) => {
        let nextX = player.x;
        let nextY = player.y;
        
        if (direction === "UP") nextY--;
        if (direction === "DOWN") nextY++;
        if (direction === "LEFT") nextX--;
        if (direction === "RIGHT") nextX++;
        
        if (nextY >= 0 && nextY < maze.length && nextX >= 0 && nextX < maze[0].length) {
            if (maze[nextY][nextX] !== 1) {
                setPlayer({ x: nextX, y: nextY });
                
                const tileValue = maze[nextY][nextX];
                if (FLOWER_MESSAGES[tileValue]) {
                    setMessage(FLOWER_MESSAGES[tileValue]);
                    
                    if (tileValue === 4 && audioRef.current) {
                        audioRef.current.play().catch(err => {
                            console.log("Erro ao reproduzir áudio:", err);
                        });
                    }

                    const newMaze = maze.map((row, r) => 
                        row.map((cell, c) => (r === nextY && c === nextX ? 0 : cell))
                    );
                    setMaze(newMaze);
                }
            }
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowUp") movePlayer("UP");
            if (e.key === "ArrowDown") movePlayer("DOWN");
            if (e.key === "ArrowLeft") movePlayer("LEFT");
            if (e.key === "ArrowRight") movePlayer("RIGHT");
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [player, maze]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#f7ede2] font-mono text-[#3d348b] p-2 select-none">
            <div className="text-center bg-white p-5 rounded-2xl shadow-xl max-w-sm w-full">
                <h1 className="text-xl font-bold mb-1">O Labirinto das Flores Perdidas 🌷</h1>
                <p className="text-[11px] mb-3 text-gray-500">Ajude a baixista a encontrar o caminho!</p>
                
                <canvas 
                    ref={canvasRef} 
                    width={MAP_SIZE} 
                    height={MAP_SIZE} 
                    className="bg-[#f3c68f] border-4 border-[#3d348b] rounded-lg mx-auto shadow-inner"
                />
                
                <div className="mt-3 p-3 bg-[#fefae0] border-l-4 border-red-500 rounded text-xs min-h-[55px] flex items-center justify-center text-center">
                    <p className="font-semibold">{message}</p>
                </div>

                {/* D-PAD ERGONÔMICO PARA MOBILE */}
                <div className="mt-6 mb-2 grid grid-cols-3 gap-2 mx-auto w-48 h-48 justify-items-center items-center">
                    <div></div>
                    <button 
                        onTouchStart={() => movePlayer("UP")} 
                        onClick={() => movePlayer("UP")}
                        className="w-14 h-14 bg-[#3d348b] text-white active:bg-[#5b4fcd] rounded-xl font-bold shadow-lg flex items-center justify-center text-xl touch-none"
                    >
                        ▲
                    </button>
                    <div></div>

                    <button 
                        onTouchStart={() => movePlayer("LEFT")} 
                        onClick={() => movePlayer("LEFT")}
                        className="w-14 h-14 bg-[#3d348b] text-white active:bg-[#5b4fcd] rounded-xl font-bold shadow-lg flex items-center justify-center text-xl touch-none"
                    >
                        ◀
                    </button>
                    <div className="w-10 h-10 bg-gray-100 rounded-full shadow-inner"></div>
                    <button 
                        onTouchStart={() => movePlayer("RIGHT")} 
                        onClick={() => movePlayer("RIGHT")}
                        className="w-14 h-14 bg-[#3d348b] text-white active:bg-[#5b4fcd] rounded-xl font-bold shadow-lg flex items-center justify-center text-xl touch-none"
                    >
                        ▶
                    </button>

                    <div></div>
                    <button 
                        onTouchStart={() => movePlayer("DOWN")} 
                        onClick={() => movePlayer("DOWN")}
                        className="w-14 h-14 bg-[#3d348b] text-white active:bg-[#5b4fcd] rounded-xl font-bold shadow-lg flex items-center justify-center text-xl touch-none"
                    >
                        ▼
                    </button>
                    <div></div>
                </div>
            </div>

            <audio ref={audioRef} src="/musica.mp3" preload="auto" />
        </div>
    );
}