import React from 'react';
import { Mosque } from '../types';
import { Clock } from 'lucide-react';

interface MosqueCardProps {
  mosque: Mosque;
}

const TimeBadge: React.FC<{ label: string; time: string; urLabel: string }> = ({ label, time, urLabel }) => {
    if (!time) return null;
    return (
        <div className="flex flex-col items-center justify-center bg-slate-50 rounded-lg p-2 border border-slate-100 hover:border-emerald-200 transition-colors">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">{label}</span>
            <span className="text-sm md:text-base font-bold text-slate-800">{time}</span>
            <span className="text-[10px] text-emerald-600 font-urdu mt-0.5">{urLabel}</span>
        </div>
    );
};

export const MosqueCard: React.FC<MosqueCardProps> = ({ mosque }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 leading-tight">{mosque.name_en}</h3>
          {mosque.name_ur && (
            <p className="text-emerald-600 font-urdu text-base mt-1 text-right md:text-left">{mosque.name_ur}</p>
          )}
        </div>
        <div className="bg-emerald-50 p-2 rounded-full text-emerald-600">
            <Clock className="w-5 h-5" />
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-auto">
        <TimeBadge label="Fajr" time={mosque.times.fajr.time} urLabel={mosque.times.fajr.label} />
        <TimeBadge label="Zuhar" time={mosque.times.zuhar.time} urLabel={mosque.times.zuhar.label} />
        <TimeBadge label="Asr" time={mosque.times.asr.time} urLabel={mosque.times.asr.label} />
        <TimeBadge label="Isha" time={mosque.times.isha.time} urLabel={mosque.times.isha.label} />
        <TimeBadge label="Juma" time={mosque.times.juma.time} urLabel={mosque.times.juma.label} />
      </div>
    </div>
  );
};
