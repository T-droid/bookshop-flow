import { useAuth } from '@/hooks/useAuth';
import React from 'react';
import { Shield, Lock, BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

type ProtectedRouteProps = {
    roles?: string[];
    children?: React.ReactNode;
}

// Book Loading Animation Component
const BookLoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
            <div className="text-center">
                {/* Animated Book */}
                <div className="relative mb-8">
                    <div className="book-container">
                        <div className="book">
                            <div className="book-spine"></div>
                            <div className="book-cover book-cover-front">
                                <div className="book-title">
                                    <BookOpen className="w-8 h-8 text-primary mb-2" />
                                    <div className="text-sm font-medium text-foreground">BookShelf</div>
                                    <div className="text-xs text-muted-foreground">IMS</div>
                                </div>
                            </div>
                            <div className="book-page page-1"></div>
                            <div className="book-page page-2"></div>
                            <div className="book-page page-3"></div>
                            <div className="book-page page-4"></div>
                            <div className="book-page page-5"></div>
                            <div className="book-cover book-cover-back"></div>
                        </div>
                    </div>
                </div>

                {/* Loading Text */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">Loading your library...</h3>
                    <p className="text-sm text-muted-foreground">Please wait while we prepare your books</p>
                </div>

                {/* Animated Dots */}
                <div className="flex justify-center space-x-1 mt-4">
                    <div className="dot animate-bounce"></div>
                    <div className="dot animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="dot animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>

            <style>{`
                .book-container {
                    perspective: 1000px;
                    transform-style: preserve-3d;
                }

                .book {
                    position: relative;
                    width: 120px;
                    height: 160px;
                    transform-style: preserve-3d;
                    animation: bookFloat 3s ease-in-out infinite;
                }

                .book-spine {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 12px;
                    height: 160px;
                    background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 50%, hsl(var(--primary)/0.8) 100%);
                    transform: rotateY(-90deg) translateZ(54px);
                    border-radius: 2px 0 0 2px;
                }

                .book-cover {
                    position: absolute;
                    width: 108px;
                    height: 160px;
                    background: linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%);
                    border: 2px solid hsl(var(--border));
                    border-radius: 4px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }

                .book-cover-front {
                    transform: translateZ(54px);
                }

                .book-cover-back {
                    transform: rotateY(180deg) translateZ(54px);
                    background: linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted)/0.8) 100%);
                }

                .book-title {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                    padding: 8px;
                }

                .book-page {
                    position: absolute;
                    width: 104px;
                    height: 156px;
                    background: hsl(var(--background));
                    border: 1px solid hsl(var(--border)/0.3);
                    border-radius: 2px;
                    transform-origin: left center;
                }

                .page-1 {
                    transform: translateZ(48px) rotateY(0deg);
                    animation: flipPage1 4s ease-in-out infinite;
                }

                .page-2 {
                    transform: translateZ(42px) rotateY(0deg);
                    animation: flipPage2 4s ease-in-out infinite;
                }

                .page-3 {
                    transform: translateZ(36px) rotateY(0deg);
                    animation: flipPage3 4s ease-in-out infinite;
                }

                .page-4 {
                    transform: translateZ(30px) rotateY(0deg);
                    animation: flipPage4 4s ease-in-out infinite;
                }

                .page-5 {
                    transform: translateZ(24px) rotateY(0deg);
                    animation: flipPage5 4s ease-in-out infinite;
                }

                @keyframes bookFloat {
                    0%, 100% { transform: translateY(0px) rotateY(-5deg); }
                    50% { transform: translateY(-10px) rotateY(5deg); }
                }

                @keyframes flipPage1 {
                    0%, 20% { transform: translateZ(48px) rotateY(0deg); }
                    30%, 50% { transform: translateZ(48px) rotateY(-180deg); }
                    60%, 100% { transform: translateZ(48px) rotateY(0deg); }
                }

                @keyframes flipPage2 {
                    5%, 25% { transform: translateZ(42px) rotateY(0deg); }
                    35%, 55% { transform: translateZ(42px) rotateY(-180deg); }
                    65%, 100% { transform: translateZ(42px) rotateY(0deg); }
                }

                @keyframes flipPage3 {
                    10%, 30% { transform: translateZ(36px) rotateY(0deg); }
                    40%, 60% { transform: translateZ(36px) rotateY(-180deg); }
                    70%, 100% { transform: translateZ(36px) rotateY(0deg); }
                }

                @keyframes flipPage4 {
                    15%, 35% { transform: translateZ(30px) rotateY(0deg); }
                    45%, 65% { transform: translateZ(30px) rotateY(-180deg); }
                    75%, 100% { transform: translateZ(30px) rotateY(0deg); }
                }

                @keyframes flipPage5 {
                    20%, 40% { transform: translateZ(24px) rotateY(0deg); }
                    50%, 70% { transform: translateZ(24px) rotateY(-180deg); }
                    80%, 100% { transform: translateZ(24px) rotateY(0deg); }
                }

                .dot {
                    width: 8px;
                    height: 8px;
                    background: hsl(var(--primary));
                    border-radius: 50%;
                }
            `}</style>
        </div>
    );
};

// Unauthorized Access Component
const UnauthorizedAccess = () => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/30 to-background p-6">
            <Card className="max-w-md w-full p-8 text-center bg-card border border-border shadow-card-soft">
                <div className="mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                        <Lock className="w-8 h-8 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
                    <p className="text-muted-foreground">
                        You are not authenticated. Please log in to access this page.
                    </p>
                </div>

                <div className="space-y-4">
                    <Button 
                        onClick={() => navigate('/auth/login')} 
                        className="w-full gap-2"
                        variant="default"
                    >
                        <ChevronRight className="w-4 h-4" />
                        Go to Login
                    </Button>
                    
                    <Button 
                        onClick={() => navigate('/')} 
                        variant="outline"
                        className="w-full"
                    >
                        Return Home
                    </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                        Need help? Contact your system administrator
                    </p>
                </div>
            </Card>
        </div>
    );
};

// Insufficient Permissions Component
const InsufficientPermissions = ({ requiredRoles }: { requiredRoles: string[] }) => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted/30 to-background p-6">
            <Card className="max-w-md w-full p-8 text-center bg-card border border-border shadow-card-soft">
                <div className="mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-amber-500/10 rounded-full flex items-center justify-center">
                        <Shield className="w-8 h-8 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Insufficient Permissions</h2>
                    <p className="text-muted-foreground mb-4">
                        You don't have the required permissions to access this page.
                    </p>
                    
                    <div className="bg-muted/50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Required Roles:</span> {requiredRoles.join(', ')}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <Button 
                        onClick={() => navigate('/dashboard')} 
                        className="w-full gap-2"
                        variant="default"
                    >
                        <ChevronRight className="w-4 h-4" />
                        Go to Dashboard
                    </Button>
                    
                    <Button 
                        onClick={() => window.history.back()} 
                        variant="outline"
                        className="w-full"
                    >
                        Go Back
                    </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                        Contact your administrator to request access permissions
                    </p>
                </div>
            </Card>
        </div>
    );
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles, children }) => {
    const { hasRole, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <BookLoadingSpinner />;
    }

    if (!isAuthenticated) {
        return <UnauthorizedAccess />;
    }

    // Check if user has any of the required roles
    if (roles && roles.length > 0 && !roles.some(role => hasRole(role))) {
        return <InsufficientPermissions requiredRoles={roles} />;
    }

    return (
        <div>
            {children}
        </div>
    );
}

export default ProtectedRoute;
