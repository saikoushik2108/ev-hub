import Notification from '../models/Notification.js';
import { emitToUser, emitToOwner, emitToAdmin } from '../config/socket.js';

export const createNotification = async ({
  userId,
  title,
  message,
  type = 'SYSTEM',
  link = '',
  metadata = {},
  isOwner = false,
  isAdmin = false,
}) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      link,
      metadata,
      isRead: false,
    });

    // Real-time Socket.IO emission
    if (userId) {
      emitToUser(userId.toString(), 'notificationCreated', notification);
    }
    if (isOwner) {
      emitToOwner(userId.toString(), 'notificationCreated', notification);
    }
    if (isAdmin) {
      emitToAdmin('notificationCreated', notification);
    }

    return notification;
  } catch (error) {
    console.error('[Notification] Error creating notification:', error);
    return null;
  }
};

