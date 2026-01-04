/**
 * Secure File Upload Component
 * File upload with security validation
 */

import React, { useState } from 'react';
import { Upload, Button, Form, FormItemProps, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { securityConfig } from '@/config/security.config';
import { sanitization } from '@/utils/security/sanitization';
import { a11y } from '@/design/utils/a11y';

interface FileUploadProps extends FormItemProps {
  maxSize?: number; // in MB
  accept?: string;
  maxCount?: number;
  allowedMimeTypes?: string[];
  onFileValidate?: (file: File) => Promise<boolean>;
}

export const FileUploadField: React.FC<FileUploadProps> = ({
  maxSize = securityConfig.fileUpload.maxSize / (1024 * 1024),
  accept,
  maxCount = 1,
  allowedMimeTypes = securityConfig.fileUpload.allowedMimeTypes,
  onFileValidate,
  ...props
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const fieldId = a11y.generateId('file-upload');

  // Validate MIME type using magic bytes
  const validateMimeType = async (file: File): Promise<boolean> => {
    if (allowedMimeTypes.length === 0) return true;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer.slice(0, 4));

        const isValid = allowedMimeTypes.some(mimeType => {
          // JPEG: FF D8 FF
          if (mimeType === 'image/jpeg' && bytes[0] === 0xFF && bytes[1] === 0xD8) {
            return true;
          }
          // PNG: 89 50 4E 47
          if (mimeType === 'image/png' && bytes[0] === 0x89 && bytes[1] === 0x50 &&
              bytes[2] === 0x4E && bytes[3] === 0x47) {
            return true;
          }
          // PDF: 25 50 44 46
          if (mimeType === 'application/pdf' && bytes[0] === 0x25 && bytes[1] === 0x50 &&
              bytes[2] === 0x44 && bytes[3] === 0x46) {
            return true;
          }
          return false;
        });

        resolve(isValid);
      };
      reader.readAsArrayBuffer(file.slice(0, 4));
    });
  };

  const beforeUpload = async (file: File): Promise<boolean> => {
    // 1. Size validation
    const isValidSize = file.size < maxSize * 1024 * 1024;
    if (!isValidSize) {
      message.error(`File must be smaller than ${maxSize}MB!`);
      return false;
    }

    // 2. Filename sanitization
    const sanitized = sanitization.sanitizeFilename(file.name);
    if (sanitized !== file.name) {
      message.warning('Filename sanitized for security');
    }

    // 3. MIME type validation
    if (allowedMimeTypes.length > 0) {
      const isValidMime = await validateMimeType(file);
      if (!isValidMime) {
        message.error('Invalid file type. Please upload a valid file.');
        return false;
      }
    }

    // 4. Server-side validation
    if (onFileValidate) {
      try {
        const isValid = await onFileValidate(file);
        if (!isValid) {
          message.error('File validation failed. Please try another file.');
          return false;
        }
      } catch (error) {
        message.error('File validation error. Please try again.');
        return false;
      }
    }

    return true;
  };

  const handleChange = (info: any) => {
    if (info.file.status === 'done') {
      message.success(`${sanitization.sanitizeFilename(info.file.name)} uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`Upload failed: ${info.file.error?.message || 'Unknown error'}`);
    }
    setFileList(info.fileList);
  };

  return (
    <Form.Item {...props}>
      <Upload
        fileList={fileList}
        onChange={handleChange}
        beforeUpload={beforeUpload}
        accept={accept}
        maxCount={maxCount}
        {...a11y.describedBy(fieldId)}
      >
        <Button icon={<UploadOutlined />}>Upload</Button>
      </Upload>
      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: 8 }} id={fieldId}>
        Max size: {maxSize}MB. Allowed types: {allowedMimeTypes.join(', ') || 'All'}
      </div>
    </Form.Item>
  );
};

