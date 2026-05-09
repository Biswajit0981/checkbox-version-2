import { Socket } from "socket.io";
export type IUser = 'Join' | 'Leave'
export type IToggle = {
    id:string;
    value:boolean;
    checkedStatus?: number;
}
export type IRoomChange = {
    roomId: string;
    checkpoint: number;
}

export interface ServerToClientEvents {
    noArg: () => void;
    basicEmit: (...args: unknown[]) => void;
    withAck: (d: string, callback: (n: number) => void) => void;
    liveUser: (userCount: number) => void;
    whoJoin: (obj: {name:string, type: IUser}) => void;
    toggleChanged: (obj: IToggle) => void;
    onDisconnect: (d:string, callback: (n:number) => void) => void;
    rate_limit: (d:string) => void;
}

export interface ClientToServerEvents {
   onToggle: (d: string) => void;
   joinRoom: (d: string) => void;
}

export interface InternalServerEvents {

}

export interface SocketData {
    userCount: number;
    roomId?: string;
}

export interface CustomSocket extends Socket {
    user?: {
        id: string;
        name: string;
    } |  null;
}