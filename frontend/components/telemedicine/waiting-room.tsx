"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, Mic, MicOff, VideoOff, Settings, CheckCircle, AlertCircle } from "lucide-react";

interface WaitingRoomProps {
  appointmentId: string;
  doctorName?: string;
  patientName?: string;
  onJoinCall: () => void;
  isLoading?: boolean;
}

export function WaitingRoom({
  appointmentId,
  doctorName,
  patientName,
  onJoinCall,
  isLoading = false
}: WaitingRoomProps) {
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMic, setSelectedMic] = useState<string>("");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceCheckComplete, setDeviceCheckComplete] = useState(false);
  const [deviceCheckPassed, setDeviceCheckPassed] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    checkDevices();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (cameraEnabled && selectedCamera) {
      startPreview();
    } else {
      stopPreview();
    }
  }, [cameraEnabled, selectedCamera]);

  const checkDevices = async () => {
    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      setDevices(deviceList);

      const cameras = deviceList.filter(device => device.kind === 'videoinput');
      const mics = deviceList.filter(device => device.kind === 'audioinput');

      if (cameras.length > 0) {
        setSelectedCamera(cameras[0].deviceId);
      }
      if (mics.length > 0) {
        setSelectedMic(mics[0].deviceId);
      }

      setDeviceCheckComplete(true);
      setDeviceCheckPassed(cameras.length > 0 && mics.length > 0);
    } catch (error) {
      console.error('Error checking devices:', error);
      setDeviceCheckComplete(true);
      setDeviceCheckPassed(false);
    }
  };

  const startPreview = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: cameraEnabled ? { deviceId: selectedCamera ? { exact: selectedCamera } : undefined } : false,
        audio: micEnabled ? { deviceId: selectedMic ? { exact: selectedMic } : undefined } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error starting preview:', error);
    }
  };

  const stopPreview = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = () => {
    setCameraEnabled(!cameraEnabled);
  };

  const toggleMic = () => {
    setMicEnabled(!micEnabled);
  };

  const cameras = devices.filter(device => device.kind === 'videoinput');
  const microphones = devices.filter(device => device.kind === 'audioinput');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <Video className="h-5 w-5" />
            Waiting Room - Session #{appointmentId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Video Preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Camera Preview</h3>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!cameraEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <VideoOff className="h-12 w-12 text-gray-500" />
                  </div>
                )}
              </div>

              {/* Device Controls */}
              <div className="flex gap-2">
                <Button
                  variant={cameraEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={toggleCamera}
                  className={cameraEnabled ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {cameraEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant={micEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={toggleMic}
                  className={micEnabled ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Session Info & Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Session Details</h3>

              <div className="space-y-3">
                {doctorName && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-medium">Doctor:</span>
                    <span>{doctorName}</span>
                  </div>
                )}
                {patientName && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-medium">Patient:</span>
                    <span>{patientName}</span>
                  </div>
                )}
              </div>

              {/* Device Selection */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Device Settings
                </h4>

                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Camera</label>
                    <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select camera" />
                      </SelectTrigger>
                      <SelectContent>
                        {cameras.map((camera) => (
                          <SelectItem key={camera.deviceId} value={camera.deviceId}>
                            {camera.label || `Camera ${camera.deviceId.slice(0, 8)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Microphone</label>
                    <Select value={selectedMic} onValueChange={setSelectedMic}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select microphone" />
                      </SelectTrigger>
                      <SelectContent>
                        {microphones.map((mic) => (
                          <SelectItem key={mic.deviceId} value={mic.deviceId}>
                            {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Device Check Status */}
              {deviceCheckComplete && (
                <div className="flex items-center gap-2">
                  {deviceCheckPassed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`text-sm ${deviceCheckPassed ? 'text-green-700' : 'text-red-700'}`}>
                    {deviceCheckPassed ? 'Devices ready' : 'Device check failed'}
                  </span>
                </div>
              )}

              {/* Join Button */}
              <Button
                onClick={onJoinCall}
                disabled={isLoading || !deviceCheckComplete}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                {isLoading ? "Joining..." : "Join Video Call"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}