import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const success = await login({ email: email.trim(), password });
            if (success) {
                toast({ title: 'Welcome back!' });
                navigate('/');
            } else {
                toast({
                    title: 'Login failed',
                    description: 'Invalid email or password',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Something went wrong',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                        <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-center text-gray-900">WorkBooster</h2>
                    <p className="text-muted-foreground mt-2">Sign in to your account</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Login</CardTitle>
                        <CardDescription>Enter your credentials to access the admin panel.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
