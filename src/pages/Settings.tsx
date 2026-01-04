import React, { useState } from 'react';
import { Typography, Card, Button, Space, message, Alert, Spin, Modal } from 'antd';
import { ToolOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { bookingService } from '@/services/booking.service';
import { backfillDirectMessagingAllowed } from '@/services/chat.migration';

const { Title, Text } = Typography;
const { confirm } = Modal;

type VisitFixResult = {
  success: boolean;
  totalVisits: number;
  fixed: number;
  errors: number;
  message?: string;
  errorDetails?: string[];
  // Preserve flexibility for additional fields returned by the backend
  [key: string]: unknown;
};

const SettingsPage: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<VisitFixResult | null>(null);
  const [isMigratingDM, setIsMigratingDM] = useState(false);
  const [dmDryRunResult, setDmDryRunResult] = useState<{
    scanned: number;
    eligible: number;
    updated: number;
    skipped: number;
    idsUpdated: string[];
  } | null>(null);
  const [dmApplyResult, setDmApplyResult] = useState<{
    scanned: number;
    eligible: number;
    updated: number;
    skipped: number;
    idsUpdated: string[];
  } | null>(null);

  const handleFixVisitDates = async () => {
    setIsFixing(true);
    setFixResult(null);
    try {
      const result = await bookingService.fixVisitDates();
      setFixResult(result);
      if (result.success) {
        message.success(`Successfully fixed ${result.fixed} visit(s)!`);
      } else {
        message.warning(`Fixed ${result.fixed} visit(s) with ${result.errors} error(s)`);
      }
    } catch (error: any) {
      message.error(`Failed to fix visit dates: ${error.message}`);
      setFixResult({
        success: false,
        totalVisits: 0,
        fixed: 0,
        errors: 1,
      });
    } finally {
      setIsFixing(false);
    }
  };

  const handleRunDmDryRun = async () => {
    if (isMigratingDM) return;
    setIsMigratingDM(true);
    setDmDryRunResult(null);
    setDmApplyResult(null);
    try {
      const res = await backfillDirectMessagingAllowed({ limit: 100, dryRun: true });
      setDmDryRunResult(res);
      message.info(`Dry run: ${res.eligible} eligible, ${res.updated} would update`);
    } catch (e: any) {
      message.error(`Dry run failed: ${e?.message || 'unknown error'}`);
    } finally {
      setIsMigratingDM(false);
    }
  };

  const handleApplyDmBackfill = async () => {
    if (isMigratingDM) return;
    setIsMigratingDM(true);
    try {
      const res = await backfillDirectMessagingAllowed({ limit: 100, dryRun: false });
      setDmApplyResult(res);
      message.success(`Applied: updated ${res.updated} conversation(s)`);
    } catch (e: any) {
      message.error(`Apply failed: ${e?.message || 'unknown error'}`);
    } finally {
      setIsMigratingDM(false);
    }
  };

  const handleConfirmFixVisitDates = () => {
    if (isFixing) {
      return;
    }

    confirm({
      title: 'Run visit date maintenance?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <Space direction="vertical">
          <Text>
            This maintenance task will scan all visits created via the Admin Panel and
            update any incorrect scheduled dates using their source booking data.
          </Text>
          <Text type="secondary">
            It is safe to run multiple times and will only correct data that is out of sync,
            but it may take a few moments. We recommend running this during off-peak hours.
          </Text>
        </Space>
      ),
      okText: 'Run Fix',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: handleFixVisitDates,
    });
  };

  return (
    <div>
      <Title level={2}>Settings</Title>
      
      <Card
        title={
          <Space>
            <ToolOutlined />
            <span>Data Maintenance</span>
          </Space>
        }
        style={{ marginTop: 24 }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={4}>Fix Visit Dates</Title>
            <Text type="secondary">
              Some visits created via Admin Panel may have incorrect scheduled dates. 
              This tool will update all visits to use the correct dates from their corresponding bookings.
            </Text>
          </div>

          {fixResult && (
            <Alert
              type={fixResult.success ? 'success' : 'warning'}
              message={
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Space>
                    <CheckCircleOutlined />
                    <span>
                      Migration complete: fixed {fixResult.fixed} of {fixResult.totalVisits} visits
                      {fixResult.errors > 0 && ` with ${fixResult.errors} errors`}
                    </span>
                  </Space>
                  {fixResult.message && (
                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: 24 }}>
                      {fixResult.message}
                    </Text>
                  )}
                  {Array.isArray(fixResult.errorDetails) && fixResult.errorDetails.length > 0 && (
                    <div style={{ marginLeft: 24, marginTop: 8 }}>
                      <Text strong style={{ fontSize: '12px' }}>Errors:</Text>
                      <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                        {fixResult.errorDetails.map((err, idx) => (
                          <li key={idx}>
                            <Text type="danger" style={{ fontSize: '12px' }}>{err}</Text>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Space>
              }
              showIcon
            />
          )}

          <Button
            type="primary"
            icon={<ToolOutlined />}
            onClick={handleConfirmFixVisitDates}
            loading={isFixing}
            size="large"
          >
            {isFixing ? 'Fixing Visit Dates...' : 'Fix Visit Dates'}
          </Button>

          {isFixing && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">Processing visits... This may take a few moments.</Text>
              </div>
            </div>
          )}

          <div>
            <Title level={4} style={{ marginTop: 16 }}>Direct Messaging Backfill (Owner↔Sitter)</Title>
            <Text type="secondary">
              Backfill directMessagingAllowed=true for eligible owner↔sitter conversations. Run a dry-run first.
            </Text>
          </div>

          {dmDryRunResult && (
            <Alert
              type="info"
              message={
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <span>
                    Dry Run — scanned {dmDryRunResult.scanned}, eligible {dmDryRunResult.eligible}, would update {dmDryRunResult.updated}, skipped {dmDryRunResult.skipped}
                  </span>
                </Space>
              }
              showIcon
            />
          )}

          {dmApplyResult && (
            <Alert
              type="success"
              message={
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <span>
                    Applied — scanned {dmApplyResult.scanned}, eligible {dmApplyResult.eligible}, updated {dmApplyResult.updated}, skipped {dmApplyResult.skipped}
                  </span>
                </Space>
              }
              showIcon
            />
          )}

          <Space>
            <Button onClick={handleRunDmDryRun} loading={isMigratingDM}>
              {isMigratingDM ? 'Running Dry Run...' : 'Dry Run: Backfill Direct Messaging'}
            </Button>
            <Button type="primary" onClick={handleApplyDmBackfill} loading={isMigratingDM} disabled={!dmDryRunResult}>
              {isMigratingDM ? 'Applying...' : 'Apply Backfill (100)'}
            </Button>
          </Space>
        </Space>
      </Card>
    </div>
  );
};

export default SettingsPage;
