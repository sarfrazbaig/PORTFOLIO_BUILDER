
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { iconList, renderIcon } from '@/lib/icons';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

interface HeaderIconSelectorDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentIconName: string;
  onIconSelect: (iconName: string) => void;
}

export default function HeaderIconSelectorDialog({
  isOpen,
  onOpenChange,
  currentIconName,
  onIconSelect,
}: HeaderIconSelectorDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIcons = iconList.filter(icon =>
    icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icon.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectAndClose = (iconName: string) => {
    onIconSelect(iconName);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Header Icon</DialogTitle>
          <DialogDescription>
            Choose an icon that best represents you or your portfolio&apos;s brand.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Input
            type="text"
            placeholder="Search icons (e.g., 'code', 'user', 'creative')..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <ScrollArea className="flex-grow pr-4 -mr-4"> {/* Offset padding for scrollbar */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 py-4">
            {filteredIcons.map((icon) => (
              <Button
                key={icon.name}
                variant="outline"
                className={cn(
                  "flex flex-col items-center justify-center p-3 aspect-square transition-all duration-150 ease-in-out", // Removed fixed height, adjusted padding
                  currentIconName === icon.name
                    ? 'ring-2 ring-primary border-primary bg-primary/10 text-primary'
                    : 'hover:border-primary hover:bg-muted/50 active:scale-95'
                )}
                onClick={() => handleSelectAndClose(icon.name)}
                title={icon.name}
              >
                {renderIcon(icon.name, { size: 28, className: "mb-1" })} {/* Slightly smaller icon and margin */}
                <span className="text-[10px] leading-tight truncate w-full text-center block">{icon.name}</span> {/* Smaller text, tighter leading */}
              </Button>
            ))}
            {filteredIcons.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-10">No icons found matching &quot;{searchTerm}&quot;.</p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
