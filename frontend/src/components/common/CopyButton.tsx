import React from "react";

interface CopyButtonProps {
  value: string;
  onCopied?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ value, onCopied, children, className }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    if (onCopied) onCopied();
  };

  return (
    <button type="button" onClick={handleCopy} className={className}>
      {children || "Copy"}
    </button>
  );
};
