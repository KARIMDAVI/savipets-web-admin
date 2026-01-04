import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button, Card, Typography, Space } from 'antd';
import { ReloadOutlined, BugOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface Props {
  children: ReactNode;
  /** Optional fallback UI component */
  fallback?: ReactNode;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show error details in development */
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary onError={(error, info) => logError(error, info)}>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('[ErrorBoundary] Caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Integrate with error tracking service (e.g., Sentry, LogRocket)
    // Example:
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     contexts: { react: { componentStack: errorInfo.componentStack } }
    //   });
    // }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      const isDevelopment = import.meta.env.DEV;
      const showDetails = this.props.showDetails ?? isDevelopment;

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: '#f5f5f5',
          }}
        >
          <Card
            style={{
              maxWidth: 800,
              width: '100%',
            }}
          >
            <Result
              status="error"
              title="Something went wrong"
              subTitle="An unexpected error occurred. Please try refreshing the page or contact support if the problem persists."
              extra={
                <Space>
                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={this.handleReset}
                  >
                    Try Again
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={this.handleReload}>
                    Reload Page
                  </Button>
                </Space>
              }
            />

            {showDetails && this.state.error && (
              <Card
                type="inner"
                title={
                  <Space>
                    <BugOutlined />
                    <Text strong>Error Details (Development Only)</Text>
                  </Space>
                }
                style={{ marginTop: 24 }}
              >
                <Title level={5}>Error Message:</Title>
                <Paragraph code copyable>
                  {this.state.error.toString()}
                </Paragraph>

                {this.state.errorInfo && (
                  <>
                    <Title level={5} style={{ marginTop: 16 }}>
                      Component Stack:
                    </Title>
                    <pre
                      style={{
                        background: '#f5f5f5',
                        padding: '12px',
                        borderRadius: '4px',
                        overflow: 'auto',
                        fontSize: '12px',
                        maxHeight: '300px',
                      }}
                    >
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}

                {this.state.error.stack && (
                  <>
                    <Title level={5} style={{ marginTop: 16 }}>
                      Stack Trace:
                    </Title>
                    <pre
                      style={{
                        background: '#f5f5f5',
                        padding: '12px',
                        borderRadius: '4px',
                        overflow: 'auto',
                        fontSize: '12px',
                        maxHeight: '300px',
                      }}
                    >
                      {this.state.error.stack}
                    </pre>
                  </>
                )}
              </Card>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

