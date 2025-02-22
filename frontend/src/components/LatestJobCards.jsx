import React, { useState } from "react";
import Tilt from "react-parallax-tilt";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";

const LatestJobCards = ({ job }) => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} glareEnable glareMaxOpacity={0.2} transitionSpeed={500}>
      <div
        onClick={() => navigate(`/description/${job._id}`)}
        onMouseMove={handleMouseMove}
        className="card"
      >
        {/* Grid Overlay */}
        <div
          className="grid-overlay"
          style={{ backgroundPosition: `${mousePos.x}% ${mousePos.y}%` }}
        ></div>

        {/* Job Details */}
        <div>
          <h1 className="text-lg font-semibold text-white">{job?.company?.name}</h1>
          <p className="text-sm text-gray-300">India</p>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white my-2">{job?.title}</h1>
          <p className="text-sm text-gray-300">{job?.description}</p>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Badge className="text-blue-500 font-bold bg-blue-500/20">{job?.position} Positions</Badge>
          <Badge className="text-red-500 font-bold bg-red-500/20">{job?.jobType}</Badge>
          <Badge className="text-purple-500 font-bold bg-purple-500/20">{job?.salary} LPA</Badge>
        </div>
      </div>
    </Tilt>
  );
};

export default LatestJobCards;
