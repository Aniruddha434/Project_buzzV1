import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Star, Move, Eye } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface MultiImageUploadProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  maxImages?: number;
  maxSizePerImage?: number; // in MB
  acceptedTypes?: string[];
  disabled?: boolean;
  className?: string;
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  maxSizePerImage = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  disabled = false,
  className = ''
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    // Check file size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizePerImage) {
      return `File size too large. Maximum size: ${maxSizePerImage}MB`;
    }

    return null;
  };

  const generateImageId = () => {
    return `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };

  const handleFiles = (files: FileList) => {
    setError('');
    
    const newImages: ImageFile[] = [];
    const currentCount = images.length;
    
    // Check if adding these files would exceed the limit
    if (currentCount + files.length > maxImages) {
      setError(`Cannot add ${files.length} images. Maximum ${maxImages} images allowed. Current: ${currentCount}`);
      return;
    }

    Array.from(files).forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      const imageFile: ImageFile = {
        file,
        preview: URL.createObjectURL(file),
        id: generateImageId()
      };
      
      newImages.push(imageFile);
    });

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    onImagesChange(updatedImages);
    
    // Revoke object URL to prevent memory leaks
    const imageToRemove = images.find(img => img.id === imageId);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    onImagesChange(updatedImages);
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-2">
          <Upload className="h-8 w-8 text-gray-400 mx-auto" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {images.length === 0 
                ? 'Upload project images' 
                : `Add more images (${images.length}/${maxImages})`
              }
            </p>
            <p className="text-xs text-gray-500">
              Drag and drop or click to select • Max {maxImages} images • Up to {maxSizePerImage}MB each
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Supported: JPG, PNG, GIF, WebP
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Project Images ({images.length}/{maxImages})
            </h4>
            {images.length > 1 && (
              <p className="text-xs text-gray-500">
                First image will be the primary image
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {images.map((image, index) => (
              <Card key={image.id} className="relative group overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={image.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Primary Badge */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2">
                      <div className="flex items-center bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        <Star className="h-3 w-3 mr-1" />
                        Primary
                      </div>
                    </div>
                  )}
                  
                  {/* Image Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                      {/* Preview Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(image.preview, '_blank');
                        }}
                        className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                        title="Preview image"
                      >
                        <Eye className="h-4 w-4 text-gray-700" />
                      </button>
                      
                      {/* Move Left */}
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImage(index, index - 1);
                          }}
                          className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                          title="Move left"
                        >
                          <Move className="h-4 w-4 text-gray-700 rotate-180" />
                        </button>
                      )}
                      
                      {/* Move Right */}
                      {index < images.length - 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImage(index, index + 1);
                          }}
                          className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                          title="Move right"
                        >
                          <Move className="h-4 w-4 text-gray-700" />
                        </button>
                      )}
                      
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(image.id);
                        }}
                        className="p-2 bg-red-500 bg-opacity-90 rounded-full hover:bg-opacity-100 transition-colors"
                        title="Remove image"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Image Info */}
                <div className="p-2">
                  <p className="text-xs text-gray-600 truncate" title={image.file.name}>
                    {image.file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(image.file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button (Alternative) */}
      {images.length < maxImages && (
        <Button
          type="button"
          variant="outline"
          onClick={openFileDialog}
          disabled={disabled}
          leftIcon={<ImageIcon className="h-4 w-4" />}
          className="w-full"
        >
          {images.length === 0 ? 'Select Images' : 'Add More Images'}
        </Button>
      )}
    </div>
  );
};

export default MultiImageUpload;
