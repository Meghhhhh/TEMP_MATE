import React, { useState } from 'react'
import { Button } from './ui/button'
import { Search } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <div className='text-center'>
            <div className='flex flex-col gap-5 my-10'>
                <span className=' mx-auto px-4 py-2 rounded-full bg-gray-100/30 text-[#d2cecd] font-medium'>No. 1 Job Hunt Website</span>
                <h1 className='text-5xl font-bold text-white'>Search, Apply & <br /> Get Your <span className='text-[#adb9ff]'>Dream Jobs</span></h1>
                <p className='text-white/80'>Apply for your dream job effortlessly and take the next big step.
                Your future starts with a single application—don't miss out!"</p>
                <div className='flex w-[40%] shadow-lg  border-gray-200 pl-3 rounded-full items-center gap-4 mx-auto 
                bg-white/10 backdrop-blur-lg ring-2 ring-[#6A38C2]'>
    <input
        type="text"
        placeholder='Find your dream jobs'
        onChange={(e) => setQuery(e.target.value)}
        className='outline-none border-none w-full bg-transparent text-white placeholder-gray-300 px-2'
    />
    <Button onClick={searchJobHandler} className="rounded-r-full bg-[#6A38C2] hover:bg-[#5a2ea0] transition">
        <Search className='h-5 w-5 text-white' />
    </Button>
</div>

            </div>
        </div>
    )
}

export default HeroSection