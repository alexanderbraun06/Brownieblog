export interface INotification {
    _id?: string;
    userId: string;
    type: 'like' | 'comment' | 'follow';
    relatedId: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}