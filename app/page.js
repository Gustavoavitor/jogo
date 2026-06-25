'use client';

import { useEffect, useState, useRef } from 'react';

const TILE_SIZE = 40;

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

const FLOWER_MESSAGES = {
    2: "🌷 'Obrigado por iluminar meus dias, mesmo estando longe!'",
    3: "🌻 'Achei essa aqui perto daquela nossa piada interna. Que saudade de rir com você!'",
    4: "🌹 'Você decifrou o labirinto! Final do jogo: Prepare o coração, aumenta o som e solta o groove! ❤️'"
};

export default function Game() {
    const canvasRef = useRef(null);
    const audioRef = useRef(null);
    const [maze, setMaze] = useState(INITIAL_MAZE);
    const [player, setPlayer] = useState({ x: 0, y: 0 });
    const [message, setMessage] = useState("Encontre a primeira flor para liberar um recado...");

    // Desenha o cenário no Canvas
    const drawMaze = (ctx, currentMaze, currentPlayer) => {
        ctx.clearRect(0, 0, 400, 400);
        
        for (let r = 0; r < currentMaze.length; r++) {
            for (let c = 0; c < currentMaze[r].length; c++) {
                if (currentMaze[r][c] === 1) {
                    ctx.fillStyle = "#3d348b"; 
                    ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                } else if ([2, 3, 4].includes(currentMaze[r][c])) {
                    ctx.font = "24px serif";
                    ctx.fillText("🌸", c * TILE_SIZE + 8, r * TILE_SIZE + 30);
                }
            }
        }
        
        // NOVO: Personagem atualizado para a baixista/musicista
        ctx.font = "24px serif";
        ctx.fillText("👩‍🎤", currentPlayer.x * TILE_SIZE + 8, currentPlayer.y * TILE_SIZE + 30);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            drawMaze(ctx, maze, player);
        }
    }, [maze, player]);

    // Captura os movimentos do teclado
    useEffect(() => {
        const handleKeyDown = (e) => {
            let nextX = player.x;
            let nextY = player.y;
            
            if (e.key === "ArrowUp") nextY--;
            if (e.key === "ArrowDown") nextY++;
            if (e.key === "ArrowLeft") nextX--;
            if (e.key === "ArrowRight") nextX++;
            
            if (nextY >= 0 && nextY < maze.length && nextX >= 0 && nextX < maze[0].length) {
                if (maze[nextY][nextX] !== 1) {
                    const newPlayer = { x: nextX, y: nextY };
                    setPlayer(newPlayer);
                    
                    const tileValue = maze[nextY][nextX];
                    if (FLOWER_MESSAGES[tileValue]) {
                        setMessage(FLOWER_MESSAGES[tileValue]);
                        
                        // LÓGICA DE ÁUDIO: Se pegou a flor 4, toca Bobbi Humphrey
                        if (tileValue === 4 && audioRef.current) {
                            audioRef.current.play().catch(err => {
                                console.log("O navegador bloqueou o autoplay, precisa de uma interação.", err);
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

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [player, maze]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#f7ede2] font-mono text-[#3d348b] p-4">
            <div className="text-center bg-white p-6 rounded-2xl shadow-xl max-w-md w-full">
                <h1 className="text-2xl font-bold mb-2">O Labirinto das Flores Perdidas 🌷</h1>
                <p className="text-xs mb-4 text-gray-600">Leve a baixista pelas setas do teclado até as flores!</p>
                
                <canvas 
                    ref={canvasRef} 
                    width={400} 
                    height={400} 
                    className="bg-[#f3c68f] border-4 border-[#3d348b] rounded-lg mx-auto shadow-inner"
                />
                
                <div className="mt-4 p-4 bg-[#fefae0] border-l-4 border-red-500 rounded text-sm min-h-[60px] flex items-center justify-center text-center">
                    <p>{message}</p>
                </div>
            </div>

            {/* Elemento de áudio escondido carregando a música da pasta public */}
            <audio ref={audioRef} src="/musica.mp3" preload="auto" />
        </div>
    );
}
