import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Trash2 } from 'lucide-react';
import { RepoConfig } from '@jujutsu/types';
import { cn } from '@/lib/utils';

interface RepoItemProps {
    repo: RepoConfig;
    isActive: boolean;
    onSelect: (repo: RepoConfig) => void;
    onRemove: (path: string) => void;
}

export function RepoItem({ repo, isActive, onSelect, onRemove }: RepoItemProps) {
    return (
        <DropdownMenuItem
            onClick={() => onSelect(repo)}
            className="flex items-center gap-2 cursor-pointer group"
        >
            <Avatar className="h-6 w-6 rounded-sm">
                <AvatarImage src={repo.avatarUrl} />
                <AvatarFallback className="text-[8px] bg-primary/20">
                    {repo.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden flex-1">
                <span className={cn(
                    "truncate text-xs",
                    isActive ? "font-bold text-primary" : "font-medium"
                )}>
                    {repo.name}
                </span>
                <span className="text-[9px] opacity-60 truncate">{repo.path}</span>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove(repo.path);
                }}
            >
                <Trash2 className="h-3 w-3" />
            </Button>
        </DropdownMenuItem>
    );
}
