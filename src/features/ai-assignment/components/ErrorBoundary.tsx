import React, { Component, type ReactNode } from 'react';
import { Alert, Button } from 'antd';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AIAssignmentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('AI Assignment Error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Alert
          message="Something went wrong"
          description={this.state.error?.message || 'An unexpected error occurred'}
          type="error"
          showIcon
          action={
            <Button
              size="small"
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              Try Again
            </Button>
          }
        />
      );
    }
    return this.props.children;
  }
}











