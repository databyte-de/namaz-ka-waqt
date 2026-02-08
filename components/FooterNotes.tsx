import React from 'react';
import { Info } from 'lucide-react';

interface FooterNotesProps {
  notes: string[];
}

export const FooterNotes: React.FC<FooterNotesProps> = ({ notes }) => {
  if (!notes || notes.length === 0) return null;

  return (
    <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-amber-800">
        <Info className="w-5 h-5" />
        <h3 className="font-semibold text-lg">Important Notes</h3>
      </div>
      <div className="space-y-2">
        {notes.map((note, index) => (
          <p key={index} className="text-amber-900 leading-relaxed text-sm md:text-base">
            {note}
          </p>
        ))}
      </div>
    </div>
  );
};
