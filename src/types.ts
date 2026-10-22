import type { Data, SetRow } from './model';
export type ChangeData = (fn: (data: Data) => void) => void;
export type UpdateRow = (
  id: string,
  index: number,
  patch: Partial<SetRow>,
) => void;
export interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
}
