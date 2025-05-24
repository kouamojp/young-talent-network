
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Upload, RotateCw, Crop, Download } from 'lucide-react';

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageType: 'logo' | 'cover';
  onSave: (processedImage: string) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  isOpen,
  onClose,
  imageType,
  onSave
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [compressionLevel, setCompressionLevel] = useState([80]);
  const [dimensions, setDimensions] = useState({ width: 200, height: 200 });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      
      // Set default dimensions based on image type
      if (imageType === 'logo') {
        setDimensions({ width: 200, height: 200 });
      } else {
        setDimensions({ width: 800, height: 300 });
      }
    }
  };

  const processImage = () => {
    if (!selectedFile || !imageUrl) return;

    // Create canvas for image processing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      
      if (ctx) {
        // Draw resized image
        ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
        
        // Convert to data URL with compression
        const quality = compressionLevel[0] / 100;
        const processedImage = canvas.toDataURL('image/jpeg', quality);
        
        onSave(processedImage);
      }
    };

    img.src = imageUrl;
  };

  const getRecommendedSizes = () => {
    if (imageType === 'logo') {
      return [
        { label: 'Small (100x100)', width: 100, height: 100 },
        { label: 'Medium (200x200)', width: 200, height: 200 },
        { label: 'Large (400x400)', width: 400, height: 400 }
      ];
    } else {
      return [
        { label: 'Small (600x200)', width: 600, height: 200 },
        { label: 'Medium (800x300)', width: 800, height: 300 },
        { label: 'Large (1200x400)', width: 1200, height: 400 }
      ];
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Edit {imageType === 'logo' ? 'Logo' : 'Cover Image'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="image-upload">Upload Image</Label>
            <div className="flex items-center gap-2">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="flex-1"
              />
              <Button size="sm" variant="outline">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Image Preview */}
          {imageUrl && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                  style={{ 
                    width: Math.min(dimensions.width, 400), 
                    height: Math.min(dimensions.height, 300) 
                  }}
                >
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={dimensions.width}
                    onChange={(e) => setDimensions(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={dimensions.height}
                    onChange={(e) => setDimensions(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              {/* Quick Size Presets */}
              <div className="space-y-2">
                <Label>Quick Sizes</Label>
                <div className="flex flex-wrap gap-2">
                  {getRecommendedSizes().map((size) => (
                    <Button
                      key={size.label}
                      size="sm"
                      variant="outline"
                      onClick={() => setDimensions({ width: size.width, height: size.height })}
                    >
                      {size.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Compression */}
              <div className="space-y-2">
                <Label>Compression Quality: {compressionLevel[0]}%</Label>
                <Slider
                  value={compressionLevel}
                  onValueChange={setCompressionLevel}
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Smaller file</span>
                  <span>Better quality</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={processImage} 
              disabled={!selectedFile}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Apply Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageEditor;
