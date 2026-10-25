
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdminChatService } from '../admin-chat.service';

type ChatSenderType = 'user' | 'admin';

@Component({
  selector: 'app-admin-panel-chat',
  templateUrl: './admin-panel-chat.component.html',
  styleUrls: ['./admin-panel-chat.component.css']
})
export class AdminPanelChatComponent implements OnInit, OnDestroy {

  adminId = '';
  conversations: any[] = [];
  selectedUser: any = null;
  messages: any[] = [];
  messageText = '';

  loading = false;
  sending = false;

  private messageSubscription?: Subscription;
  private errorSubscription?: Subscription;

  constructor(private chatService: AdminChatService) {}

  ngOnInit(): void {
    this.getAdminId();

    if (!this.adminId) {
      console.error(
        'Owner/admin ID not found in localStorage. Please log in again.'
      );
      return;
    }

    console.log('Owner/admin chat ID:', this.adminId);

    // Join the admin's Socket.IO room.
    this.chatService.joinAdmin(this.adminId);

    // Listen for real-time messages.
    this.messageSubscription = this.chatService
      .onMessage()
      .subscribe((message: any) => {
        this.handleIncomingMessage(message);
      });

    // Listen for backend chat errors.
    this.errorSubscription = this.chatService
      .onError()
      .subscribe((error: any) => {
        console.error('Admin chat socket error:', error);
      });

    this.loadConversations();
  }

  private getAdminId(): void {
    this.adminId =
      localStorage.getItem('ownerId') ||
      localStorage.getItem('adminId') ||
      '';

    if (this.adminId) {
      return;
    }

    // Check common owner/admin session objects.
    const possibleKeys = ['owner', 'admin', 'user', 'loggedInUser'];

    for (const key of possibleKeys) {
      try {
        const savedValue = localStorage.getItem(key);

        if (!savedValue) {
          continue;
        }

        const savedObject = JSON.parse(savedValue);

        const id =
          savedObject?._id ||
          savedObject?.id ||
          savedObject?.ownerId ||
          savedObject?.adminId ||
          savedObject?.user?._id ||
          savedObject?.data?._id;

        if (id) {
          this.adminId = String(id);
          return;
        }
      } catch {
        // Ignore values that are not valid JSON.
      }
    }
  }

  loadConversations(): void {
    if (!this.adminId) {
      return;
    }

    this.chatService.getAdminConversations(this.adminId).subscribe({
      next: (res: any) => {
        this.conversations = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];

        // Keep the selected conversation synchronized with refreshed data.
        if (this.selectedUser?._id) {
          const updatedConversation = this.conversations.find(
            (item: any) => {
              const id =
                typeof item.userId === 'object'
                  ? item.userId?._id
                  : item.userId;

              return String(id) === String(this.selectedUser._id);
            }
          );

          if (updatedConversation?.userId &&
              typeof updatedConversation.userId === 'object') {
            this.selectedUser = updatedConversation.userId;
          }
        }
      },
      error: (error: any) => {
        console.error(
          'Failed to load owner conversations:',
          error?.error || error
        );
      }
    });
  }

  selectUser(conversation: any): void {
    const user = conversation?.userId;

    if (!user) {
      console.error(
        'Conversation does not contain userId:',
        conversation
      );
      return;
    }

    this.selectedUser =
      typeof user === 'object'
        ? user
        : { _id: user };

    this.messages = [];
    this.loadConversation();
  }

  loadConversation(): void {
    const userId = this.selectedUser?._id;

    if (!userId || !this.adminId) {
      return;
    }

    this.loading = true;

    this.chatService.getConversation(userId, this.adminId).subscribe({
      next: (res: any) => {
        const conversationMessages = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : [];

        this.messages = conversationMessages;
        this.loading = false;

        setTimeout(() => this.scrollToBottom(), 50);

        this.chatService
          .markAsRead(userId, this.adminId, 'admin')
          .subscribe({
            error: (error: any) => {
              console.error(
                'Mark as read failed:',
                error?.error || error
              );
            }
          });
      },
      error: (error: any) => {
        this.loading = false;

        console.error(
          'Failed to load conversation:',
          error?.error || error
        );
      }
    });
  }

  handleIncomingMessage(message: any): void {
    if (!message) {
      return;
    }

    // Support either a direct message object or a wrapped response.
    const incoming =
      message?.data && typeof message.data === 'object'
        ? message.data
        : message;

    const incomingUserId =
      typeof incoming.userId === 'object'
        ? incoming.userId?._id
        : incoming.userId;

    const currentUserId = this.selectedUser?._id;

    if (
      currentUserId &&
      String(incomingUserId) === String(currentUserId)
    ) {
      this.addMessageIfMissing(incoming);
      setTimeout(() => this.scrollToBottom(), 50);

      if (incoming.senderType === 'user') {
        this.chatService
          .markAsRead(currentUserId, this.adminId, 'admin')
          .subscribe({
            error: (error: any) => {
              console.error(
                'Mark incoming message as read failed:',
                error?.error || error
              );
            }
          });
      }
    }

    this.loadConversations();
  }

  private addMessageIfMissing(message: any): void {
    if (!message) {
      return;
    }

    const messageId = message._id;

    if (
      messageId &&
      this.messages.some(
        (item: any) => String(item._id) === String(messageId)
      )
    ) {
      return;
    }

    // If no ID is present, avoid relying on it for duplicate detection.
    this.messages = [...this.messages, message];
  }

  sendMessage(): void {
    const userId = this.selectedUser?._id;
    const message = this.messageText.trim();

    if (!this.adminId) {
      console.error('Owner/admin ID is missing.');
      return;
    }

    if (!userId) {
      console.error('Select a user conversation before sending.');
      return;
    }

    if (!message || this.sending) {
      return;
    }

    this.sending = true;

    const payload: {
      userId: string;
      adminId: string;
      senderType: ChatSenderType;
      message: string;
    } = {
      userId: String(userId),
      adminId: String(this.adminId),
      senderType: 'admin',
      message
    };

    console.log('Sending owner message:', payload);

    // This HTTP request must match POST /api/admin-chat/send.
    this.chatService.sendMessage(payload).subscribe({
      next: (res: any) => {
        console.log('Owner message response:', res);

        // Adapt to common API response formats.
        const savedMessage =
          res?.data?.messageData ||
          res?.data?.message ||
          res?.messageData ||
          (res?.data && typeof res.data === 'object'
            ? res.data
            : null);

        if (
          savedMessage &&
          typeof savedMessage === 'object' &&
          savedMessage._id
        ) {
          this.addMessageIfMissing(savedMessage);
        } else {
          // If the API does not return the saved document,
          // reload the conversation from the database.
          this.loadConversation();
        }

        this.messageText = '';
        this.sending = false;

        setTimeout(() => this.scrollToBottom(), 50);
        this.loadConversations();
      },
      error: (error: any) => {
        this.sending = false;

        console.error(
          'Owner message sending failed:',
          error?.error || error
        );
      }
    });
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom(): void {
    const element = document.getElementById('adminChatMessages');

    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }

  ngOnDestroy(): void {
    this.messageSubscription?.unsubscribe();
    this.errorSubscription?.unsubscribe();
  }
}
