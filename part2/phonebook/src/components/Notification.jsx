const Notification = ({ successMessage, errorMessage }) => {
    return (
      <div>
        {successMessage && (
          <div className="success">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="error">
            {errorMessage}
          </div>
        )}
      </div>
    );
  };
  
export default Notification