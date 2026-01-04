import { message } from 'antd';
import { auth } from '@/config/firebase.config';
import { chatService } from '@/services/chat.service';
import type { Inquiry } from '@/features/chat/hooks';

interface UseInquiryHandlingProps {
  onInquiryAccepted: (conversationId: string) => void;
  refetchInquiries: () => Promise<void>;
  refetchConversations: () => Promise<void>;
}

export const useInquiryHandling = ({
  onInquiryAccepted,
  refetchInquiries,
  refetchConversations,
}: UseInquiryHandlingProps) => {
  const handleAcceptInquiry = async (inquiry: Inquiry) => {
    const adminUid = auth.currentUser?.uid;
    if (!adminUid) {
      message.error('You must be signed in as admin to accept inquiries.');
      return;
    }

    try {
      message.loading({ content: 'Accepting inquiry...', key: 'accept-inquiry' });
      const conversationId = await chatService.acceptInquiry(
        inquiry.id,
        {
          fromUserId: inquiry.fromUserId,
          fromUserRole: inquiry.fromUserRole,
          subject: inquiry.subject,
          initialMessage: inquiry.initialMessage,
        },
        adminUid
      );

      message.success({ content: 'Inquiry accepted. Opening conversation...', key: 'accept-inquiry' });
      
      await Promise.all([
        refetchInquiries(),
        refetchConversations(),
      ]);

      const newConversation = await chatService.getConversationById(conversationId);
      if (newConversation) {
        onInquiryAccepted(conversationId);
      }
    } catch (error) {
      console.error('Error accepting inquiry:', error);
      message.error({ content: 'Failed to accept inquiry. Please try again.', key: 'accept-inquiry' });
    }
  };

  return {
    handleAcceptInquiry,
  };
};


