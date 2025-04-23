
import { cn } from "@/lib/utils";
import { Position, Direction, Player } from "@/types/game";
import { useState, useEffect } from "react";
import { 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 
  ArrowUpRight, ArrowUpLeft, ArrowDownRight, ArrowDownLeft 
} from "lucide-react";

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
      if (player.speed === 0) {
        setSpinning(true);
        setTimeout(() => setSpinning(false), 1000);
      }
      
      const timer = setTimeout(() => {
        setAnimating(false);
        setPrevPosition(position);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [position, prevPosition, player.speed]);

  const getDirectionIcon = () => {
    switch (direction) {
      case "N": return <ArrowUp className="w-5 h-5" />;
      case "NE": return <ArrowUpRight className="w-5 h-5" />;
      case "E": return <ArrowRight className="w-5 h-5" />;
      case "SE": return <ArrowDownRight className="w-5 h-5" />;
      case "S": return <ArrowDown className="w-5 h-5" />;
      case "SW": return <ArrowDownLeft className="w-5 h-5" />;
      case "W": return <ArrowLeft className="w-5 h-5" />;
      case "NW": return <ArrowUpLeft className="w-5 h-5" />;
      default: return <ArrowUp className="w-5 h-5" />;
    }
  };

  const carColorClasses = {
    red: "bg-primary border-primary-foreground",
    blue: "bg-secondary border-secondary-foreground",
    yellow: "bg-accent border-accent-foreground",
    green: "bg-green-500 border-green-500"
  };

  return (
    <div
      className={cn(
        "absolute z-10 flex items-center justify-center",
        "transition-all duration-300 ease-out"
      )}
      style={{
        width: 'calc(100% / var(--gridSize))',
        height: 'calc(100% / var(--gridSize))',
        top: `calc(${position.y} * 100% / var(--gridSize))`,
        left: `calc(${position.x} * 100% / var(--gridSize))`,
        zIndex: isActive ? 20 : 10,
        // Updated variable name to match GameBoard.tsx
        '--gridSize': 20, // Default size, will be overridden by CSS variables
      } as React.CSSProperties}
    >
      <div
        className={cn(
          "w-[65%] h-[65%] flex items-center justify-center rounded-full",
          "transition-transform duration-300 shadow-lg border-2",
          carColorClasses[player.color as keyof typeof carColorClasses],
          animating && "scale-110",
          spinning && "animate-spin",
          isActive && "ring-2 ring-white"
        )}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Direction indicator */}
          <div className="text-foreground">
            {getDirectionIcon()}
          </div>
          
          {/* Player ID */}
          <div className="absolute top-0 left-0 bg-background rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
            {player.id}
          </div>
          
          {/* Spin indicator */}
          {spinning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white font-bold text-xs bg-orange-500/70 px-1 rounded rotate-0">
                SPIN
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Momentum indicators */}
      {player.speed > 0 && (
        <div className="absolute bottom-0 left-0 w-full">
          <div className={cn(
            "flex justify-center gap-0.5 mt-1", 
            carColorClasses[player.color as keyof typeof carColorClasses]
          )}>
            {Array.from({ length: player.speed }).map((_, i) => (
              <div 
                key={i} 
                className="w-1 h-1 rounded-full bg-current"
              ></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
