import { setRecommendedJobs } from "@/redux/jobSlice";
import { JOB_API_END_POINT } from "@/utils/constant";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
const useGetRecommendedJobs = () => {
  const token = Cookies.get("token");
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/recommend`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`, // Send token in Authorization header
          },
        });
        console.log(res);

        if (res.data.success) {
          const recommendedJobs = res.data.collaborativeFiltering.concat(
            res.data.contentBasedFiltering
          );
          dispatch(setRecommendedJobs(recommendedJobs));
        }
      } catch (error) {
        console.error("Error fetching recommended jobs:", error);
      }
    };

    fetchRecommendedJobs();
  }, [dispatch]); // Dependency on dispatch
};

export default useGetRecommendedJobs;
