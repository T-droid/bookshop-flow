import { Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AxiosError } from 'axios';
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { logIn, isLoading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (email.trim() === '' || password.trim() === '') {
        setError('Email and password cannot be empty');
        return;
      }
      if (!email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      await logIn(email, password)
      console.log("logging in...")
      if (!isAuthenticated) 
        navigate('/');
        
    } catch (err) {
      const error = err as AxiosError<{ detail?: string }>;
      if (error.response?.status === 401) {
        setError('Invalid email or password');
      } else {
        setError(error.response?.data?.detail || 'An unexpected error occurred');
      }
    }
  };
  return (
    <div className="min-h-screen bg-gradient-page flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
            <Book className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-foreground">BookShelf IMS</h1>
          <p className="mt-2 text-muted-foreground">Welcome back to your bookshop</p>
        </div>

        {/* Login Form */}
        <Card className="p-8 bg-card border border-border shadow-book">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@bookshop.com"
                className="bg-background border-border"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter your password"
                className="bg-background border-border"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-accent" />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <Button variant="link" size="sm" className="text-accent">
                Forgot password?
              </Button>
            </div>

            <Button 
              type="submit" 
              variant="premium" 
              size="lg" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In to Dashboard"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Need access?{" "}
              <Button variant="link" size="sm" className="text-accent p-0" disabled={isLoading}>
                Contact your admin
              </Button>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 BookShelf IMS. Crafted for independent bookshops.</p>
        </div>
      </div>
    </div>
  );
}