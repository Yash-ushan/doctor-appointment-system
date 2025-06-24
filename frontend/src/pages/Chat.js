import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Send, 
  ArrowLeft, 
  Phone, 
  Video,
  User,
  Clock
} from 'lucide-react';

const Chat = () => {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const { socket, joinChatRoom } = useSocket();
  const navigate = useNavigate();
  
  const [appointment, setAppointment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatRoomId = appointment?.chatRoomId;

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await axios.get(`/api/appointments/${appointmentId}`);
        const appointmentData = response.data.data;
        
        // Check if user has access to this chat
        const hasAccess = 
          appointmentData.patientId._id === user?.id ||
          appointmentData.doctorId.userId._id === user?.id;
          
        if (!hasAccess) {
          toast.error('You do not have access to this chat');
          navigate('/appointments');
          return;
        }

        // Check if appointment is for online consultation
        if (appointmentData.consultationType !== 'online') {
          toast.error('Chat is only available for online consultations');
          navigate('/appointments');
          return;
        }

        setAppointment(appointmentData);
      } catch (error) {
        console.error('Error fetching appointment:', error);
        toast.error('Failed to load chat');
        navigate('/appointments');
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId, user?.id, navigate]);

  useEffect(() => {
    if (chatRoomId && socket) {
      // Join chat room
      joinChatRoom(chatRoomId);
      
      // Listen for new messages
      socket.on('receive_message', (message) => {
        setMessages(prev => [...prev, message]);
      });

      return () => {
        socket.off('receive_message');
      };
    }
  }, [chatRoomId, socket, joinChatRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    const messageData = {
      room: chatRoomId,
      message: newMessage.trim(),
      sender: user?.id,
      senderRole: user?.role,
      timestamp: new Date()
    };

    try {
      setSending(true);
      
      // Add message to local state immediately
      setMessages(prev => [...prev, messageData]);
      
      // Send message via socket
      if (socket) {
        socket.emit('send_message', messageData);
      }
      
      // Save message to database (if API exists)
      try {
        await axios.post(`/api/chat/${appointmentId}/messages`, {
          message: newMessage.trim()
        });
      } catch (apiError) {
        console.log('Message saved locally but not to database');
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Chat not found</h2>
      </div>
    );
  }

  const otherUser = user?.role === 'patient' 
    ? appointment.doctorId?.userId 
    : appointment.patientId;

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col">
      {/* Chat Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/appointments')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <img
              src={otherUser?.avatar || 'https://via.placeholder.com/40'}
              alt={otherUser?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {user?.role === 'patient' ? `Dr. ${otherUser?.name}` : otherUser?.name}
              </h2>
              <p className="text-sm text-gray-600">
                {user?.role === 'patient' && `${appointment.doctorId?.specialization} • `}
                Online Consultation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-right text-sm text-gray-600">
              <p>{new Date(appointment.appointmentDate).toLocaleDateString()}</p>
              <p>{appointment.appointmentTime}</p>
            </div>
            
            {/* Video Call Button - Placeholder */}
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center space-x-2">
              <Video size={18} />
              <span>Video Call</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div className="space-y-4">
          {/* Welcome Message */}
          <div className="text-center">
            <div className="bg-blue-100 rounded-lg p-4 inline-block">
              <p className="text-blue-800 text-sm">
                Consultation started. You can now chat with{' '}
                {user?.role === 'patient' ? `Dr. ${otherUser?.name}` : otherUser?.name}
              </p>
            </div>
          </div>

          {/* Messages */}
          {messages.map((message, index) => {
            const isOwnMessage = message.sender === user?.id;
            
            return (
              <div
                key={index}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border'
                  }`}
                >
                  <p className="text-sm">{message.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={sending}
            />
          </div>
          
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send size={18} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;