import * as React from 'react';
import { FileText, FileImage } from 'lucide-react';
import { cn } from '@/shared/cn';

export const isImageDocument = (filename?: string): boolean => {
  if (!filename) return false;
  return /\.(png|jpe?g|webp|gif)$/i.test(filename);
};

export const truncateFileName = (fileName: string, maxChars = 14): string => {
  if (!fileName || fileName.length <= maxChars) return fileName;
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) {
    return `${fileName.slice(0, maxChars - 3)}...`;
  }
  const ext = fileName.slice(lastDot);
  const availableLength = maxChars - ext.length - 2;
  if (availableLength <= 2) {
    return `${fileName.slice(0, maxChars - 3)}...`;
  }
  return `${fileName.slice(0, availableLength)}..${ext}`;
};

export interface DocumentReceiptBadgeProps {
  documentName: string;
  onClick?: () => void;
  className?: string;
  maxChars?: number;
}

export const DocumentReceiptBadge: React.FC<DocumentReceiptBadgeProps> = ({
  documentName,
  onClick,
  className,
  maxChars = 14,
}) => {
  const isImage = isImageDocument(documentName);
  const displayName = truncateFileName(documentName, maxChars);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 h-6 px-2 rounded-md text-[11px] font-medium leading-none',
        'border select-none transition-all cursor-pointer shadow-2xs',
        isImage
          ? 'bg-sky-500/[0.08] hover:bg-sky-500/[0.14] border-sky-500/25 text-sky-900 dark:bg-sky-500/[0.14] dark:hover:bg-sky-500/[0.22] dark:border-sky-400/30 dark:text-sky-200'
          : 'bg-rose-500/[0.08] hover:bg-rose-500/[0.14] border-rose-500/25 text-rose-900 dark:bg-rose-500/[0.14] dark:hover:bg-rose-500/[0.22] dark:border-rose-400/30 dark:text-rose-200',
        className
      )}
      title={isImage ? `Comprovante de imagem: ${documentName}` : `Documento PDF: ${documentName}`}
      aria-label={`Baixar comprovante ${documentName}`}
    >
      {isImage ? (
        <FileImage className="h-3 w-3 text-sky-600 dark:text-sky-400 shrink-0" aria-hidden="true" />
      ) : (
        <FileText className="h-3 w-3 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
      )}
      <span className="truncate max-w-[95px] leading-none inline-flex items-center">{displayName}</span>
    </button>
  );
};
