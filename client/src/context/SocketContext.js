import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to socket server
    const socket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinStudentRoom = (studentId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_student', studentId);
    }
  };

  const leaveStudentRoom = (studentId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_student', studentId);
    }
  };

  const onAttendanceUpdate = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('attendance_updated', callback);
    }
  };

  const onMarksUpdate = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('marks_updated', callback);
    }
  };

  const onAssignmentCreated = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('assignment_created', callback);
    }
  };

  const onAnnouncementPosted = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('announcement_posted', callback);
    }
  };

  const onMaterialUploaded = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('material_uploaded', callback);
    }
  };

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      joinStudentRoom,
      leaveStudentRoom,
      onAttendanceUpdate,
      onMarksUpdate,
      onAssignmentCreated,
      onAnnouncementPosted,
      onMaterialUploaded
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
