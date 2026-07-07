export interface IPost{
    _id?: string;
    userId: string;
    content: string;

    imageUrl?: string;
    videoUrl?: string;

    visibility: 'public' | 'private' | 'friends';
    createdAt: Date;
    updatedAt: Date;
}