
import { cn } from "@/lib/utils";
import { Position, Direction, Player } from "@/types/game";
import { useState, useEffect } from "react";
import { MoveRight, MoveLeft, MoveUp, MoveDown, 
        ArrowUpRight, ArrowUpLeft, ArrowDownRight, ArrowDownLeft } from "lucide-react";

interface CarProps {
  player: Player;
  position: Position;
  direction: Direction;
  isActive: boolean;
}

export function Car({ player, position, direction, isActive }: CarProps) {
  const [prevPosition, setPrevPosition] = useState(position);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (position.x !== prevPosition.x || position.y !== prevPosition.y) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setAnimating(false);
        setPrevPosition(position);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [position, prevPosition]);

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
      case "N": return <MoveUp className="w-4 h-4" />;
      case "NE": return <ArrowUpRight className="w-4 h-4" />;
      case "E": return <MoveRight className="w-4 h-4" />;
      case "SE": return <ArrowDownRight className="w-4 h-4" />;
      case "S": return <MoveDown className="w-4 h-4" />;
      case "SW": return <ArrowDownLeft className="w-4 h-4" />;
      case "W": return <MoveLeft className="w-4 h-4" />;
      case "NW": return <ArrowUpLeft className="w-4 h-4" />;
      default: return <MoveUp className="w-4 h-4" />;
    }
  };

  return (
    <div
      className={cn(
        "absolute z-10 flex items-center justify-center",
        "transition-all duration-300 ease-out"
      )}
      style={{
        width: 'calc(100% / var(--grid-size))',
        height: 'calc(100% / var(--grid-size))',
        top: `calc(${position.y} * 100% / var(--grid-size))`,
        left: `calc(${position.x} * 100% / var(--grid-size))`,
        zIndex: isActive ? 20 : 10,
        '--grid-size': 10, // Default size, will be overridden by CSS variables
      } as React.CSSProperties}
    >
      <div
        className={cn(
          "w-[80%] h-[80%] flex items-center justify-center", // Reduced size from 90% to 80%
          "transition-transform duration-300 shadow-lg",
          carColorClasses[player.color as keyof typeof carColorClasses],
          "rounded-md",
          animating && "scale-110",
          isActive && "ring-2 ring-white",
          player.crashed && "opacity-60 grayscale" // Make crashed players visually distinct
        )}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center font-bold text-lg">
            {player.id}
          </div>
          
          <div className="absolute bottom-0.5 right-0.5">
            {getDirectionIcon()}
          </div>
          
          {player.crashed && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white font-bold text-xs bg-red-800/70 px-1 rounded">
                CRASH
              </div>
            </div>
          )}
        </div>
      </div>
      
      {player.speed > 0 && (
        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {Array.from({ length: player.speed }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                carColorClasses[player.color as keyof typeof carColorClasses]
              )}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}
