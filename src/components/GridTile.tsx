
import { cn } from "@/lib/utils";
import { Position, PlayerColor } from "@/types/game";

interface GridTileProps {
  position: Position;
  type: "track" | "checkpoint" | "finish";
  isValidMove?: boolean;
  isMomentumPosition?: boolean;
  isTrackTile?: boolean;
  playerColor?: PlayerColor;
  onClick?: () => void;
}

export function GridTile({ 
  position, 
  type, 
  isValidMove, 
  isMomentumPosition, 
  isTrackTile,
  playerColor = "red",
  onClick 
}: GridTileProps) {
  const colorMap = {
    red: "ring-[#ea384c]",
    blue: "ring-secondary",
    yellow: "ring-accent",
    green: "ring-green-500"
  };

  const playerColorClasses = colorMap[playerColor];

  return (
    <div
      className={cn(
        "aspect-square relative transition-all duration-200",
        "flex items-center justify-center",
        !isTrackTile && "bg-muted/50",
        isTrackTile && "bg-card",
        type === "checkpoint" && "bg-secondary/30",
        type === "finish" && "bg-accent checkered",
        isValidMove && "cursor-pointer", 
        isValidMove && !isMomentumPosition && `ring-1 ring-opacity-40 ${playerColorClasses}`,
        isMomentumPosition && `ring-2 ring-opacity-70 ${playerColorClasses}`
      )}
      style={{
        gridColumn: position.x + 1,
        gridRow: position.y + 1,
      }}
      onClick={onClick}
      data-position={`${position.x},${position.y}`}
    >
      {isValidMove && (
        <div className="absolute inset-0 flex items-center justify-center opacity-70">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full",
            isMomentumPosition ? `${playerColorClasses} w-2.5 h-2.5 animate-pulse` : `${playerColorClasses}`,
          )}></div>
        </div>
      )}
      
      {isMomentumPosition && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`absolute w-full h-full border-2 border-dashed rounded-sm animate-pulse ${playerColorClasses}`}></div>
        </div>
      )}
    </div>
  );
}
