const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const env = require('../src/config/env');
const User = require('../src/models/User');
const Skill = require('../src/models/Skill');
const Job = require('../src/models/Job');

async function seed() {
  console.log('Connecting to MongoDB at:', env.MONGODB_URI);
  await mongoose.connect(env.MONGODB_URI);

  // 1. Seed demo admin user
  const adminEmail = 'admin@example.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const passwordHash = await bcrypt.hash('Admin@12345', 12);
    admin = await User.create({
      name: 'System Admin',
      email: adminEmail,
      passwordHash,
      role: 'admin',
      isActive: true
    });
    console.log(`Created default admin: ${adminEmail} (password: Admin@12345)`);
  } else {
    console.log(`Admin user ${adminEmail} already exists.`);
  }

  // 2. Seed recruiter user
  const recruiterEmail = 'recruiter@example.com';
  let recruiter = await User.findOne({ email: recruiterEmail });
  if (!recruiter) {
    const passwordHash = await bcrypt.hash('Recruiter@12345', 12);
    recruiter = await User.create({
      name: 'Sarah Connor (Tech Talent)',
      email: recruiterEmail,
      passwordHash,
      role: 'recruiter',
      isActive: true
    });
    console.log(`Created default recruiter: ${recruiterEmail} (password: Recruiter@12345)`);
  }

  // 3. Seed demo candidate user
  const candidateEmail = 'candidate@example.com';
  let candidate = await User.findOne({ email: candidateEmail });
  if (!candidate) {
    const passwordHash = await bcrypt.hash('Candidate@12345', 12);
    candidate = await User.create({
      name: 'Alex Johnson',
      email: candidateEmail,
      passwordHash,
      role: 'candidate',
      isActive: true,
      visibleToRecruiters: true
    });
    console.log(`Created default candidate: ${candidateEmail} (password: Candidate@12345)`);
  }

  // 4. Seed skills taxonomy from nlp-service skills.json
  const skillsJsonPath = path.join(__dirname, '../../nlp-service/app/data/skills.json');
  if (fs.existsSync(skillsJsonPath)) {
    const skillsData = JSON.parse(fs.readFileSync(skillsJsonPath, 'utf-8'));
    console.log(`Seeding ${skillsData.length} skills into database...`);
    for (const item of skillsData) {
      await Skill.findOneAndUpdate(
        { name: item.name },
        {
          name: item.name,
          aliases: item.aliases || [],
          category: item.category || 'tool'
        },
        { upsert: true }
      );
    }
    console.log('Skills taxonomy seeded successfully.');
  }

  // 5. Seed sample jobs
  const jobCount = await Job.countDocuments();
  if (jobCount === 0) {
    console.log('Seeding initial sample job listings...');
    const sampleJobs = [
      {
        postedBy: recruiter._id,
        title: 'Full Stack Software Engineer',
        company: 'Veloce Labs',
        description: 'Looking for a full stack engineer skilled in React, Node.js, Express, and MongoDB. Experience building scalable microservices and RESTful APIs is essential.',
        requiredSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'Git'],
        location: 'Remote',
        experienceLevel: 'junior'
      },
      {
        postedBy: recruiter._id,
        title: 'Backend Python & FastAPI Developer',
        company: 'DeepPulse AI',
        description: 'Build robust machine learning and NLP backends using Python, FastAPI, and Docker. Experience with PostgreSQL and AWS is a huge plus.',
        requiredSkills: ['Python', 'FastAPI', 'Docker', 'PostgreSQL', 'REST API', 'Git'],
        location: 'Bangalore, India (Hybrid)',
        experienceLevel: 'mid'
      },
      {
        postedBy: recruiter._id,
        title: 'Frontend React Developer',
        company: 'Apex Design Systems',
        description: 'Create high performance web interfaces using React 18, TypeScript, and Tailwind CSS. Focus on accessibility, responsive layouts, and smooth UX.',
        requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'HTML', 'CSS', 'JavaScript'],
        location: 'Remote',
        experienceLevel: 'fresher'
      },
      {
        postedBy: recruiter._id,
        title: 'DevOps & Cloud Infrastructure Engineer',
        company: 'CloudMatrix Inc',
        description: 'Manage automated CI/CD pipelines, Kubernetes clusters, and cloud infrastructure on AWS and GCP.',
        requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Git'],
        location: 'Mumbai, India',
        experienceLevel: 'mid'
      }
    ];

    await Job.insertMany(sampleJobs);
    console.log(`Seeded ${sampleJobs.length} sample jobs.`);
  }

  console.log('Database seeding complete!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

