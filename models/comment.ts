export interface IComment {
    _id?: string;
    postId: string;
    userId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
}