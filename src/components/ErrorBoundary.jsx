import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-spotify-black flex items-center justify-center p-8" dir="rtl">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6">
              <AlertTriangle size={40} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-white">
              عذراً، حدث خطأ
            </h1>
            <p className="text-gray-400 mb-8">
              حدث خطأ غير متوقع. يرجى تحديث الصفحة والمحاولة مرة أخرى.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-spotify-green hover:bg-spotify-darkGreen text-white px-6 py-3 rounded-full font-semibold transition-all duration-200"
            >
              تحديث الصفحة
            </button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 p-4 bg-spotify-gray rounded-lg text-left">
                <p className="text-red-400 text-sm font-mono">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
