import { Link } from "react-router-dom";

const user = JSON.parse(sessionStorage.getItem("user"));
const Header = () => {

  return (
    <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-blue-600">
        MyApp
      </Link>
      <nav className="flex items-center space-x-6">
        <Link to="/" className="text-gray-700 hover:text-blue-600">
          Home
        </Link>
        <Link to="/profile" className="text-gray-700 hover:text-blue-600">
          Profile
        </Link>
        <Link to="/allusers" className="text-gray-700 hover:text-blue-600">
          All Users
        </Link>
        <Link to="/login" className="text-gray-700 hover:text-blue-600">
          Login
        </Link>
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
