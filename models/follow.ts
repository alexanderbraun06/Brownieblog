export interface IFollow {
    _id?: string;
    followerId: string;
    followingId: string;
    createdAt: Date;
    updatedAt: Date;
}