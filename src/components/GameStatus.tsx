
import { cn } from "@/lib/utils";
import { Player } from "@/types/game";

interface GameStatusProps {
  players: Player[];
  currentRound: number;
  winner: Player | null;
}

export function GameStatus({ players, currentRound, winner }: GameStatusProps) {
  return (
    <div className="p-4 bg-card rounded-lg shadow-lg border border-border">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">Round {currentRound}</h3>
        {winner && (
          <div className="px-3 py-1 bg-accent text-accent-foreground font-bold rounded-md animate-pulse">
            Player {winner.id} Wins!
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        {players.map((player) => (
          <div key={player.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className={cn(
                  "w-3 h-3 rounded-full",
                  player.color === "red" && "bg-primary",
                  player.color === "blue" && "bg-secondary",
                  player.color === "yellow" && "bg-accent",
                  player.color === "green" && "bg-green-500"
                )}
              />
              <span>Player {player.id}</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Speed:</span>
                <span className="font-mono">{player.speed}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Checkpoints:</span>
                <span className="font-mono">{player.checkpoints}/{player.totalCheckpoints}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border">
        <h4 className="text-sm font-semibold mb-1">Momentum Rules</h4>
        <ul className="text-xs space-y-1 text-muted-foreground">
          <li>• Brighter highlight shows momentum direction</li>
          <li>• You can pick any of the highlighted tiles</li>
          <li>• Your choice determines next turn's options</li>
        </ul>
      </div>
    </div>
  );
}
