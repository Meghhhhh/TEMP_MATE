import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import TestPage from "./Test";
import CameraScreen from "./MockInterview/CameraScreen";
import img1 from "../assets/Home.png";
import Navbar from "./shared/Navbar";
import Footer from "./shared/Footer";

const CombinedMock = () => {
  const location = useLocation();
  const questionList = location.state?.questions?.result || location.state?.questions || [];
  const [transcribedText, setTranscribedText] = useState("");

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${img1})` }}
      >
        <div className="absolute inset-0 bg-black/0"></div> {/* Dark Overlay */}
      </div>

      {/* Navbar (Full Width) */}
      <div className="relative z-20 w-full">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Title */}
        <h1 className="text-3xl font-semibold text-white mt-6">Mock Interview</h1>

        <div className="flex w-full max-w-6xl min-h-[80vh] mt-6">
          {/* Test Page */}
          <div className="w-1/2 p-4">
            <TestPage questions={questionList} transcribedText={transcribedText} />
          </div>

          {/* Fading Divider */}
          <div className="w-[2px] bg-gradient-to-b from-gray-300 via-transparent to-gray-300 opacity-50"></div>

          {/* Camera Screen */}
          <div className="w-1/2 p-4">
            <CameraScreen setTranscribedText={setTranscribedText} />
          </div>
        </div>
      </div>

      {/* Footer (Optional) */}
      <div className="relative z-20 w-full mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default CombinedMock;
