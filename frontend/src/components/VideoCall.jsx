import { useRef, useEffect, useState } from 'react';
import Button from './Button';

const VideoCall = ({ 
  onVideoReady, 
  onScreenShareReady, 
  questions = [],
  onQuestionComplete,
  currentQuestionIndex = 0 
}) => {
  const videoRef = useRef(null);
  const screenShareRef = useRef(null);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [stream, setStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);

  useEffect(() => {
    return () => {
      // Cleanup streams on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream, screenStream]);

  const startVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsVideoOn(true);
        setIsAudioOn(true);
        if (onVideoReady) onVideoReady(mediaStream);
      }
    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
      alert('Unable to access camera/microphone. Please check permissions.');
    }
  };

  const stopVideo = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setStream(null);
      setIsVideoOn(false);
      setIsAudioOn(false);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioOn(!isAudioOn);
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      if (screenShareRef.current) {
        screenShareRef.current.srcObject = screenStream;
        setScreenStream(screenStream);
        setIsScreenSharing(true);
        if (onScreenShareReady) onScreenShareReady(screenStream);

        // Stop screen share when user clicks stop sharing in browser
        screenStream.getVideoTracks()[0].addEventListener('ended', () => {
          stopScreenShare();
        });
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
      if (error.name !== 'NotAllowedError') {
        alert('Unable to share screen. Please check permissions.');
      }
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      if (screenShareRef.current) {
        screenShareRef.current.srcObject = null;
      }
      setScreenStream(null);
      setIsScreenSharing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* User Video */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-64 object-cover"
        />
        {!isVideoOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center text-white">
              <svg
                className="w-16 h-16 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p>Camera Off</p>
            </div>
          </div>
        )}
      </div>

      {/* Screen Share */}
      {isScreenSharing && (
        <div className="relative bg-gray-900 rounded-lg overflow-hidden border-2 border-blue-500">
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-sm z-10">
            Screen Sharing
          </div>
          <video
            ref={screenShareRef}
            autoPlay
            playsInline
            className="w-full h-64 object-contain"
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-4 flex-wrap">
        {!isVideoOn ? (
          <Button onClick={startVideo} variant="primary">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Start Video
            </span>
          </Button>
        ) : (
          <>
            <Button onClick={stopVideo} variant="danger">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Stop Video
              </span>
            </Button>
            <Button
              onClick={toggleAudio}
              variant={isAudioOn ? 'primary' : 'secondary'}
            >
              <span className="flex items-center gap-2">
                {isAudioOn ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                )}
                {isAudioOn ? 'Mute' : 'Unmute'}
              </span>
            </Button>
          </>
        )}

        {!isScreenSharing ? (
          <Button onClick={startScreenShare} variant="secondary">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Share Screen
            </span>
          </Button>
        ) : (
          <Button onClick={stopScreenShare} variant="danger">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Stop Sharing
            </span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
