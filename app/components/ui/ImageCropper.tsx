"use client";

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from "@/components/ui/Button";
import { getCroppedImg } from '@/utils/cropUtils';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
}

const ImageCropper = ({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    try {
      if (croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        if (croppedImage) {
            onCropComplete(croppedImage);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-md h-80 bg-black rounded-lg overflow-hidden mb-4">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteHandler}
          onZoomChange={onZoomChange}
          cropShape="round"
        />
      </div>

      <div className="w-full max-w-md space-y-4 bg-white p-6 rounded-xl">
        <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-gray-700">
                <span>Zoom</span>
                <span>{Math.round((zoom - 1) * 50)}%</span>
            </div>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
        </div>

        <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Save & Upload
            </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;