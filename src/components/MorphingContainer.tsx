import React from 'react';

interface MorphingContainerProps {
  collapsedContent: React.ReactNode;
  expandedContent: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
  layoutId?: string;
}

export const MorphingContainer: React.FC<MorphingContainerProps> = ({
  collapsedContent,
  expandedContent,
  isExpanded,
  onToggle,
  className = "",
}) => {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onClick={!isExpanded ? onToggle : undefined}
    >
      {!isExpanded ? (
        <div className="w-full h-full">
          {collapsedContent}
        </div>
      ) : (
        <div className="w-full h-full">
          {expandedContent}
        </div>
      )}
    </div>
  );
};
