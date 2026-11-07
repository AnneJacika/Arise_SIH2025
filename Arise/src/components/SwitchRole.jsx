import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SwitchRole() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const { userProfile, setUserProfile } = useAuth();
  const roles = userProfile?.roles || [];
  const currentRole = userProfile?.userType;

  function handleSwitch(role) {
    setShow(false);
    // Update userProfile in context so the app knows the new role
    if (setUserProfile && userProfile) {
      setUserProfile({ ...userProfile, userType: role });
    }
    if (role === 'school') navigate('/dashboard/school');
    else if (role === 'staff' || role === 'teacher') navigate('/dashboard/staff');
    else if (role === 'student') navigate('/dashboard/student');
    else navigate('/dashboard');
  }

  if (!roles || roles.length < 2) return null;

  return (
    <div className="inline-block ml-2" style={{ position: 'relative', zIndex: 50 }}>
      <button onClick={() => setShow(s => !s)} className="px-3 py-1 bg-gray-200 rounded text-sm">Switch Role</button>
      {show && createPortal(
        <div style={{ position: 'fixed', zIndex: 9999, left: 0, top: 0, width: '100vw', height: '100vh', pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '90px',
              transform: 'translateX(-50%)',
              zIndex: 10000,
              pointerEvents: 'auto',
              minWidth: 180
            }}
            className="bg-white border rounded shadow p-2 mt-2"
          >
            <div className="mb-2 text-xs text-gray-500">Switch to:</div>
            {roles.filter(r => r !== currentRole).map(role => (
              <button key={role} onClick={() => handleSwitch(role)} className="block w-full text-left px-2 py-1 hover:bg-blue-100 rounded">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}