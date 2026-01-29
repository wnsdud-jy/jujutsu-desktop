import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LogIn } from 'lucide-react';

export function LoginCard({ onLogin }: { onLogin: () => void }) {
    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>Login to access your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="method">Login Method</Label>
                        <Button onClick={onLogin} className="w-full gap-2">
                            <LogIn className="w-4 h-4" />
                            Login with GitHub
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
