
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Player, GameMode } from "@/types/game";

interface GameControlsProps {
  currentPlayer: Player;
  gameMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  onReset: () => void;
  canReset: boolean;
  onSkipTurn: () => void;
  canSkipTurn: boolean;
}

export function GameControls({
  currentPlayer,
  gameMode,
  onModeChange,
  onReset,
  canReset,
  onSkipTurn,
  canSkipTurn
}: GameControlsProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-card rounded-lg shadow-lg border border-border">
      <div className="flex items-center gap-2">
        <div 
          className={cn(
            "w-4 h-4 rounded-full",
            currentPlayer.color === "red" && "bg-primary",
            currentPlayer.color === "blue" && "bg-secondary",
            currentPlayer.color === "yellow" && "bg-accent",
            currentPlayer.color === "green" && "bg-green-500"
          )} 
        />
        <span className="font-bold">Player {currentPlayer.id}'s Turn</span>
        <div className="flex items-center gap-1 ml-2 bg-muted px-2 py-1 rounded-md">
          <span className="text-sm">Speed:</span>
          <span className="font-mono font-bold">{currentPlayer.speed}</span>
        </div>
      </div>
      
      <div className="flex gap-2 items-center">
        <div className="flex bg-muted rounded-md overflow-hidden">
          <Button
            variant={gameMode === "turn-based" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onModeChange("turn-based")}
            className="rounded-r-none"
          >
            Turn-Based
          </Button>
          <Button
            variant={gameMode === "programming" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onModeChange("programming")}
            className="rounded-l-none"
          >
            Programming
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onSkipTurn}
          disabled={!canSkipTurn}
        >
          Skip Turn
        </Button>
        
        <Button
          variant="destructive"
          size="sm"
          onClick={onReset}
          disabled={!canReset}
        >
          Reset Game
        </Button>
      </div>
    </div>
  );
}
