import { Novel } from './novels';

export type WeeklyHotNovel = Novel & {
    rank: number;
};
