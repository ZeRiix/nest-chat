export interface SocketEvent {
    event: string;
    data: any;
}

export interface SocketUser {
    id: string;
    username: string;
}

export interface SocketMessage {
    sender: SocketUser;
    content: string;
    timestamp: Date;
}

export interface SocketRoom {
    id: string;
    name: string;
    participants: SocketUser[];
}