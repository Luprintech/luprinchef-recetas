'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogIn, LogOut } from 'lucide-react';

export function AuthButton() {
    const { user, isLoading, signIn, signOut } = useAuth();

    if (isLoading) return null;

    if (user) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer h-8 w-8">
                        <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'Usuario'} />
                        <AvatarFallback>{user.name?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-muted-foreground text-sm" disabled>
                        {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={signOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar sesión
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <Button variant="ghost" size="sm" onClick={signIn}>
            <LogIn className="mr-2 h-4 w-4" />
            Iniciar sesión
        </Button>
    );
}
