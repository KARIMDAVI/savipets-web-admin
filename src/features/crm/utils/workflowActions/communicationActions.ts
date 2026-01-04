/**
 * Communication Workflow Actions
 * 
 * Actions for sending emails and SMS messages.
 */

import { emailService } from '../../services/emailService';
import { smsService } from '../../services/smsService';
import { replaceVariables } from './variableReplacer';

/**
 * Execute send email action
 */
export async function executeSendEmail(
  params: Record<string, unknown>,
  triggerData: Record<string, unknown>
): Promise<unknown> {
  const clientId = params.clientId as string || triggerData.clientId as string;
  const templateId = params.templateId as string | undefined;
  const subject = params.subject as string;
  const body = params.body as string;
  const to = params.to as string || triggerData.email as string;

  if (!clientId || !to) {
    throw new Error('Client ID and recipient email are required');
  }

  const processedSubject = replaceVariables(subject, triggerData);
  const processedBody = replaceVariables(body, triggerData);

  return await emailService.sendEmail({
    clientId,
    templateId,
    subject: processedSubject,
    body: processedBody,
    to,
    from: 'noreply@savipets.com',
    createdBy: 'system',
  });
}

/**
 * Execute send SMS action
 */
export async function executeSendSMS(
  params: Record<string, unknown>,
  triggerData: Record<string, unknown>
): Promise<unknown> {
  const clientId = params.clientId as string || triggerData.clientId as string;
  const message = params.message as string;
  const to = params.to as string || triggerData.phoneNumber as string;

  if (!clientId || !to) {
    throw new Error('Client ID and recipient phone number are required');
  }

  const processedMessage = replaceVariables(message, triggerData);

  return await smsService.sendSMS({
    clientId,
    to,
    from: '+1234567890',
    message: processedMessage,
    createdBy: 'system',
  });
}


