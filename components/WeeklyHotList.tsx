import React from 'react';
import { WeeklyHotNovel } from '../data/weeklyHot';
import RankedColumn from './RankedColumn';

export interface RankedList {
  title: string;
  novels: WeeklyHotNovel[];
}

interface WeeklyHotListProps {
  title: string;
  lists: RankedList[];
}

const WeeklyHotList: React.FC<WeeklyHotListProps> = ({ title, lists }) => {
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">
          {title}
        </h2>
      </div>
      <div className="flex space-x-6 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 no-scrollbar">
        {lists.map((list) => (
          <RankedColumn key={list.title} title={list.title} novels={list.novels} />
        ))}
      </div>
    </section>
  );
};

export default WeeklyHotList;
