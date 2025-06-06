import React, { useState, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Users, MessageSquare, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const LiveStream: React.FC = () => {
  const { darkMode } = useTheme();
  const { user, userProfile } = useAuth();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [viewers, setViewers] = useState(0);
  const [streamTitle, setStreamTitle] = useState('');
  const [gameCategory, setGameCategory] = useState('');

  // ZegoCloud integration will be implemented here
  const initializeZegoCloud = () => {
    // TODO: Initialize ZegoCloud SDK
    // This is where you'll integrate the ZegoCloud API
    console.log('Initializing ZegoCloud...');
  };

  useEffect(() => {
    initializeZegoCloud();
  }, []);

  const startStream = () => {
    if (!streamTitle.trim()) {
      alert('Please enter a stream title');
      return;
    }
    
    // TODO: Start ZegoCloud stream
    setIsStreaming(true);
    setViewers(Math.floor(Math.random() * 50) + 1); // Demo viewer count
  };

  const stopStream = () => {
    // TODO: Stop ZegoCloud stream
    setIsStreaming(false);
    setViewers(0);
  };

  const toggleCamera = () => {
    // TODO: Toggle camera in ZegoCloud
    setIsCameraOn(!isCameraOn);
  };

  const toggleMic = () => {
    // TODO: Toggle microphone in ZegoCloud
    setIsMicOn(!isMicOn);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className={`rounded-xl shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'} mb-6`}>
        <div className="p-6 border-b dark:border-gray-700 border-gray-200">
          <h1 className="text-2xl font-bold flex items-center">
            <Video size={28} className="mr-3 text-purple-500" />
            Live Stream
          </h1>
        </div>

        <div className="p-6">
          {!isStreaming ? (
            // Stream Setup
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Stream Title
                </label>
                <input
                  type="text"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  placeholder="Enter your stream title..."
                  className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Game Category
                </label>
                <select
                  value={gameCategory}
                  onChange={(e) => setGameCategory(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <option value="">Select a game...</option>
                  <option value="valorant">Valorant</option>
                  <option value="cs2">Counter-Strike 2</option>
                  <option value="leagueoflegends">League of Legends</option>
                  <option value="fortnite">Fortnite</option>
                  <option value="minecraft">Minecraft</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleCamera}
                  className={`p-3 rounded-full ${
                    isCameraOn 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white transition`}
                >
                  {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
                </button>

                <button
                  onClick={toggleMic}
                  className={`p-3 rounded-full ${
                    isMicOn 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white transition`}
                >
                  {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                </button>

                <button className="p-3 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition">
                  <Settings size={20} />
                </button>
              </div>

              <button
                onClick={startStream}
                className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition"
              >
                Start Live Stream
              </button>
            </div>
          ) : (
            // Live Stream Interface
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-500 font-medium">LIVE</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users size={16} />
                    <span>{viewers} viewers</span>
                  </div>
                </div>

                <button
                  onClick={stopStream}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition"
                >
                  End Stream
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video Stream Area */}
                <div className="lg:col-span-2">
                  <div className={`aspect-video rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center`}>
                    {/* ZegoCloud video component will be rendered here */}
                    <div className="text-center">
                      <Video size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">Stream video will appear here</p>
                      <p className="text-sm text-gray-400 mt-2">
                        ZegoCloud integration: Video stream component
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h2 className="text-xl font-bold">{streamTitle}</h2>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center">
                          {userProfile?.photoURL ? (
                            <img src={userProfile.photoURL} alt="Streamer" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white text-sm">{userProfile?.username?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="font-medium">{userProfile?.displayName}</span>
                      </div>
                      {gameCategory && (
                        <span className={`px-2 py-1 rounded-full text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          {gameCategory}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chat Area */}
                <div className={`rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-4`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium flex items-center">
                      <MessageSquare size={16} className="mr-2" />
                      Live Chat
                    </h3>
                  </div>

                  <div className="space-y-3 h-64 overflow-y-auto mb-4">
                    {/* Sample chat messages */}
                    <div className="text-sm">
                      <span className="font-medium text-purple-500">viewer1:</span>
                      <span className="ml-2">Great stream!</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-blue-500">gamer123:</span>
                      <span className="ml-2">What's your rank?</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-green-500">pro_player:</span>
                      <span className="ml-2">Nice play!</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className={`flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'
                      }`}
                    />
                    <button className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm transition">
                      Send
                    </button>
                  </div>
                </div>
              </div>

              {/* Stream Controls */}
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={toggleCamera}
                  className={`p-3 rounded-full ${
                    isCameraOn 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white transition`}
                >
                  {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
                </button>

                <button
                  onClick={toggleMic}
                  className={`p-3 rounded-full ${
                    isMicOn 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white transition`}
                >
                  {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                </button>

                <button className="p-3 rounded-full bg-gray-500 hover:bg-gray-600 text-white transition">
                  <Settings size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ZegoCloud Integration Instructions */}
      <div className={`rounded-xl shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">ZegoCloud Integration</h2>
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className="text-sm mb-2">
              To complete the live streaming functionality, you need to:
            </p>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Sign up at <a href="https://www.zegocloud.com/" target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">zegocloud.com</a></li>
              <li>Get your App ID and App Sign from the ZegoCloud console</li>
              <li>Install the ZegoCloud SDK: <code className="bg-gray-600 px-2 py-1 rounded text-xs">npm install zego-express-engine-webrtc</code></li>
              <li>Initialize the SDK in the <code>initializeZegoCloud</code> function</li>
              <li>Implement the stream start/stop, camera, and microphone controls</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStream;