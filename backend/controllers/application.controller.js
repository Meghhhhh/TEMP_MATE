import { Application } from '../models/application.model.js';
import { Job } from '../models/job.model.js';
import { Resume } from '../models/resume.model.js';

export const autoApplyForJobs = async (req, res) => {
  try {
    const userId = req.id;

    // Fetch user's resume
    const resume = await Resume.findOne({ userId });
    if (!resume) {
      return res.status(404).json({
        message: 'Resume not found.',
        success: false,
      });
    }

    const escapeRegex = text => text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

    const userSkills = resume.skills.map(skill =>
      escapeRegex(skill.name.toLowerCase())
    );

    // Find relevant jobs based on user's skills
    const relevantJobs = await Job.find({
      requirements: {
        $in: userSkills.map(skill => new RegExp(skill, 'i')), // Safely create regex
      },
    });

    if (relevantJobs.length === 0) {
      return res.status(404).json({
        message: 'No relevant jobs found.',
        success: false,
      });
    }

    let appliedApplications = [];
    for (const job of relevantJobs) {
      let application = await Application.findOne({
        job: job._id,
        applicant: userId,
      });

      if (!application) {
        // Create a new application
        application = await Application.create({
          job: job._id,
          applicant: userId,
        });

        // Update job's application list
        job.applications.push(application._id);
        await job.save();
      }

      appliedApplications.push(application);
    }

    // Populate applications with job and company details like in getAppliedJobs
    const populatedApplications = await Application.find({
      _id: { $in: appliedApplications.map(app => app._id) },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'job',
        options: { sort: { createdAt: -1 } },
        populate: {
          path: 'company',
          options: { sort: { createdAt: -1 } },
        },
      });

    return res.status(201).json({
      message: 'Auto-application process completed.',
      success: true,
      application: populatedApplications,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', success: false });
  }
};


export const applyJob = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;
    if (!jobId) {
      return res.status(400).json({
        message: 'Job id is required.',
        success: false,
      });
    }
    // check if the user has already applied for the job
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: userId,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: 'You have already applied for this jobs',
        success: false,
      });
    }

    // check if the jobs exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: 'Job not found',
        success: false,
      });
    }
    // create a new application
    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
    });

    job.applications.push(newApplication._id);
    await job.save();
    return res.status(201).json({
      message: 'Job applied successfully.',
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.id;
    const application = await Application.find({ applicant: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'job',
        options: { sort: { createdAt: -1 } },
        populate: {
          path: 'company',
          options: { sort: { createdAt: -1 } },
        },
      });
    if (!application) {
      return res.status(404).json({
        message: 'No Applications',
        success: false,
      });
    }
    return res.status(200).json({
      application,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
// admin dekhega kitna user ne apply kiya hai
export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate({
      path: 'applications',
      options: { sort: { createdAt: -1 } },
      populate: {
        path: 'applicant',
      },
    });
    if (!job) {
      return res.status(404).json({
        message: 'Job not found.',
        success: false,
      });
    }
    return res.status(200).json({
      job,
      succees: true,
    });
  } catch (error) {
    console.log(error);
  }
};
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;
    if (!status) {
      return res.status(400).json({
        message: 'status is required',
        success: false,
      });
    }

    // find the application by applicantion id
    const application = await Application.findOne({ _id: applicationId });
    if (!application) {
      return res.status(404).json({
        message: 'Application not found.',
        success: false,
      });
    }

    // update the status
    application.status = status.toLowerCase();
    await application.save();

    return res.status(200).json({
      message: 'Status updated successfully.',
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
