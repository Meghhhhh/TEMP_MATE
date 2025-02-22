import React, { useState } from "react";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Contact, FileText, Mail, Pen } from "lucide-react";
import { Label } from "./ui/label";
import AppliedJobTable from "./AppliedJobTable";
import UpdateProfileDialog from "./UpdateProfileDialog";
import { useDispatch, useSelector } from "react-redux";
import useGetAppliedJobs from "@/hooks/useGetAppliedJobs";
import { toast } from "sonner";
import axios from "axios";
import { PYTHON_API_END_POINT, RESUME_API_END_POINT } from "@/utils/constant";
import Skills from "./Skills";
import Cookies from "js-cookie";
import { setUser } from "@/redux/authSlice";
import img1 from "../assets/Home.png";

const Profile = () => {
  useGetAppliedJobs();
  const token = Cookies.get("token");
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const [extractedData, setExtractedData] = useState(null); // Store extracted data
  const { user } = useSelector((store) => store.auth);
  const isResume = !!user?.profile?.resume;

  const extractResumeInfo = async () => {
    if (!user?.profile?.resume) {
      toast.error("No resume found.");
      return;
    }

    try {
      toast.loading("Extracting resume details...");
      const formData = new FormData();
      formData.append("resume_url", user.profile.resume); // ✅ Correct key name

      const res = await axios.post(
        `${PYTHON_API_END_POINT}/extract-key-details`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.dismiss();
      if (res.status === 200) {
        toast.success("Resume information extracted successfully!");
        setExtractedData(res.data); // Store extracted data
        console.log("Extracted Data:", res.data);
      } else {
        toast.error("Failed to extract resume information.");
      }
    } catch (error) {
      toast.dismiss();
      console.error(error);
      toast.error("Error extracting resume details.");
    }
  };

  const updateExtractedInfo = async () => {
    try {
      toast.loading("Updating resume details...");

      const formattedData = {
        summary: extractedData.summary || "",
        skills: extractedData.skills.map((skill) => ({
          name: skill,
          level: 0, // Defaulting to 0, update as needed
        })),
        projects: extractedData.projects.map((project) => ({
          name: project.name,
          description: project.description,
          isVerified: false, // Default value
        })),
        experience: extractedData.experience.map(
          (exp) =>
            `${exp.role} at ${exp.company} (${exp.duration}): ${exp.details}`
        ),
        education: extractedData.education.map((edu) => ({
          institution: edu.institution || "",
          degree: edu.degree || "",
          gpa: edu.gpa || "",
          honors: edu.honors || "",
        })),
      };

      const res = await axios.post(
        `${RESUME_API_END_POINT}/update-extract`,
        formattedData,
         {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // dispatch(setUser(response.data.user));

      toast.dismiss();
      if (res.status === 200 || res.status === 201) {
        toast.success("Resume details updated successfully!");
        setExtractedData(null);
      } else {
        toast.error("Failed to update resume information.");
      }
    } catch (error) {
      toast.dismiss();
      console.error(error);
      toast.error("Error updating resume details.");
    }
  };

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${img1})` }}
      >
        <div className="absolute inset-0 bg-black/0"></div> {/* Dark Overlay */}
      </div>
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-4xl mx-auto text-white rounded-2xl my-5 p-8">
          <div className="p-6 rounded-2xl shadow-lg border border-white/20 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-xl transition-all hover:shadow-xl">
            <div className="flex justify-between">
              <div className="flex items-center gap-8">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src="https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg"
                    alt="profile"
                  />
                </Avatar>
                <div>
                  <h1 className="font-medium text-xl">{user?.fullname}</h1>
                  <p className="text-sm py-4">{user?.profile?.bio}</p>
                </div>
              </div>
              <Button
                onClick={() => setOpen(true)}
                className="text-right bg-tranparent hover:bg-black/40 mx-5"
                variant="outline"
              >
                <Pen className="text-white" />
              </Button>
            </div>
            <div className="my-5">
              <div className="flex items-center gap-3 my-2">
                <Mail />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 my-2">
                <Contact />
                <span>{user?.phoneNumber}</span>
              </div>
            </div>

            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label className="text-md font-bold">Resume</Label>
              {isResume ? (
                <div className="flex justify-between">
                  <a
                    target="blank"
                    href={user?.profile?.resume}
                    className="text-white hover:underline cursor-pointer flex items-center gap-4"
                  >
                    {user?.profile?.resumeOriginalName}
                  </a>
                  <Button
                    onClick={extractResumeInfo}
                    size="sm"
                    variant="outline"
                    className="text-right bg-tranparent hover:bg-black/40"
                  >
                    <FileText className="h-4 w-4 mr-2 text-white" />
                    <span className="text-white"> Extract Info</span>
                  </Button>
                </div>
              ) : (
                <span>NA</span>
              )}
            </div>
          </div>
        </div>
        {/* Show extracted data and allow updates */}
        {extractedData && (
          <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl my-5 p-8">
            <h2 className="font-medium text-xl mb-4">
              Confirm & Update Extracted Info
            </h2>
            <div className="mb-4">
              <Label className="font-bold">Summary</Label>
              <textarea
                value={extractedData.summary}
                onChange={(e) =>
                  setExtractedData({
                    ...extractedData,
                    summary: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <Label className="font-bold">Skills</Label>
              <input
                type="text"
                value={extractedData.skills.join(", ")}
                onChange={(e) =>
                  setExtractedData({
                    ...extractedData,
                    skills: e.target.value.split(","),
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <Label className="font-bold">Projects</Label>
              {extractedData.projects.map((project, index) => (
                <div key={index} className="mb-2">
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => {
                      const updatedProjects = [...extractedData.projects];
                      updatedProjects[index].name = e.target.value;
                      setExtractedData({
                        ...extractedData,
                        projects: updatedProjects,
                      });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Project Name"
                  />
                  <textarea
                    value={project.description}
                    onChange={(e) => {
                      const updatedProjects = [...extractedData.projects];
                      updatedProjects[index].description = e.target.value;
                      setExtractedData({
                        ...extractedData,
                        projects: updatedProjects,
                      });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md mt-2"
                    placeholder="Project Description"
                  />
                </div>
              ))}
            </div>

            <div className="mb-4">
              <Label className="font-bold">Experience</Label>
              {extractedData.experience.map((exp, index) => (
                <div key={index} className="mb-2">
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => {
                      const updatedExperience = [...extractedData.experience];
                      updatedExperience[index].role = e.target.value;
                      setExtractedData({
                        ...extractedData,
                        experience: updatedExperience,
                      });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Role"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => {
                      const updatedExperience = [...extractedData.experience];
                      updatedExperience[index].company = e.target.value;
                      setExtractedData({
                        ...extractedData,
                        experience: updatedExperience,
                      });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md mt-2"
                    placeholder="Company"
                  />
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => {
                      const updatedExperience = [...extractedData.experience];
                      updatedExperience[index].duration = e.target.value;
                      setExtractedData({
                        ...extractedData,
                        experience: updatedExperience,
                      });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md mt-2"
                    placeholder="Duration"
                  />
                  <textarea
                    type="text"
                    value={exp.details}
                    onChange={(e) => {
                      const updatedExperience = [...extractedData.experience];
                      updatedExperience[index].details = e.target.value;
                      setExtractedData({
                        ...extractedData,
                        experience: updatedExperience,
                      });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md mt-2"
                    placeholder="Details"
                  />
                </div>
              ))}
            </div>
            <div className="mb-4">
              <Label className="font-bold">Education</Label>
              {extractedData.education.map((edu, index) => (
                <div key={index} className="mb-2">
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => {
                      const updatedEducation = [...extractedData.education];
                      updatedEducation[index].institution = e.target.value;
                      setExtractedData({
                        ...extractedData,
                        education: updatedEducation,
                      });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Institution"
                  />
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => {
                      const updatedEducation = [...extractedData.education];
                      updatedEducation[index].degree = e.target.value;
                      setExtractedData({
                        ...extractedData,
                        education: updatedEducation,
                      });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md mt-2"
                    placeholder="Degree"
                  />
                  <input
                    type="text"
                    value={edu.gpa}
                    onChange={(e) => {
                      const updatedEducation = [...extractedData.education];
                      updatedEducation[index].gpa = e.target.value;
                      setExtractedData({
                        ...extractedData,
                        education: updatedEducation,
                      });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md mt-2"
                    placeholder="GPA"
                  />
                  <input
                    type="text"
                    value={edu.honors}
                    onChange={(e) => {
                      const updatedEducation = [...extractedData.education];
                      updatedEducation[index].honors = e.target.value;
                      setExtractedData({
                        ...extractedData,
                        education: updatedEducation,
                      });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md mt-2"
                    placeholder="Honors"
                  />
                </div>
              ))}
            </div>
            <Button
              onClick={updateExtractedInfo}
              className="mt-4"
              variant="outline"
            >
              Update Resume Info
            </Button>
          </div>
        )}

        <div className="max-w-4xl mx-auto text-white rounded-2xl p-3">
          <h1 className="text-3xl font-semibold mb-6 text-center">
            Applied Jobs
          </h1>
          <AppliedJobTable />
        </div>

        <Skills />

        <UpdateProfileDialog open={open} setOpen={setOpen} />
      </div>
    </div>
  );
};

export default Profile;
