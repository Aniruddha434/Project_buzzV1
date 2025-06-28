import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button-shadcn';
import { Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { copyToClipboard, generateShareableUrl } from '../utils/clipboard';
import { cn } from '../utils/cn';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle
}) => {
  const [copied, setCopied] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  const shareableUrl = generateShareableUrl(projectId);

  const handleCopyLink = async () => {
    const result = await copyToClipboard(shareableUrl);
    setCopyMessage(result.message);

    if (result.success) {
      setCopied(true);
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  const handleOpenInNewTab = () => {
    window.open(shareableUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Share2 className="h-5 w-5" />
            Share Project
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Project Info */}
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="font-medium text-white mb-1">Sharing:</h3>
            <p className="text-gray-300 text-sm truncate">{projectTitle}</p>
          </div>

          {/* Shareable Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Shareable Link
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg">
                <input
                  type="text"
                  value={shareableUrl}
                  readOnly
                  className="w-full bg-transparent text-gray-300 text-sm focus:outline-none"
                />
              </div>
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="icon"
                className={cn(
                  "border-gray-700 hover:bg-gray-800",
                  copied ? "bg-green-600 border-green-600 hover:bg-green-700" : ""
                )}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-white" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Copy feedback message */}
            {copyMessage && (
              <p className={cn(
                "text-xs",
                copied ? "text-green-400" : "text-red-400"
              )}>
                {copyMessage}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleCopyLink}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={copied}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>

            <Button
              onClick={handleOpenInNewTab}
              variant="outline"
              className="border-gray-700 hover:bg-gray-800 text-gray-300"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>

          {/* Info Text */}
          <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <p className="text-xs text-gray-400">
              Anyone with this link can view the project details. They'll need to create an account to purchase.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
