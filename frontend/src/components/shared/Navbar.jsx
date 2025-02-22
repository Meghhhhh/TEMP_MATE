import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Avatar, AvatarImage } from "../ui/avatar";
import { LogOut, User2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { setUser } from "@/redux/authSlice";
import { toast } from "sonner";
import Cookies from "js-cookie";
const Navbar = () => {
  const { user } = useSelector((store) => store.auth);
  const token = Cookies.get("token");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      const res = await axios.get(`${USER_API_END_POINT}/logout`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`, // Send token in Authorization header
        },
      });
      if (res.data.success) {
        dispatch(setUser(null));
        navigate("/");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="bg-white/20 backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between mx-auto max-w-7xl h-16 px-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Job<span className="text-[#F83002]">Portal</span>
          </h1>
        </div>
        <div className="flex items-center gap-12">
          <ul className="flex font-medium items-center gap-5 text-white">
            {user && user.role === "recruiter" ? (
              <>
                <li className="relative pb-2 group">
                  <Link
                    to="/admin/companies"
                    className="hover:text-[#F83002] transition duration-200"
                  >
                    Companies
                  </Link>
                  <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-2 h-2  rounded-full scale-0 transition-transform duration-300 group-hover:scale-100"></span>
                </li>
                <li className="relative pb-2 group">
                  <Link to="/admin/jobs" className=" transition duration-200">
                    Jobs
                  </Link>
                  <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-2 h-2 bg-white rounded-full scale-0 transition-transform duration-300 group-hover:scale-100"></span>
                </li>
              </>
            ) : (
              <>
                <li className="relative pb-2 group">
                  <Link to="/" className=" transition duration-200">
                    Home
                  </Link>
                  <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-2 h-2 bg-white rounded-full scale-0 transition-transform duration-300 group-hover:scale-100"></span>
                </li>
                <li className="relative pb-2 group">
                  <Link to="/jobs" className="transition duration-200">
                    Jobs
                  </Link>
                  <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-2 h-2 bg-white rounded-full scale-0 transition-transform duration-300 group-hover:scale-100"></span>
                </li>
                <li className="relative pb-2 group">
                  <Link to="/browse" className="transition duration-200">
                    Browse
                  </Link>
                  <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-2 h-2 bg-white rounded-full scale-0 transition-transform duration-300 group-hover:scale-100"></span>
                </li>
              </>
            )}

            {user && user.role !== "recruiter" && (
              <li className="relative pb-2 group">
                <Link to="/resume" className="">
                  Create-Resume
                </Link>
                <span className="absolute left-1/2 transform -translate-x-1/2 bottom-0 w-2 h-2 bg-white rounded-full scale-0 transition-transform duration-300 group-hover:scale-100"></span>
              </li>
            )}
          </ul>

          {!user ? (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-gray-200 hover:text-black"
                >
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white">
                  Signup
                </Button>
              </Link>
            </div>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Avatar className="cursor-pointer border-2 border-white">
                  <AvatarImage
                    src={user?.profile?.profilePhoto}
                    alt="@shadcn"
                  />
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-white rounded-lg shadow-lg p-4">
                <div className="flex flex-col">
                  <div className="flex gap-2 items-center mb-4">
                    <Avatar className="cursor-pointer border-2 border-gray-300">
                      <AvatarImage
                        src={user?.profile?.profilePhoto}
                        alt="@shadcn"
                      />
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {user?.fullname}
                      </h4>
                    </div>
                  </div>
                  <div className="flex flex-col text-gray-600">
                    {user && user.role === "student" && (
                      <div className="flex items-center gap-2 cursor-pointer hover:text-[#6A38C2] transition duration-200">
                        <User2 />
                        <Button
                          variant="link"
                          className="text-gray-600 hover:text-[#6A38C2]"
                        >
                          <Link to="/profile">View Profile</Link>
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 cursor-pointer  transition duration-200">
                      <LogOut />
                      <Button
                        onClick={logoutHandler}
                        variant="link"
                        className="text-gray-600 "
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
