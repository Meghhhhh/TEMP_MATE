import React, { useEffect } from 'react';
import Navbar from './shared/Navbar';
import Job from './Job';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import img1 from '../assets/Home.png';

const Browse = () => {
    useGetAllJobs();
    const { allJobs } = useSelector(store => store.job);
    const dispatch = useDispatch();

    useEffect(() => {
        return () => {
            dispatch(setSearchedQuery(''));
        };
    }, [dispatch]);

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

            <div className="relative max-w-7xl mx-auto my-10">
                <h1 className="font-bold text-xl my-10">Search Results ({allJobs.length})</h1>
                <div className="grid grid-cols-3 gap-4">
                    {allJobs.map((job) => (
                        <Job key={job._id} job={job} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Browse;
