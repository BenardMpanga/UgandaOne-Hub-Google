import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status.toUpperCase().trim();

  // Color mapping based on design tokens:
  // "Pending" -> Secondary Yellow background with Black text
  // "Verified"/"Active"/"Compliant"/"Valid"/"Cleared" -> Green with White text (or soft green style)
  // "Processing"/"Under Review" -> Orange / Yellow styling
  // "Error"/"Overdue"/"Suspended" -> Tertiary Red/White text
  
  let bgClass = 'bg-[#f1f3f5] text-[#4c4546] border-[#cfc4c5]';
  
  if (normalized === 'VERIFIED' || normalized === 'ACTIVE' || normalized === 'COMPLIANT' || normalized === 'VALID' || normalized === 'CLEARED' || normalized === 'COMPLETED') {
    bgClass = 'bg-[#e2f0d9] text-[#006400] border-[#c5e1b4]';
  } else if (normalized === 'PENDING' || normalized === 'PROCESSING' || normalized === 'UNDER REVIEW' || normalized === 'DUE') {
    bgClass = 'bg-[#fff2cc] text-[#735c00] border-[#ffe086]';
  } else if (normalized === 'ERROR' || normalized === 'OVERDUE' || normalized === 'SUSPENDED' || normalized === 'DISSOLVED') {
    bgClass = 'bg-[#fce4d6] text-[#ba1a1a] border-[#f8cbad]';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${bgClass}`}>
      {status}
    </span>
  );
};
