/**
 * Accessible Modal Component
 * Modal with proper ARIA attributes and focus management
 */

import React, { useEffect } from 'react';
import { Modal, ModalProps } from 'antd';
import { useFocusTrap } from '@/design/utils/useFocusManagement';
import { a11y } from '@/design/utils/a11y';

interface AccessibleModalProps extends ModalProps {
  modalLabel: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  modalLabel,
  open,
  children,
  ...props
}) => {
  const contentRef = useFocusTrap(open || false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  return (
    <Modal
      {...props}
      open={open}
      title={props.title || modalLabel}
    >
      <div 
        ref={contentRef as React.RefObject<HTMLDivElement>}
        aria-label={modalLabel}
        aria-modal="true"
        role="dialog"
      >
        {children}
      </div>
    </Modal>
  );
};

