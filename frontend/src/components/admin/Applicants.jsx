import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import ApplicantsTable from "./ApplicantsTable";
import axios from "axios";
import {
  APPLICATION_API_END_POINT,
  PYTHON_API_END_POINT,
  RESUME_API_END_POINT,
} from "@/utils/constant";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAllApplicants } from "@/redux/applicationSlice";
import Cookies from "js-cookie";
const Applicants = () => {
  const params = useParams();
  const dispatch = useDispatch();
  const { applicants } = useSelector((store) => store.application);
  const [sortedApplicants, setSortedApplicants] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = Cookies.get("token");
  useEffect(() => {
    const fetchAllApplicants = async () => {
      try {
        const res = await axios.get(
          `${APPLICATION_API_END_POINT}/${params.id}/applicants`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`, // Send token in Authorization header
            },
          }
        );

        dispatch(setAllApplicants(res.data.job));
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllApplicants();
  }, []);

  const sortWithAI = async () => {
    if (!applicants) return;

    setLoading(true);
    try {
      // Extract job description
      const jobDescription = applicants.description;

      // Fetch resume details for each applicant
      const candidates = await Promise.all(
        applicants.applications.map(async (app) => {
          try {
            const resumeRes = await axios.post(
              // Change from GET to POST
              `${RESUME_API_END_POINT}/get-details`, // Ensure backend supports POST
              { userId: app.applicant._id }, // Send userId in request body
              {
                withCredentials: true,
                headers: {
                  Authorization: `Bearer ${token}`, // Send token in Authorization header
                },
              } // Include credentials if needed
            );
            const resume = resumeRes.data;
            console.log({
              user_id: app.applicant._id,
              experience:
                resume?.experience?.join(", ") || "No experience mentioned",
              skills:
                resume?.skills?.map((s) => s.name).join(", ") ||
                "No skills listed",
              summary: resume?.summary,
              projects: resume?.projects?.map((p) => p.name) || [
                "No projects mentioned",
              ],
            });

            return {
              user_id: app.applicant._id,
              experience:
                resume?.experience?.join(", ") || "No experience mentioned",
              skills:
                resume?.skills?.map((s) => s.name).join(", ") ||
                "No skills listed",
              summary: resume?.summary,
              projects: resume?.projects?.map((p) => p.name) || [
                "No projects mentioned",
              ],
            };
          } catch (error) {
            console.error(
              `Error fetching resume for ${app.applicant._id}:`,
              error
            );
            return {
              user_id: app.applicant._id,
              experience: "No experience mentioned",
              skills: "No skills listed",
              summary: `Name: ${app.applicant.fullname}, Email: ${app.applicant.email}`,
              projects: ["No projects mentioned"],
            };
          }
        })
      );

      // Create request payload
      const requestData = {
        job_description: jobDescription,
        candidates,
      };

      // Send request to Python API for ranking
      const res = await axios.post(
        `${PYTHON_API_END_POINT}/rank-candidates`,
        requestData
      );
      console.log(res.data);

      const sortedUserIds = res.data.map((item) => item.user_id);

      // Sort applicants based on AI response order
      const sortedApplicants = [...applicants.applications].sort(
        (a, b) =>
          sortedUserIds.indexOf(a.applicant._id) -
          sortedUserIds.indexOf(b.applicant._id)
      );

      setSortedApplicants(sortedApplicants);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <h1 className="font-bold text-xl my-5">
          Applicants {applicants?.applications?.length}
        </h1>

        {/* Sort with AI Button */}
        <button
          onClick={sortWithAI}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading || sortedApplicants !== null} // Disable after sorting
        >
          {loading ? "Sorting..." : "Sort with AI"}
        </button>

        {/* Pass sortedApplicants to ApplicantsTable if available */}
        <ApplicantsTable
          applicants={sortedApplicants || applicants.applications}
        />
      </div>
    </div>
  );
};

export default Applicants;
