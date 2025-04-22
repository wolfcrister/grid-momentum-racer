
import { cn } from "@/lib/utils";
import { Position } from "@/types/game";

interface GridTileProps {
  position: Position;
  type: "track" | "checkpoint" | "finish";
  isValidMove?: boolean;
  isMomentumPosition?: boolean;
  isTrackTile?: boolean;
  onClick?: () => void;
}

export function GridTile({ 
  position, 
  type, 
  isValidMove, 
  isMomentumPosition, 
  isTrackTile,
  onClick 
}: GridTileProps) {
  return (
    <div
      className={cn(
        "aspect-square relative transition-all duration-200",
        "flex items-center justify-center",
        !isTrackTile && "bg-muted/50",
        isTrackTile && "bg-card",
        type === "checkpoint" && "bg-secondary/30",
        type === "finish" && "bg-accent checkered",
        isValidMove && "cursor-pointer ring-2 ring-primary ring-opacity-70",
        isValidMove && !isMomentumPosition && "bg-primary/10",
        isMomentumPosition && "bg-primary/30"
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
            "w-2 h-2 rounded-full",
            isMomentumPosition ? "bg-primary animate-pulse w-3 h-3" : "bg-primary",
          )}></div>
        </div>
      )}
    </div>
  );
}
