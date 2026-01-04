import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Row, Col, Form, message } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { useReports, useReportActions } from '@/features/reports/hooks';
import {
  ReportStatsCards,
  ReportTemplatesList,
  ScheduledReportsList,
  ReportPreviewModal,
  CreateTemplateModal,
  ScheduleReportModal,
} from '@/features/reports/components';
import { calculateReportStats } from '@/features/reports/utils/reportHelpers';
import type { ReportTemplate } from '@/features/reports/types/reports.types';

const { Title, Text } = Typography;

const ReportsPage: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [templateModalVisible, setTemplateModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [scheduleForm] = Form.useForm();

  // Use reports hook
  const {
    reportTemplates,
    reportData,
    scheduledReports,
    isLoading,
    setReportTemplates,
    setReportData,
    setScheduledReports,
    initializeTemplates,
  } = useReports();

  // Initialize templates on mount
  useEffect(() => {
    initializeTemplates();
  }, [initializeTemplates]);

  // Use report actions hook
  const { generateReport, exportReport, createTemplate, scheduleReport } = useReportActions({
    onReportGenerated: (data) => {
      setReportData(data);
      setPreviewModalVisible(true);
    },
    onTemplateCreated: (template) => {
      setReportTemplates(prev => [...prev, template]);
      setTemplateModalVisible(false);
      form.resetFields();
    },
    onReportScheduled: (schedule) => {
      setScheduledReports(prev => [...prev, schedule]);
      setScheduleModalVisible(false);
      scheduleForm.resetFields();
    },
  });

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateReportStats(reportTemplates, new Date('2024-01-20'));
  }, [reportTemplates]);

  // Handlers
  const handleGenerateReport = async (template: ReportTemplate) => {
    try {
      setSelectedTemplate(template);
      await generateReport(template);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleExportReport = (format: 'pdf' | 'csv' | 'excel') => {
    if (!reportData || !selectedTemplate) return;
    exportReport(reportData, selectedTemplate, format);
  };

  const handleCreateTemplate = async (values: any) => {
    try {
      await createTemplate(values);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const handleScheduleReport = async (values: any) => {
    try {
      await scheduleReport(values);
    } catch (error) {
      // Error already handled in hook
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <span style={{ marginRight: '8px' }}>
            <FileTextOutlined />
          </span>
          Comprehensive Reports
        </Title>
        <Text type="secondary">
          Custom report builder with scheduling and multiple export formats
        </Text>
      </div>

      <ReportStatsCards
        totalTemplates={stats.totalTemplates}
        scheduledReports={stats.scheduledReports}
        totalExports={stats.totalExports}
        lastGenerated={stats.lastGenerated}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <ReportTemplatesList
            templates={reportTemplates}
            loading={isLoading}
            onGenerate={handleGenerateReport}
            onCreate={() => setTemplateModalVisible(true)}
            onRefresh={() => message.info('Refreshing templates...')}
          />
        </Col>

        <Col xs={24} lg={8}>
          <ScheduledReportsList
            schedules={scheduledReports}
            templates={reportTemplates}
            onSchedule={() => setScheduleModalVisible(true)}
          />
        </Col>
      </Row>

      <ReportPreviewModal
        visible={previewModalVisible}
        template={selectedTemplate}
        reportData={reportData}
        onClose={() => setPreviewModalVisible(false)}
        onExport={handleExportReport}
      />

      <CreateTemplateModal
        visible={templateModalVisible}
        onCancel={() => {
          setTemplateModalVisible(false);
          form.resetFields();
        }}
        onFinish={handleCreateTemplate}
        form={form}
      />

      <ScheduleReportModal
        visible={scheduleModalVisible}
        templates={reportTemplates}
        onCancel={() => {
          setScheduleModalVisible(false);
          scheduleForm.resetFields();
        }}
        onFinish={handleScheduleReport}
        form={scheduleForm}
      />
    </div>
  );
};

export default ReportsPage;
