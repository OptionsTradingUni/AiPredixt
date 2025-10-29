import { SportType } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Footprints, Trophy, Dumbbell, Disc3 } from 'lucide-react';

interface SportFilterProps {
  selectedSport: SportType | 'All';
  onSelectSport: (sport: SportType | 'All') => void;
}

const sports: Array<{ value: SportType | 'All'; label: string; icon: typeof Footprints }> = [
  { value: 'All', label: 'All Sports', icon: Trophy },
  { value: 'Football', label: 'Football', icon: Footprints },
  { value: 'Basketball', label: 'Basketball', icon: Dumbbell },
  { value: 'Tennis', label: 'Tennis', icon: Disc3 },
  { value: 'Hockey', label: 'Hockey', icon: Disc3 },
];

export function SportFilter({ selectedSport, onSelectSport }: SportFilterProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {sports.map((sport) => {
        const Icon = sport.icon;
        const isSelected = selectedSport === sport.value;
        
        return (
          <Button
            key={sport.value}
            onClick={() => onSelectSport(sport.value)}
            data-testid={`button-sport-${sport.value.toLowerCase()}`}
            variant={isSelected ? 'default' : 'outline'}
            className={`relative flex flex-col items-center justify-center h-auto p-6 ${
              isSelected ? 'border-2 border-primary' : ''
            }`}
          >
            <Icon className="h-8 w-8 mb-3" />
            <span className="text-sm font-medium">
              {sport.label}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
