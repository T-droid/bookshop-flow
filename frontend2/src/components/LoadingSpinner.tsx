export const LoadingSpinner = ({ message }: { message: string }) => {
  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{message}</p>
            </div>
        </div>
    </div>
  );
};
