import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileMenuButton } from './sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
      <div className="flex items-center space-x-4">
        <MobileMenuButton onClick={onMenuClick} />
        <h2 className="text-lg font-semibold hidden sm:block">Dashboard</h2>
      </div>
      <div className="flex items-center space-x-2 lg:space-x-4">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="hidden sm:flex">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
