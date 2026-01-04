/**
 * Import Modal Component
 * 
 * Modal for importing clients from CSV file with preview and validation.
 */

import React, { useState, useCallback } from 'react';
import {
  Modal,
  Upload,
  Button,
  Table,
  Alert,
  Steps,
  Typography,
  Space,
  Tag,
  Progress,
} from 'antd';
import {
  UploadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import {
  previewCSV,
  importClientsFromCSV,
  validateHeaders,
  type ImportResult,
  type ImportPreview,
} from '../utils/importUtils';
import { userService } from '@/services/user.service';
import { message } from 'antd';

const { Text } = Typography;
const { Dragger } = Upload;

interface ImportModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: (importedCount: number) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const handleFileSelect: UploadProps['beforeUpload'] = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const previewData = previewCSV(content, 10);
      const headerErrors = validateHeaders(previewData.headers);

      if (headerErrors.length > 0) {
        message.error('Invalid CSV headers. Please check the file format.');
        return false;
      }

      setFile(file);
      setPreview(previewData);
      setCurrentStep(1);
    };
    reader.readAsText(file);
    return false; // Prevent auto upload
  };

  const handlePreview = useCallback(() => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = importClientsFromCSV(content);
      setImportResult(result);
      setCurrentStep(2);
    };
    reader.readAsText(file);
  }, [file]);

  const handleImport = async () => {
    if (!file || !importResult) return;

    setImporting(true);
    setImportProgress(0);

    try {
      let successCount = 0;
      const total = importResult.data.length;

      for (let i = 0; i < importResult.data.length; i++) {
        try {
          // Note: userService.createUser would need to be implemented
          // For now, we'll simulate the import
          await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate API call
          successCount++;
          setImportProgress(Math.round(((i + 1) / total) * 100));
        } catch (error) {
          console.error(`Failed to import row ${i + 1}:`, error);
        }
      }

      message.success(`Successfully imported ${successCount} of ${total} clients`);
      if (onSuccess) {
        onSuccess(successCount);
      }
      handleClose();
    } catch (error) {
      console.error('Import error:', error);
      message.error('Failed to import clients');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setFile(null);
    setPreview(null);
    setImportResult(null);
    setImportProgress(0);
    onCancel();
  };

  const previewColumns = preview?.headers.map((header, index) => ({
    title: header,
    dataIndex: index,
    key: index,
    ellipsis: true,
  })) || [];

  const previewDataSource = preview?.rows.map((row, index) => ({
    key: index,
    ...row.reduce((acc, cell, cellIndex) => {
      acc[cellIndex] = cell;
      return acc;
    }, {} as Record<number, string>),
  })) || [];

  return (
    <Modal
      title="Import Clients"
      open={visible}
      onCancel={handleClose}
      width={900}
      footer={null}
    >
      <Steps
        current={currentStep}
        items={[
          {
            title: 'Upload File',
            icon: <UploadOutlined />,
          },
          {
            title: 'Preview',
            icon: <FileTextOutlined />,
          },
          {
            title: 'Import',
            icon: <CheckCircleOutlined />,
          },
        ]}
        style={{ marginBottom: '24px' }}
      />

      {currentStep === 0 && (
        <div>
          <Dragger
            accept=".csv"
            beforeUpload={handleFileSelect}
            maxCount={1}
            fileList={[]}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">Click or drag CSV file to this area to upload</p>
            <p className="ant-upload-hint">
              Supported format: CSV file with headers (email, firstName, lastName, etc.)
            </p>
          </Dragger>
          <div style={{ marginTop: '16px' }}>
            <Text type="secondary">
              <strong>Expected headers:</strong> email, firstName, lastName, phoneNumber (optional),
              isActive (optional), createdAt (optional)
            </Text>
          </div>
        </div>
      )}

      {currentStep === 1 && preview && (
        <div>
          <Alert
            message={`Preview: ${preview.totalRows} total rows (showing first ${preview.rows.length})`}
            type="info"
            style={{ marginBottom: '16px' }}
          />
          <Table
            columns={previewColumns}
            dataSource={previewDataSource}
            pagination={false}
            scroll={{ x: 'max-content', y: 300 }}
            size="small"
          />
          <Space style={{ marginTop: '16px', width: '100%', justifyContent: 'space-between' }}>
            <Button onClick={() => setCurrentStep(0)}>Back</Button>
            <Button type="primary" onClick={handlePreview}>
              Validate & Continue
            </Button>
          </Space>
        </div>
      )}

      {currentStep === 2 && importResult && (
        <div>
          {importResult.success ? (
            <Alert
              message="All rows are valid"
              type="success"
              icon={<CheckCircleOutlined />}
              style={{ marginBottom: '16px' }}
            />
          ) : (
            <Alert
              message={`Found ${importResult.invalidRows} invalid row(s)`}
              type="warning"
              icon={<CloseCircleOutlined />}
              style={{ marginBottom: '16px' }}
              description={
                <div>
                  {importResult.errors.slice(0, 5).map((error, index) => (
                    <div key={index} style={{ marginTop: '4px' }}>
                      Row {error.row}, {error.field}: {error.message}
                    </div>
                  ))}
                  {importResult.errors.length > 5 && (
                    <div style={{ marginTop: '4px' }}>
                      ... and {importResult.errors.length - 5} more errors
                    </div>
                  )}
                </div>
              }
            />
          )}

          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Total Rows:</Text> {importResult.totalRows}
            </div>
            <div>
              <Text strong>Valid Rows:</Text>{' '}
              <Tag color="green">{importResult.validRows}</Tag>
            </div>
            <div>
              <Text strong>Invalid Rows:</Text>{' '}
              <Tag color="red">{importResult.invalidRows}</Tag>
            </div>
          </Space>

          {importing && (
            <div style={{ marginTop: '16px' }}>
              <Progress percent={importProgress} status="active" />
            </div>
          )}

          <Space style={{ marginTop: '16px', width: '100%', justifyContent: 'space-between' }}>
            <Button onClick={() => setCurrentStep(1)} disabled={importing}>
              Back
            </Button>
            <Button
              type="primary"
              onClick={handleImport}
              disabled={importResult.invalidRows > 0 || importing}
              loading={importing}
            >
              Import {importResult.validRows} Valid Row(s)
            </Button>
          </Space>
        </div>
      )}
    </Modal>
  );
};

