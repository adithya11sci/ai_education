import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import type { LiveKitRoomOptions, LiveKitTokenOptions } from "../types/index";

export class LiveKitService {
  private roomService: RoomServiceClient;
  private apiKey: string;
  private apiSecret: string;
  private wsUrl: string;

  constructor(apiKey: string, apiSecret: string, wsUrl: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.wsUrl = wsUrl;
    this.roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret);
  }

  /**
   * Create a new LiveKit room
   */
  async createRoom(options: LiveKitRoomOptions) {
    try {
      const room = await this.roomService.createRoom({
        name: options.name,
        emptyTimeout: options.emptyTimeout || 300, // 5 minutes default
        maxParticipants: options.maxParticipants || 50,
      });
      return room;
    } catch (error) {
      console.error("Error creating LiveKit room:", error);
      throw error;
    }
  }

  /**
   * Generate an access token for a participant
   */
  async generateToken(options: LiveKitTokenOptions): Promise<string> {
    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: options.participantIdentity,
      name: options.participantName,
      metadata: options.metadata,
    });

    at.addGrant({
      roomJoin: true,
      room: options.roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    return await at.toJwt();
  }

  /**
   * Get room information
   */
  async getRoomInfo(roomName: string) {
    try {
      const rooms = await this.roomService.listRooms([roomName]);
      return rooms.length > 0 ? rooms[0] : null;
    } catch (error) {
      console.error("Error getting room info:", error);
      throw error;
    }
  }

  /**
   * List participants in a room
   */
  async listParticipants(roomName: string) {
    try {
      const participants = await this.roomService.listParticipants(roomName);
      return participants;
    } catch (error) {
      console.error("Error listing participants:", error);
      throw error;
    }
  }

  /**
   * End a room (disconnect all participants)
   */
  async endRoom(roomName: string) {
    try {
      await this.roomService.deleteRoom(roomName);
    } catch (error) {
      console.error("Error ending room:", error);
      throw error;
    }
  }

  /**
   * Remove a participant from a room
   */
  async removeParticipant(roomName: string, participantIdentity: string) {
    try {
      await this.roomService.removeParticipant(roomName, participantIdentity);
    } catch (error) {
      console.error("Error removing participant:", error);
      throw error;
    }
  }
}
