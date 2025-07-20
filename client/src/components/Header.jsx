import { use } from "react";
import { Link, Links, NavLink } from "react-router-dom";

const user = JSON.parse(sessionStorage.getItem("user"));
const hoverStyle =
  "hover:bg-blue-500 rounded-full px-3 py-1 hover:text-white transition-colors duration-200 text-gray-700 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 focus:ring-offset-2 focus:bg-blue-500 focus:text-white ";

const Header = () => {
  return (
    <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <Link to="/" className={`text-xl font-bold text-blue-600 `}>
        MyApp
      </Link>
      <nav className="flex items-center space-x-6">
        <Link to="/" className={`${hoverStyle}`}>
          Home
        </Link>
        <Link to="/call" className={`${hoverStyle}`}>
          Call
        </Link>
        <Link to="/zoom" className={`${hoverStyle}`}>
          Zoom
        </Link>
        <Link to="/allusers" className={` ${hoverStyle}`}>
          All Users
        </Link>
        {user ? (
          <span
            to="/login"
            className={`${hoverStyle}`}
            onClick={() => {
              sessionStorage.removeItem("user");
              window.location.href = "/login";
            }}
          >
            Logout
          </span>
        ) : (
          <Link to="/login" className={`${hoverStyle}`}>
            Login
          </Link>
        )}
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <img
            src={user?.avatar}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
      </nav>
    </header>
  );
};

export default Header;
