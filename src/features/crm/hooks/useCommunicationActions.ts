/**
 * useCommunicationActions Hook
 * 
 * Hook for managing communication actions (email, SMS, calls).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { emailService } from '../services/emailService';
import { smsService } from '../services/smsService';
import { callService } from '../services/callService';
import { auditService } from '@/services/audit.service';
import { useAuth } from '@/contexts/AuthContext';
import { handleCRMError } from '../utils/errorHandler';
import type {
  EmailComposeValues,
  SMSComposeValues,
  CallLogValues,
  EmailTemplate,
} from '../types/communication.types';

/**
 * Hook for communication actions
 */
export const useCommunicationActions = (clientId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Email templates query
  const { data: emailTemplates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => emailService.getTemplates(),
  });

  // Client emails query
  const { data: clientEmails = [] } = useQuery({
    queryKey: ['client-emails', clientId],
    queryFn: () => emailService.getClientEmails(clientId!),
    enabled: !!clientId,
  });

  // Client SMS query
  const { data: clientSMS = [] } = useQuery({
    queryKey: ['client-sms', clientId],
    queryFn: () => smsService.getClientSMS(clientId!),
    enabled: !!clientId,
  });

  // Client calls query
  const { data: clientCalls = [] } = useQuery({
    queryKey: ['client-calls', clientId],
    queryFn: () => callService.getClientCalls(clientId!),
    enabled: !!clientId,
  });

  // Send email mutation
  const sendEmail = useMutation({
    mutationFn: async ({
      values,
      clientId: targetClientId,
    }: {
      values: EmailComposeValues;
      clientId: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      let subject = values.subject;
      let body = values.body;

      // If using template, replace variables
      if (values.useTemplate && values.templateId) {
        const template = emailTemplates.find((t) => t.id === values.templateId);
        if (template) {
          // TODO: Get client data for variable replacement
          const replaced = emailService.replaceTemplateVariables(template, {
            firstName: '',
            lastName: '',
            email: values.to,
            phoneNumber: '',
          });
          subject = replaced.subject;
          body = replaced.body;
        }
      }

      const email = await emailService.sendEmail({
        clientId: targetClientId,
        templateId: values.templateId,
        subject,
        body,
        to: values.to,
        from: user.email || 'noreply@savipets.com',
        createdBy: user.id,
      });

      // Log audit trail
      if (user && email) {
        await auditService.logAction({
          action: 'send_email',
          resource: 'crm_email',
          resourceId: email.id,
          userId: user.id,
          userEmail: user.email,
          metadata: {
            clientId: targetClientId,
            subject,
            templateId: values.templateId,
          },
        });
      }

      return email;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-emails'] });
      message.success('Email sent successfully');
    },
    onError: (error) => {
      handleCRMError(error);
      message.error('Failed to send email');
    },
  });

  // Send SMS mutation
  const sendSMS = useMutation({
    mutationFn: async ({
      values,
      clientId: targetClientId,
    }: {
      values: SMSComposeValues;
      clientId: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const sms = await smsService.sendSMS({
        clientId: targetClientId,
        to: values.to,
        from: '+1234567890', // TODO: Replace with actual SMS provider number
        message: values.message,
        createdBy: user.id,
      });

      // Log audit trail
      if (user && sms) {
        await auditService.logAction({
          action: 'send_sms',
          resource: 'crm_sms',
          resourceId: sms.id,
          userId: user.id,
          userEmail: user.email,
          metadata: {
            clientId: targetClientId,
          },
        });
      }

      return sms;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-sms'] });
      message.success('SMS sent successfully');
    },
    onError: (error) => {
      handleCRMError(error);
      message.error('Failed to send SMS');
    },
  });

  // Log call mutation
  const logCall = useMutation({
    mutationFn: async ({
      values,
      clientId: targetClientId,
    }: {
      values: CallLogValues;
      clientId: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const callLog = await callService.logCall({
        clientId: targetClientId,
        phoneNumber: values.phoneNumber,
        direction: values.direction,
        duration: values.duration,
        status: values.status,
        notes: values.notes,
        startedAt: values.startedAt,
        endedAt: values.endedAt,
        createdBy: user.id,
      });

      // Log audit trail
      if (user && callLog) {
        await auditService.logAction({
          action: 'log_call',
          resource: 'crm_call',
          resourceId: callLog.id,
          userId: user.id,
          userEmail: user.email,
          metadata: {
            clientId: targetClientId,
            direction: values.direction,
            duration: values.duration,
          },
        });
      }

      return callLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-calls'] });
      message.success('Call logged successfully');
    },
    onError: (error) => {
      handleCRMError(error);
      message.error('Failed to log call');
    },
  });

  // Create email template mutation
  const createEmailTemplate = useMutation({
    mutationFn: async (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('User not authenticated');
      return emailService.createTemplate({
        ...template,
        createdBy: user.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      message.success('Email template created successfully');
    },
    onError: (error) => {
      handleCRMError(error);
      message.error('Failed to create email template');
    },
  });

  return {
    // Data
    emailTemplates,
    clientEmails,
    clientSMS,
    clientCalls,
    templatesLoading,

    // Actions
    sendEmail,
    sendSMS,
    logCall,
    createEmailTemplate,

    // Loading states
    isLoading:
      sendEmail.isPending || sendSMS.isPending || logCall.isPending || createEmailTemplate.isPending,
  };
};

