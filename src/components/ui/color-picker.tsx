'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value = '#000000',
  onChange,
  className,
}) => {
  const [color, setColor] = useState<string>(value || '#000000');
  const [inputValue, setInputValue] = useState<string>(value || '#000000');
  const [open, setOpen] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setColor(value || '#000000');
    setInputValue(value || '#000000');
  }, [value]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    setInputValue(newColor);
    onChange?.(newColor);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Validate if it's a valid color format
    if (/^#([0-9A-F]{3}){1,2}$/i.test(newValue) || /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d\.]+)?\s*\)$/i.test(newValue)) {
      setColor(newValue);
      onChange?.(newValue);
    }
  };

  const handleInputBlur = () => {
    // Reset to the current color if the input value is invalid
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(inputValue) && !/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d\.]+)?\s*\)$/i.test(inputValue)) {
      setInputValue(color);
    }
  };

  const presetColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#00FFFF', '#FF00FF', '#C0C0C0', '#808080',
    '#800000', '#808000', '#008000', '#800080', '#008080',
    '#000080', '#FFA500', '#A52A2A', '#F5F5DC', '#FFD700',
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('w-full justify-start text-left font-normal', className)}
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-sm border"
              style={{ backgroundColor: color }}
            />
            <span>{inputValue}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Seleccionar color</Label>
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="color"
                value={color}
                onChange={handleColorChange}
                className="h-10 w-10 cursor-pointer appearance-none overflow-hidden rounded-md border-0"
              />
              <Input
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder="#000000 o rgb(0,0,0)"
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Colores predefinidos</Label>
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  className="h-6 w-6 rounded-md border"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => {
                    setColor(presetColor);
                    setInputValue(presetColor);
                    onChange?.(presetColor);
                    setOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};