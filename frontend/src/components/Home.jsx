import React, { useEffect } from "react";
// import { toast } from "react-hot-toast";
import { toast } from "sonner";
import Navbar from "./shared/Navbar";
import HeroSection from "./HeroSection";
import CategoryCarousel from "./CategoryCarousel";
import LatestJobs from "./LatestJobs";
import Footer from "./shared/Footer";

import useGetAllJobs from "@/hooks/useGetAllJobs";

import { Button } from "./ui/button";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { setAllAppliedJobs } from '@/redux/jobSlice';
import { useNavigate } from "react-router-dom";
import RecommendedJobs from "./RecommendedJobs";
import img1 from "../assets/Home.png"; //

const Home = () => {
  useGetAllJobs();
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.role === 'recruiter') {
      navigate('/admin/companies');
    }
  }, []);

  const handleAutoApply = async () => {
    try {
      const response = await axios.post(
        `${APPLICATION_API_END_POINT}/autoApplyForJobs`,
        {},
        {
          withCredentials: true,
        },
      );

      console.log('Auto Apply Response:', response.data);
      dispatch(setAllAppliedJobs(response.data.application));
      toast.success("Successfully applied to jobs!");
    } catch (error) {
      console.error('Error auto-applying:', error);
      toast.error(error.response?.data?.message || "Failed to auto-apply.");
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${img1})` }}
      >
        <div className="absolute inset-0 bg-black/0"></div> {/* Dark Overlay */}
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <CategoryCarousel />

        {/* Centered Buttons */}
        <div className="flex justify-center my-10">
          
          <Button
            className="buttonContainer bg-white/10 backdrop-blur-md text-white hover mx-3 rounded-3xl"
            variant="outline"
            size="lg"
            onClick={handleAutoApply}
          >
            Auto apply for jobs
          </Button>
        </div>

        <LatestJobs />
        <RecommendedJobs />
        <Footer />
      </div>
    </div>
  );
};

export default Home;
