import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // يمكن تسجيل الخطأ في خدمة تتبع الأخطاء هنا
    console.error('خطأ تم اكتشافه بواسطة ErrorBoundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">حدث خطأ غير متوقع</h1>
          <p className="mb-6 text-gray-600">
            نعتذر عن هذا الخطأ. يرجى تحديث الصفحة أو المحاولة مرة أخرى لاحقًا.
          </p>
          <div className="space-x-4 space-x-reverse">
            <Button onClick={() => window.location.reload()}>
              تحديث الصفحة
            </Button>
            <Button variant="outline" onClick={() => this.setState({ hasError: false, error: null })}>
              محاولة مرة أخرى
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-8 max-w-full overflow-auto rounded border p-4 text-left">
              <p className="mb-2 font-mono font-bold">{this.state.error.toString()}</p>
              <pre className="text-sm text-gray-700">
                {this.state.error.stack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
