
import { useState } from "react";
import { MoveLogEntry } from "@/components/MoveLog";

export function useMoveLogState() {
  const [moveLog, setMoveLog] = useState<MoveLogEntry[]>([]);
  return { moveLog, setMoveLog };
}
