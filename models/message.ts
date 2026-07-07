export interface IMessage {
    _id?: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    isRead: boolean;
}