
import { cn } from "@/lib/utils";
import { Position, Direction, Player } from "@/types/game";
import { useState, useEffect } from "react";

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
    red: "bg-primary text-white",
    blue: "bg-secondary text-white",
    yellow: "bg-accent text-black",
    green: "bg-green-500 text-white"
  };

  return (
    <div
      className={cn(
        "absolute w-[90%] h-[90%] transition-all duration-300 ease-out",
        isActive && "ring-2 ring-white"
      )}
      style={{
        top: `calc(${position.y * 100}% + ${position.y * 0.5}px)`,
        left: `calc(${position.x * 100}% + ${position.x * 0.5}px)`,
        zIndex: isActive ? 20 : 10,
      }}
    >
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          "transition-transform duration-300",
          carColorClasses[player.color as keyof typeof carColorClasses],
          "rounded-md shadow-md",
          getRotation(),
          animating && "scale-110",
          isActive && "border-2 border-white"
        )}
      >
        {/* Car shape */}
        <div className="relative w-3/4 h-1/2">
          {/* Car body */}
          <div className="absolute inset-0 bg-current rounded-md" />
          
          {/* Car details */}
          <div className="absolute top-1/4 bottom-1/4 left-1 right-1 bg-black/20 rounded-sm" />
          
          {/* Player number */}
          <div className="absolute inset-0 flex items-center justify-center font-bold text-xs">
            {player.id}
          </div>
        </div>
      </div>
      
      {/* Momentum indicator */}
      {player.speed > 0 && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
          {Array.from({ length: player.speed }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "w-1 h-1 rounded-full",
                carColorClasses[player.color as keyof typeof carColorClasses]
              )}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}
