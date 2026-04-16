"use client";

import { useEffect, useRef, useState } from "react";
import { connect, Room, Participant, RemoteParticipant, LocalParticipant } from "twilio-video";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Monitor,
  MessageSquare,
  Settings,
  Users
} from "lucide-react";

interface VideoCallProps {
  token: string;
  roomName: string;
  onLeaveCall: () => void;
  userName?: string;
}

interface ParticipantInfo {
  identity: string;
  videoTrack?: any;
  audioTrack?: any;
  isLocal: boolean;
}

export function VideoCall({ token, roomName, onLeaveCall, userName }: VideoCallProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideosRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    connectToRoom();
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [token, roomName]);

  const connectToRoom = async () => {
    try {
      setConnectionError(null);
      const connectedRoom = await connect(token, {
        name: roomName,
        audio: true,
        video: true,
      });

      setRoom(connectedRoom);
      setIsConnected(true);

      // Handle local participant
      handleParticipant(connectedRoom.localParticipant, true);

      // Handle existing participants
      connectedRoom.participants.forEach(participant => {
        handleParticipant(participant, false);
      });

      // Handle new participants
      connectedRoom.on('participantConnected', participant => {
        handleParticipant(participant, false);
      });

      connectedRoom.on('participantDisconnected', participant => {
        setParticipants(prev => prev.filter(p => p.identity !== participant.identity));
      });

      connectedRoom.on('disconnected', () => {
        setIsConnected(false);
        setParticipants([]);
      });

    } catch (error) {
      console.error('Failed to connect to room:', error);
      setConnectionError('Failed to connect to video call');
    }
  };

  const handleParticipant = (participant: LocalParticipant | RemoteParticipant, isLocal: boolean) => {
    const participantInfo: ParticipantInfo = {
      identity: participant.identity,
      isLocal,
    };

    // Handle video tracks
    participant.videoTracks.forEach(trackPublication => {
      if (trackPublication.track) {
        participantInfo.videoTrack = trackPublication.track;
        attachTrack(trackPublication.track, participant.identity, isLocal);
      }
    });

    // Handle audio tracks
    participant.audioTracks.forEach(trackPublication => {
      if (trackPublication.track) {
        participantInfo.audioTrack = trackPublication.track;
      }
    });

    setParticipants(prev => {
      const existing = prev.find(p => p.identity === participant.identity);
      if (existing) {
        return prev.map(p => p.identity === participant.identity ? participantInfo : p);
      }
      return [...prev, participantInfo];
    });

    // Listen for track subscriptions
    participant.on('trackSubscribed', (track) => {
      if (track.kind === 'video') {
        attachTrack(track, participant.identity, isLocal);
        setParticipants(prev =>
          prev.map(p =>
            p.identity === participant.identity
              ? { ...p, videoTrack: track }
              : p
          )
        );
      } else if (track.kind === 'audio') {
        setParticipants(prev =>
          prev.map(p =>
            p.identity === participant.identity
              ? { ...p, audioTrack: track }
              : p
          )
        );
      }
    });

    participant.on('trackUnsubscribed', (track) => {
      detachTrack(track, participant.identity);
      if (track.kind === 'video') {
        setParticipants(prev =>
          prev.map(p =>
            p.identity === participant.identity
              ? { ...p, videoTrack: undefined }
              : p
          )
        );
      }
    });
  };

  const attachTrack = (track: any, identity: string, isLocal: boolean) => {
    const container = isLocal ? localVideoRef.current : remoteVideosRef.current;
    if (container) {
      const videoElement = track.attach();
      videoElement.className = `w-full h-full object-cover rounded-lg ${isLocal ? 'scale-x-[-1]' : ''}`;
      container.appendChild(videoElement);
    }
  };

  const detachTrack = (track: any, identity: string) => {
    track.detach().forEach((element: HTMLElement) => {
      element.remove();
    });
  };

  const toggleVideo = () => {
    if (room) {
      room.localParticipant.videoTracks.forEach(trackPublication => {
        if (isVideoEnabled) {
          trackPublication.track.disable();
        } else {
          trackPublication.track.enable();
        }
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const toggleAudio = () => {
    if (room) {
      room.localParticipant.audioTracks.forEach(trackPublication => {
        if (isAudioEnabled) {
          trackPublication.track.disable();
        } else {
          trackPublication.track.enable();
        }
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      room?.localParticipant.videoTracks.forEach(trackPublication => {
        if (trackPublication.track.name === 'screen') {
          trackPublication.track.stop();
          room.localParticipant.unpublishTrack(trackPublication.track);
        }
      });
      setIsScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const screenTrack = stream.getVideoTracks()[0];

        room?.localParticipant.publishTrack(screenTrack, { name: 'screen' });
        setIsScreenSharing(true);

        screenTrack.onended = () => {
          setIsScreenSharing(false);
        };
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    }
  };

  const leaveCall = () => {
    if (room) {
      room.disconnect();
    }
    onLeaveCall();
  };

  if (connectionError) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{connectionError}</p>
            <Button onClick={connectToRoom} variant="outline">
              Retry Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Video className="h-6 w-6" />
          <div>
            <h2 className="text-lg font-semibold">Video Call</h2>
            <p className="text-sm text-gray-300">Room: {roomName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={isConnected ? "bg-green-600" : "bg-red-600"}>
            {isConnected ? "Connected" : "Connecting..."}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-gray-300">
            <Users className="h-4 w-4" />
            <span>{participants.length}</span>
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Remote Videos */}
        <div className="lg:col-span-2">
          <div
            ref={remoteVideosRef}
            className="bg-gray-800 rounded-lg h-full min-h-[400px] relative overflow-hidden"
          >
            {participants.filter(p => !p.isLocal && p.videoTrack).length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <VideoOff className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Waiting for other participants...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Local Video */}
        <div className="lg:col-span-1">
          <div
            ref={localVideoRef}
            className="bg-gray-800 rounded-lg h-full min-h-[200px] relative overflow-hidden"
          >
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-700">
                <VideoOff className="h-8 w-8" />
              </div>
            )}
          </div>
          <p className="text-white text-sm mt-2 text-center">
            {userName || 'You'}
            {!isAudioEnabled && <MicOff className="h-4 w-4 inline ml-2" />}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isVideoEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full w-12 h-12 p-0"
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isAudioEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full w-12 h-12 p-0"
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? "default" : "outline"}
            size="lg"
            onClick={toggleScreenShare}
            className="rounded-full w-12 h-12 p-0"
          >
            <Monitor className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="rounded-full w-12 h-12 p-0"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={leaveCall}
            className="rounded-full w-12 h-12 p-0 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}