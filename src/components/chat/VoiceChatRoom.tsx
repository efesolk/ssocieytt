import React, { useEffect } from 'react';
import { generateRoomId } from '../../lib/utils';
import { User } from '../../types';

interface VoiceChatRoomProps {
  currentUser: User;
  otherUser: User;
}

declare global {
  interface Window {
    ZegoUIKitPrebuilt: any;
  }
}

export const VoiceChatRoom: React.FC<VoiceChatRoomProps> = ({
  currentUser,
  otherUser,
}) => {
  useEffect(() => {
    const roomID = generateRoomId(currentUser.uid, otherUser.uid);
    const userID = currentUser.uid;
    const userName = currentUser.displayName;
    const appID = 1365197576;
    const serverSecret = "01698918fda5852de1bcb9e058228dc5";
    
    // Load ZegoUIKitPrebuilt script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@zegocloud/zego-uikit-prebuilt/zego-uikit-prebuilt.js';
    script.async = true;
    
    script.onload = () => {
      const kitToken = window.ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        userID,
        userName
      );
      
      const zp = window.ZegoUIKitPrebuilt.create(kitToken);
      
      zp.joinRoom({
        container: document.querySelector('#voice-chat-container'),
        sharedLinks: [{
          name: 'Personal link',
          url: window.location.href,
        }],
        scenario: {
          mode: window.ZegoUIKitPrebuilt.VideoConference,
        },
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: false,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: true,
        showTextChat: true,
        showUserList: true,
        maxUsers: 2,
        layout: "Auto",
        showLayoutButton: false,
      });
    };
    
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, [currentUser, otherUser]);
  
  return (
    <div
      id="voice-chat-container"
      className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden"
    />
  );
};