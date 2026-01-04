/**
 * CRM Error Boundary Component
 * 
 * Catches errors in the CRM module and displays a user-friendly error message.
 */

import React from 'react';
import { Result, Button } from 'antd';

interface CRMErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface CRMErrorBoundaryProps {
  children: React.ReactNode;
}

export class CRMErrorBoundary extends React.Component<
  CRMErrorBoundaryProps,
  CRMErrorBoundaryState
> {
  constructor(props: CRMErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): CRMErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('CRM Error Boundary caught error:', error, errorInfo);
    // TODO: Log to error tracking service (e.g., Sentry, LogRocket)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="CRM Module Error"
          subTitle="Something went wrong with the CRM module. Please refresh the page."
          extra={[
            <Button
              type="primary"
              key="refresh"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>,
          ]}
        />
      );
    }

    return this.props.children;
  }
}












