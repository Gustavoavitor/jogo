'use client';

import { useEffect, useState, useRef } from 'react';

const TILE_SIZE = 32; // Reduzido de 40 para 32 para caber perfeitamente em telas de celular
const MAP_SIZE = 320; // 10 colunas * 32px = 320px de largura/altura do Canvas

const INITIAL_MAZE = [
    [0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 1, 0],
    [0, 0, 0, 1, 2, 0, 0, 1, 0, 0], 
    [1, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0, 1, 1, 1, 0, 0],
    [0, 1, 3, 1, 0, 0, 0, 1, 1, 0], 
    [0, 1, 0, 1, 1, 1, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 4, 1], 
    [1, 1, 1, 1, 0, 0, 0, 1, 0, 0]
];

const FLOWER_MESSAGES = {
    2: "🌷 'Oii gatinha!!'",
    3: "🌻 'Mais uma flor para a melhor produtora rumo a cannes'",
    4: "🌹 'Você decifrou o labirinto! Final do jogo: Prepare o coração, aumenta o som e solta o Jazz!! ❤️'"
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
                    ctx.font = "20px serif"; // Ajustado para o novo tamanho de tile
                    ctx.fillText("🌸", c * TILE_SIZE + 4, r * TILE_SIZE + 24);
                }
            }
        }
        
        ctx.font = "20px serif";
        ctx.fillText("👩‍🎤", currentPlayer.x * TILE_SIZE + 4, currentPlayer.y * TILE_SIZE + 24);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            drawMaze(ctx, maze, player);
        }
    }, [maze, player]);

    // Função centralizada de movimento (funciona para teclado e cliques no celular)
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
                            console.log("O navegador exigiu clique prévio para tocar áudio.", err);
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

    // Escuta teclado (caso ela teste no computador)
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
            <div className="text-center bg-white p-4 rounded-2xl shadow-xl max-w-sm w-full">
                <h1 className="text-xl font-bold mb-1">O Labirinto das Flores Perdidas 🌷</h1>
                <p className="text-[11px] mb-3 text-gray-500">Use as setas na tela para guiar a baixista!</p>
                
                {/* Canvas reduzido para telas mobile */}
                <canvas 
                    ref={canvasRef} 
                    width={MAP_SIZE} 
                    height={MAP_SIZE} 
                    className="bg-[#f3c68f] border-4 border-[#3d348b] rounded-lg mx-auto shadow-inner"
                />
                
                {/* Caixa de Texto Dinâmica */}
                <div className="mt-3 p-3 bg-[#fefae0] border-l-4 border-red-500 rounded text-xs min-h-[55px] flex items-center justify-center text-center">
                    <p className="font-semibold">{message}</p>
                </div>

                {/* CONTROLES MOBILE (D-PAD) */}
                <div className="mt-4 flex flex-col items-center gap-1.5">
                    <button 
                        onTouchStart={() => movePlayer("UP")} 
                        onClick={() => movePlayer("UP")}
                        className="w-12 h-12 bg-[#3d348b] text-white active:bg-[#5b4fcd] rounded-xl font-bold shadow-md flex items-center justify-center text-lg touch-none"
                    >
                        ▲
                    </button>
                    <div className="flex gap-8">
                        <button 
                            onTouchStart={() => movePlayer("LEFT")} 
                            onClick={() => movePlayer("LEFT")}
                            className="w-12 h-12 bg-[#3d348b] text-white active:bg-[#5b4fcd] rounded-xl font-bold shadow-md flex items-center justify-center text-lg touch-none"
                        >
                            ◀
                        </button>
                        <button 
                            onTouchStart={() => movePlayer("RIGHT")} 
                            onClick={() => movePlayer("RIGHT")}
                            className="w-12 h-12 bg-[#3d348b] text-white active:bg-[#5b4fcd] rounded-xl font-bold shadow-md flex items-center justify-center text-lg touch-none"
                        >
                            ▶
                        </button>
                    </div>
                    <button 
                        onTouchStart={() => movePlayer("DOWN")} 
                        onClick={() => movePlayer("DOWN")}
                        className="w-12 h-12 bg-[#3d348b] text-white active:bg-[#5b4fcd] rounded-xl font-bold shadow-md flex items-center justify-center text-lg touch-none"
                    >
                        ▼
                    </button>
                </div>
            </div>

            <audio ref={audioRef} src="/musica.mp3" preload="auto" />
        </div>
    );
}
