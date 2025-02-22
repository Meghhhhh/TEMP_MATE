import React from "react";
import Tilt from "react-parallax-tilt";
import { Button } from "./ui/button";
import { Bookmark } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";

const Job = ({ job }) => {
  const navigate = useNavigate();

  const daysAgoFunction = (mongodbTime) => {
    const createdAt = new Date(mongodbTime);
    const currentTime = new Date();
    const timeDifference = currentTime - createdAt;
    return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
  };

  return (
    <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable={true} glareMaxOpacity={0.3} glareBorderRadius="12px">
      <div className="p-6 rounded-2xl shadow-lg border border-white/20 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-xl transition-all hover:shadow-xl">
        
        {/* Job Posted Time & Bookmark */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-300">
            {daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}
          </p>
          <Button variant="outline" className="rounded-full text-gray-200 hover:text-white border border-gray-400 hover:border-white transition-all" size="icon">
            <Bookmark />
          </Button>
        </div>

        {/* Company Logo & Name */}
        <div className="flex items-center gap-3 my-3">
          <Button className="p-6 rounded-full bg-white/30 shadow-md border border-white/20 hover:bg-white/40 transition-all" variant="outline" size="icon">
            <Avatar className="shadow-md">
              <AvatarImage src={job?.company?.logo} className="rounded-full" />
            </Avatar>
          </Button>
          <div>
            <h1 className="font-semibold text-lg text-gray-100">{job?.company?.name}</h1>
            <p className="text-sm text-gray-400">India</p>
          </div>
        </div>

        {/* Job Title & Description */}
        <div>
          <h1 className="font-extrabold text-xl text-white my-2">{job?.title}</h1>
          <p className="text-sm text-gray-300">{job?.description}</p>
        </div>

        {/* Job Details Badges */}
        <div className="flex items-center gap-2 mt-4">
          <Badge className="text-blue-200 font-semibold bg-blue-500/20 px-2 py-1" variant="ghost">
            {job?.position} Positions
          </Badge>
          <Badge className="text-red-200 font-semibold bg-red-500/20 px-2 py-1" variant="ghost">
            {job?.jobType}
          </Badge>
          <Badge className="text-purple-200 font-semibold bg-purple-500/20 px-2 py-1" variant="ghost">
            {job?.salary} LPA
          </Badge>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4 mt-4">
          <Button
            onClick={() => navigate(`/description/${job?._id}`)}
            variant="outline"
            className="border border-gray-400 text-gray-300 hover:text-white hover:border-white transition-all"
          >
            Details
          </Button>
          <Button className="bg-[#7209b7] text-white shadow-md hover:bg-[#5b30a6] transition-all">
            Save For Later
          </Button>
        </div>
      </div>
    </Tilt>
  );
};

export default Job;
