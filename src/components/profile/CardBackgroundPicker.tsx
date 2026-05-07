import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Palette } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PRESETS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #0c0c0c 0%, #434343 100%)',
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
  '#1a1a2e',
  '#2d3436',
  '#0984e3',
  '#6c5ce7',
  '#00b894',
];

interface Props {
  userId: string;
  currentBackground: string;
  onUpdate: (bg: string) => void;
}

export const CardBackgroundPicker: React.FC<Props> = ({ userId, currentBackground, onUpdate }) => {
  const [selected, setSelected] = useState(currentBackground);
  const [custom, setCustom] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (bg: string) => {
    setSaving(true);
    const { error } = await supabase
      .from('user_levels')
      .update({ card_background: bg })
      .eq('user_id', userId);
    if (error) {
      toast.error('Failed to update card background');
    } else {
      setSelected(bg);
      onUpdate(bg);
      toast.success('Card background updated!');
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Profile Card Background
        </CardTitle>
        <CardDescription>Choose a background for your public profile card</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview */}
        <div className="rounded-xl p-6 text-white text-center font-semibold shadow-lg" style={{ background: selected }}>
          Your Profile Card Preview
        </div>

        {/* Presets */}
        <div className="grid grid-cols-5 gap-2">
          {PRESETS.map((bg, i) => (
            <button
              key={i}
              className={`h-10 rounded-lg border-2 transition-all ${selected === bg ? 'border-primary scale-110 shadow-md' : 'border-transparent hover:border-muted-foreground/30'}`}
              style={{ background: bg }}
              onClick={() => handleSave(bg)}
            />
          ))}
        </div>

        {/* Custom */}
        <div className="flex gap-2">
          <Input
            placeholder="Custom CSS: #hex or linear-gradient(...)"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="outline"
            disabled={!custom || saving}
            onClick={() => handleSave(custom)}
          >
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
