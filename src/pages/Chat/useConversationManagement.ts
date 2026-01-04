import { message } from 'antd';
import { chatService } from '@/services/chat.service';

interface UseConversationManagementProps {
  selectedConversationId: string | null;
  onConversationDeleted: () => void;
  refetchConversations: () => Promise<void>;
}

export const useConversationManagement = ({
  selectedConversationId,
  onConversationDeleted,
  refetchConversations,
}: UseConversationManagementProps) => {
  const handleDeleteConversation = async (conversationId: string) => {
    try {
      message.loading({ content: 'Deleting conversation...', key: 'delete-conversation' });
      
      await chatService.deleteConversation(conversationId);
      
      message.success({ content: 'Conversation deleted successfully', key: 'delete-conversation' });
      
      if (selectedConversationId === conversationId) {
        onConversationDeleted();
      }
      
      await refetchConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      message.error({ 
        content: 'Failed to delete conversation. Please try again.', 
        key: 'delete-conversation' 
      });
    }
  };

  return {
    handleDeleteConversation,
  };
};


