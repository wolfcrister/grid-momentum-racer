import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Position, Direction, Player } from "@/types/game";
import { MoveRight, MoveLeft, MoveUp, MoveDown, 
        ArrowUpRight, ArrowUpLeft, ArrowDownRight, ArrowDownLeft } from "lucide-react";
import { GAME_CONFIG } from "@/lib/game-config";

interface CarProps {
  player: Player;
  position: Position;
  direction: Direction;
  isActive: boolean;
}

export function Car({ player, position, direction, isActive }: CarProps) {
  const [prevPosition, setPrevPosition] = useState(position);
  const [animating, setAnimating] = useState(false);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    if (position.x !== prevPosition.x || position.y !== prevPosition.y) {
      setAnimating(true);
      
      // Check if this was a spin (speed went to 0 but not crashed)
      if (player.speed === 0 && !player.crashed) {
        setSpinning(true);
        setTimeout(() => setSpinning(false), 1000);
      }
      
      const timer = setTimeout(() => {
        setAnimating(false);
        setPrevPosition(position);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [position, prevPosition, player.speed, player.crashed]);

  const getCrashedOffset = () => {
    if (!player.crashed) return {};
    const offsetX = ((player.id - 1) % 2) * 0.3;
    const offsetY = Math.floor((player.id - 1) / 2) * 0.3;
    return {
      transform: `translate(${offsetX * 100}%, ${offsetY * 100}%)`
    };
  };

  const getRotation = () => {
    switch (direction) {
      case "N": return "rotate-0";
      case "NE": return "rotate-45";
      case "E": return "rotate-90";
      case "SE": return "rotate-135";
      case "S": return "rotate-180";
      case "SW": return "rotate-[225deg]";
      case "W": return "rotate-[270deg]";
      case "NW": return "rotate-[315deg]";
      default: return "rotate-0";
    }
  };

  const carColorClasses = {
    red: player.crashed ? "bg-red-900/50 text-white" : "bg-primary text-white",
    blue: player.crashed ? "bg-blue-900/50 text-white" : "bg-secondary text-white",
    yellow: player.crashed ? "bg-yellow-900/50 text-black" : "bg-accent text-black",
    green: player.crashed ? "bg-green-900/50 text-white" : "bg-green-500 text-white"
  };

  const getDirectionIcon = () => {
    switch (direction) {
      case "N": return <MoveUp className="w-3 h-3" />;
      case "NE": return <ArrowUpRight className="w-3 h-3" />;
      case "E": return <MoveRight className="w-3 h-3" />;
      case "SE": return <ArrowDownRight className="w-3 h-3" />;
      case "S": return <MoveDown className="w-3 h-3" />;
      case "SW": return <ArrowDownLeft className="w-3 h-3" />;
      case "W": return <MoveLeft className="w-3 h-3" />;
      case "NW": return <ArrowUpLeft className="w-3 h-3" />;
      default: return <MoveUp className="w-3 h-3" />;
    }
  };

  const carStyle: React.CSSProperties = {
    width: `calc(100% / ${GAME_CONFIG.grid.size.width})`,
    height: `calc(100% / ${GAME_CONFIG.grid.size.height})`,
    top: `calc(${position.y} * 100% / ${GAME_CONFIG.grid.size.height})`,
    left: `calc(${position.x} * 100% / ${GAME_CONFIG.grid.size.width})`,
    zIndex: isActive ? 20 : 10,
    ...getCrashedOffset()
  };

  return (
    <div
      className={cn(
        "absolute z-10 flex items-center justify-center",
        "transition-all duration-300 ease-out"
      )}
      style={carStyle}
    >
      <div
        className={cn(
          "w-[65%] h-[65%] flex items-center justify-center",
          "transition-transform duration-300 shadow-lg",
          carColorClasses[player.color as keyof typeof carColorClasses],
          "rounded-md",
          animating && "scale-110",
          spinning && "animate-[spin_1s_ease-in-out]",
          isActive && "ring-2 ring-white",
          player.crashed && "opacity-60 grayscale translate-x-2"
        )}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">
            {player.id}
          </div>
          
          <div className="absolute bottom-0.5 right-0.5">
            {getDirectionIcon()}
          </div>
          
          {player.crashed && (
            <div className="absolute inset-0 flex items-center justify-center animate-pulse">
              <div className="text-white font-bold text-xs bg-red-800/70 px-1.5 py-0.5 rounded rotate-0">
                OUT
              </div>
            </div>
          )}
          
          {spinning && !player.crashed && (
            <div className="absolute inset-0 flex items-center justify-center animate-bounce">
              <div className="text-white font-bold text-xs bg-orange-500/70 px-1.5 py-0.5 rounded rotate-0">
                SPIN!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
