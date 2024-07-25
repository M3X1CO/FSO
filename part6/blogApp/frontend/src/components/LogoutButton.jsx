import React from 'react'

const LogoutButton = ({ onLogout }) => {
  return (
    <button
        onClick={onLogout} 
        data-testid="logout-button">
        Log out
    </button>
  )
}

export default LogoutButton
