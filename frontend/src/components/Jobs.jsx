import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import Job from "./Job";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import img1 from '../assets/Home.png';
const Jobs = () => {
    const { allJobs } = useSelector((store) => store.job);
    const [filterJobs, setFilterJobs] = useState(allJobs);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        jobType: "",
        salary: "",
        location: "",
        experience: "",
    });

    const [openDropdown, setOpenDropdown] = useState(null);

    useEffect(() => {
        let filteredJobs = allJobs;

        // Apply search query filter
        if (searchQuery) {
            filteredJobs = filteredJobs.filter(
                (job) =>
                    (typeof job.title === "string" && job.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (typeof job.description === "string" && job.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Apply dropdown filters
        Object.keys(filters).forEach((key) => {
            if (filters[key]) {
                filteredJobs = filteredJobs.filter((job) =>
                    job[key]?.toLowerCase().includes(filters[key].toLowerCase())
                );
            }
        });

        setFilterJobs(filteredJobs);
    }, [allJobs, searchQuery, filters]);

    // Extract unique locations dynamically
    const uniqueLocations = [...new Set(allJobs.map((job) => job.location))];

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const toggleDropdown = (key) => {
        setOpenDropdown(openDropdown === key ? null : key);
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
            <Navbar />
            <div className="max-w-7xl mx-auto mt-5">

                {/* Search Bar with Glassmorphism */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search by title or description..."
                        className="w-full p-3 rounded-lg shadow-lg bg-white/10 backdrop-blur-lg text-black placeholder-gray-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter Section with Glassmorphism */}
                <div className="flex gap-4 bg-white/10 backdrop-blur-lg p-4 rounded-lg shadow-lg border border-white/30 z-50 relative">
                    {[
                        { key: "jobType", label: "Job Type ▼", options: ["All", "Remote", "Onsite", "Hybrid"] },
                        { key: "salary", label: "Salary ▼", options: ["All", "10-20 LPA", "20-50 LPA", "50-100 LPA", "100+ LPA"] },
                        { key: "location", label: "Location ▼", options: ["All", ...uniqueLocations] },
                        { key: "experience", label: "Experience ▼", options: ["All", "0-1 years", "1-3 years", "3-5 years", "5+ years"] },
                    ].map(({ key, label, options }) => (
                        <div key={key} className="relative z-50">
                            <button
                                className="bg-white/10 text-white border border-white/30 p-2 rounded-lg shadow-md cursor-pointer hover:bg-white/20"
                                onClick={() => toggleDropdown(key)}
                            >
                                {label}
                            </button>
                            {openDropdown === key && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute mt-2 bg-white backdrop-blur-lg border border-white/30 rounded-lg shadow-lg p-2 w-44"
                                >
                                    {options.map((option) => (
                                        <div
                                            key={option}
                                            className="cursor-pointer p-2 text-black rounded-lg"
                                            onClick={() => handleFilterChange(key, option === "All" ? "" : option)}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Job List */}
                {filterJobs.length <= 0 ? (
                    <span className="block mt-5 text-center text-white text-lg">No jobs found</span>
                ) : (
                    <div className="h-[80vh] overflow-y-auto pb-5 ">
                        <div className="grid grid-cols-3 gap-4 mt-5">
                            {filterJobs.map((job) => (
                                <motion.div
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ duration: 0.3 }}
                                    key={job?._id}
                                >
                                    <Job job={job} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Jobs;
