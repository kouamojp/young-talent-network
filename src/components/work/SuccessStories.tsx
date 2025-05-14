
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

const SuccessStories = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="bg-white/40 rounded-lg overflow-hidden">
          <div className="aspect-video bg-gray-200 relative">
            <img 
              src="/placeholder.svg" 
              alt="Histoire de réussite" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Button variant="outline" className="rounded-full bg-white/20 border-white text-white">
                <Play className="h-6 w-6" />
              </Button>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-bold">De Y&T à Broadway</h3>
            <p className="text-sm text-gray-600 mt-1">
              Comment j'ai décroché mon rôle de rêve après avoir rencontré un directeur de casting sur la plateforme.
            </p>
            <Button variant="link" className="px-0 mt-2">
              Lire l'Histoire Complète
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SuccessStories;
