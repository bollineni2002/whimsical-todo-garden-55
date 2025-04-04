
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Session, User } from '@supabase/supabase-js'; // Changed import source

interface ProfileSettingsProps {
  user: User | null;
  onUpdate: (profileData: { name: string; phone: string }) => Promise<void>;
}

const ProfileSettings = ({ user, onUpdate }: ProfileSettingsProps) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || user.user_metadata?.name || '');
      setEmail(user.email || '');
      setPhone(user.user_metadata?.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onUpdate({ 
        name,
        phone
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Update your personal information.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt={name} />
          <AvatarFallback className="text-lg">{getInitials(name)}</AvatarFallback>
        </Avatar>
        
        <div className="space-y-1 flex-1">
          <h3 className="font-medium">{name || 'Your Name'}</h3>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
        
        <Button variant="outline" size="sm" className="mt-2 md:mt-0">
          Change Avatar
        </Button>
      </div>
      
      <Separator />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Your email cannot be changed.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
