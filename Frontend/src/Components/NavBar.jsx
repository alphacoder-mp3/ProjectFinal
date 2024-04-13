import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom"; 
import { FaHome, FaUser, FaBell,FaPowerOff } from "react-icons/fa";
import "../Components/NavBar.css";
import { CiSearch } from "react-icons/ci";
import ApiService from '../Components/ApiServer/ApiServer.jsx';

const NavBar = ({ isAdmin }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notificationListOpen, setNotificationListOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();
  const navigate = useNavigate(); 

  const isRestrictedPage =
    location.pathname === "/" ||
    location.pathname === "/register" ||
    location.pathname === "/admin" ||
    location.pathname === "/AdminRegister" ||
    location.pathname === "/admin/AdminForgot" ||
    location.pathname === "/user/UserForgot";

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchResultClick = async (rollNumber) => {
    try {
      if (typeof rollNumber !== 'undefined') {
        // Close the search results display
        setSearchResults([]);
        // Redirect the user to UserProfile with the selected user's data
        navigate(`/user/${rollNumber}`);
      } else {
        console.error('Invalid roll number:', rollNumber);
      }
    } catch (error) {
      console.error('Error sending roll number to backend:', error);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const response = await ApiService.getNotificationCount();
        const Count = response.count
      setUnreadNotifications(Count);

      const notificationData = response.notification;
      setNotifications(notificationData);

    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await ApiService.markNotificationAsRead(notificationId);
      // Refetch notifications after marking as read
      fetchNotifications();
      // Update unread notification count
      setUnreadNotifications(unreadNotifications - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const notificationsData = await ApiService.getNotifications();
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await ApiService.markAllNotificationsAsRead();
      setUnreadNotifications(0);
      //setNotifications([]);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  useEffect(() => {
    fetchNotificationCount();
    const intervalId = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        if (searchQuery.trim() !== "") {
          const results = await ApiService.searchData(searchQuery);
          setSearchResults(results);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      setSearchQuery("");
    };
  }, []);

  useEffect(() => {
    if (isAdmin) {
      setSearchQuery("");
    }
  }, [isAdmin]);

  const handleLogout = () => {
    localStorage.clear();
    setUnreadNotifications(0)
    navigate("/");
  };

  const handleNotificationButtonClick = () => {
    setNotificationListOpen(!notificationListOpen);
    if (notificationListOpen) {
      // Fetch notifications when opening the list
      fetchNotifications();
    }
  };


  return (
    <div>
      <nav>
        <div className="logo">
          <div className="spinner"></div>Logo
        </div>
        <div className="menu" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {isAdmin && !isRestrictedPage && (
          <div className="con-btn">
            <div className="search">
              <input
                type="search"
                placeholder="Search here"
                value={searchQuery}
                onChange={handleInputChange}
              />
              <CiSearch color="white" fontSize="2.6rem" />
              {searchResults.length > 0 && (
                <ul className="search-results">
                  {searchResults.map((result, index) => (
                    <li key={index} onClick={() => handleSearchResultClick(result.rollNumber)}>
                      {result.username}
                      <br/>
                      {result.rollNumber}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="createPost">
              <Link to="AdminPostCreation" className="navbtn">
                Create
              </Link>
            </div>
          </div>
        )}
        {location.pathname === "/" && (
          <Link to="/admin" className="navbtn">
            Admin
          </Link>
        )}

        <ul className={menuOpen ? "open" : ""}>
          {!isRestrictedPage && (
            <li>
              <NavLink to="/Feed">
                <FaHome /> 
              </NavLink>
            </li>
          )}
          {!isAdmin && !isRestrictedPage && (
          // {!isRestrictedPage && (
            <li>
              <div className="nav-icon-notification" onClick={handleNotificationButtonClick}>
                <FaBell />
                {unreadNotifications > 0 && <span className="notification-badge">{unreadNotifications}</span>}
              </div>
              {notificationListOpen && (
                <div className="notification-list">
                  <button onClick={markAllNotificationsAsRead}>Mark All as Read</button>
                  {notifications.map((notification, index) => (
                    <div key={index} className="notification-item">
                      {notification.content}
                    </div>
                  ))}
                </div>
              )}
            </li>
          )}


          {!isRestrictedPage && (
            <li>
              <Link to="/profile" className="navbtn">
                <FaUser />
              </Link>
            </li>
          )}
          {!isRestrictedPage && (
            <li>
              <Link to="/" onClick={handleLogout}>
                <FaPowerOff>
                  LogOut
                </FaPowerOff>
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default NavBar;