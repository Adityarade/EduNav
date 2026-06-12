const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { GoogleGenAI } = require('@google/genai');
const multer = require('multer');
const { PDFParse } = require('pdf-parse');

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// Initialize Google Gen AI
const ai = new GoogleGenAI({ apiKey: process.env.GEM_API_KEY || process.env.GEMINI_API_KEY || 'dummy_key' });

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'EduNav Backend is running without errors!' });
});

// --- ROADMAP GENERATOR API ---
app.post('/api/generate-roadmap', async (req, res) => {
  try {
    const { skill, level, timeCommitment, learningStyle, duration } = req.body;

    let generatedRoadmap = {};
    const targetDays = parseInt(duration) || 30;
    const minDays = Math.max(30, targetDays); // Enforce minimum 30 days

    // Check if real API key exists
    const hasApiKey = process.env.GEMINI_API_KEY || process.env.GEM_API_KEY;
    if (hasApiKey) {
      const prompt = `Create a step-by-step learning roadmap and free resources for a student wanting to learn: "${skill}".
Details:
- Current Level: ${level}
- Time Commitment: ${timeCommitment} daily
- Preferred Style: ${learningStyle}
- Target Duration: ${minDays} Days (the roadmap MUST span a minimum of ${minDays} days divided into logical weekly or daily modules)

You MUST return the output as a valid JSON object with the following structure:
{
  "title": "Roadmap to learn ${skill}",
  "description": "A customized study plan designed for ${level} level spanning ${minDays} days.",
  "steps": [
    {
      "day": "Day 1-7",
      "title": "Introduction to ${skill}",
      "tasks": ["Task 1...", "Task 2..."]
    }
  ],
  "resources": [
    {
      "name": "Resource Name",
      "url": "https://...",
      "type": "YouTube Channel / Documentation / Article"
    }
  ]
}
Return only the raw JSON, no markdown formatting.`;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });

      const text = response.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
         generatedRoadmap = JSON.parse(jsonMatch[0]);
      } else {
         throw new Error("Could not parse JSON from AI response.");
      }
    } else {
      // Mock Roadmap data fallback that covers the requested duration (minimum 30 days)
      const seg1 = Math.round(minDays * 0.25);
      const seg2 = Math.round(minDays * 0.5);
      const seg3 = Math.round(minDays * 0.75);
      const seg4 = minDays;

      generatedRoadmap = {
        title: `Roadmap to learn ${skill}`,
        description: `A customized ${level}-level study plan tailored for ${learningStyle} learners with ${timeCommitment} daily commitment, structured to complete in ${minDays} days.`,
        steps: [
          {
            day: `Day 1-${seg1}`,
            title: `Getting Started & Foundations`,
            tasks: [
              `Set up local development environment for ${skill}`,
              `Study core principles and basic building blocks`,
              `Watch an introductory overview crash course`,
              `Complete 3 basic sandbox exercises`
            ]
          },
          {
            day: `Day ${seg1 + 1}-${seg2}`,
            title: `Core Integration & Practice`,
            tasks: [
              `Learn about data flow, standard libraries, and frameworks related to ${skill}`,
              `Build your first mini-application or prototype`,
              `Read the official API and developer documentation`,
              `Refactor and optimize your code structure`
            ]
          },
          {
            day: `Day ${seg2 + 1}-${seg3}`,
            title: `Advanced Concepts & Challenges`,
            tasks: [
              `Study advanced architectures, performance scaling, and security best practices`,
              `Connect to third-party services, APIs, or databases`,
              `Write unit tests to cover core application parts`,
              `Fix code bottlenecks and address edge cases`
            ]
          },
          {
            day: `Day ${seg3 + 1}-${seg4}`,
            title: `Capstone Project & Completion`,
            tasks: [
              `Build a fully-featured, production-ready capstone project`,
              `Deploy the project to a free hosting service or app store`,
              `Request peer feedback or conduct comprehensive user testing`,
              `Document your learnings and complete the roadmap successfully`
            ]
          }
        ],
        resources: [
          {
            name: `${skill} Free Crash Course (YouTube)`,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + ' crash course')}`,
            type: "YouTube Video"
          },
          {
            name: `Official ${skill} Documentation`,
            url: `https://www.google.com/search?q=${encodeURIComponent(skill + ' official documentation')}`,
            type: "Documentation"
          },
          {
            name: `FreeCodeCamp ${skill} Guide`,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent('freecodecamp ' + skill)}`,
            type: "YouTube Channel"
          }
        ]
      };
    }

    // Save in DB under mock user
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'student@example.com', name: 'Student' }
      });
    }

    const goal = await prisma.goal.create({
      data: {
        userId: user.id,
        title: generatedRoadmap.title,
        description: generatedRoadmap.description,
        category: 'medium-term',
        status: 'in-progress'
      }
    });

    const actionPlan = await prisma.actionPlan.create({
      data: {
        goalId: goal.id,
        steps: JSON.stringify(generatedRoadmap.steps),
        resources: JSON.stringify(generatedRoadmap.resources)
      }
    });

    res.status(201).json({
      goalId: goal.id,
      ...generatedRoadmap
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- CHATBOT API (PathFinder AI) ---
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    let reply = "";

    const hasApiKey = process.env.GEMINI_API_KEY || process.env.GEM_API_KEY;
    if (hasApiKey) {
      const prompt = `You are "PathFinder AI", a helpful assistant and user guide for the "EduNav" application.
EduNav is an app where students can set goals, generate roadmaps, track daily study consistency, and find free resources.
Your job is to answer the user's questions about how to use the app, suggest study habits, and provide brief help.
Keep your answers user-friendly, clean, and concise (under 3 sentences).
User message: "${message}"`;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });
      reply = response.text;
    } else {
      // Mock Chatbot fallback
      const lower = message.toLowerCase();
      if (lower.includes('hello') || lower.includes('hi')) {
        reply = "Hello! I am PathFinder AI, your study guide. How can I help you navigate your goals today?";
      } else if (lower.includes('roadmap') || lower.includes('generate')) {
        reply = "You can generate a roadmap by clicking the 'My Goals' tab, filling out the survey with your skill requirements, and clicking 'Generate'!";
      } else if (lower.includes('progress') || lower.includes('track')) {
        reply = "Check off completed tasks in your active roadmap, and your progress ring and weekly consistency graph on the dashboard will update automatically!";
      } else if (lower.includes('youtube') || lower.includes('video') || lower.includes('free')) {
        reply = "I recommend free courses, YouTube search links, and official docs right inside your generated roadmaps to keep your learning completely free!";
      } else {
        reply = "I'm PathFinder AI! You can use me to learn how to add goals, track consistency, or generate personalized roadmaps. Let me know if you need help with anything!";
      }
    }

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ATS RESUME CHECKER API ---
app.post('/api/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    console.log('--- POST /api/analyze-resume ---');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'undefined');

    const { targetJobTitle, targetJobDescription } = req.body;
    let resumeText = "";

    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        const parser = new PDFParse({ data: req.file.buffer });
        try {
          const result = await parser.getText();
          resumeText = result.text;
        } finally {
          await parser.destroy();
        }
      } else {
        resumeText = req.file.buffer.toString('utf-8');
      }
    } else {
      resumeText = req.body.resumeText || "";
    }

    if (!resumeText.trim()) {
      console.log('Error: resumeText is empty.');
      return res.status(400).json({ error: "Please upload a resume file or paste your resume text." });
    }

    const hasApiKey = process.env.GEMINI_API_KEY || process.env.GEM_API_KEY;
    let analysisResult = {};

    if (hasApiKey) {
      const prompt = `You are an expert ATS (Applicant Tracking System) reviewer and hiring manager.
Analyze the following resume text against the target job title "${targetJobTitle || 'General Software Engineer'}" and target job description/keywords "${targetJobDescription || ''}".

Resume Text:
"""
${resumeText}
"""

You MUST evaluate:
1. ATS Match Score: A percentage rating out of 100 on how well this resume matches the target job.
2. Uniqueness Rating: A percentage rating out of 100 on how unique and outstanding this resume is.
3. Critical Missing Keywords: A list of 4-6 keywords from the target job description or standard role keywords that are missing or underrepresented.
4. Optimization Strategy / Key Tips: Detailed actionable tips in three categories: formatting, content enhancements, and project strengthening.

You MUST return the output as a valid JSON object with the following structure:
{
  "atsScore": 75,
  "uniqueness": 80,
  "parsedDetails": {
    "name": "Candidate Name or Detected Name",
    "skills": ["Detected skill 1", "Detected skill 2"]
  },
  "missingKeywords": ["keyword 1", "keyword 2"],
  "formattingTips": ["Tip 1", "Tip 2"],
  "contentTips": ["Tip 1", "Tip 2"],
  "projectTips": ["Tip 1", "Tip 2"],
  "overallSummary": "Brief overview of how strong the match is."
}
Return only the raw JSON, no markdown formatting.`;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });

      const text = response.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
         analysisResult = JSON.parse(jsonMatch[0]);
      } else {
         throw new Error("Could not parse JSON from AI response.");
      }
    } else {
      const detectedName = "Student Learner";
      const cleanTitle = (targetJobTitle || 'Software Engineer').toLowerCase();
      let matchedSkills = ["HTML", "JavaScript", "CSS", "Git", "Problem Solving"];
      let missingKeywords = ["React Hooks", "TypeScript Types", "PostgreSQL", "Docker Containers", "CI/CD Pipelines"];
      
      if (cleanTitle.includes('machine') || cleanTitle.includes('ai') || cleanTitle.includes('data')) {
        matchedSkills = ["Python", "Pandas", "SQL", "Git", "Linear Algebra"];
        missingKeywords = ["PyTorch", "TensorFlow", "Feature Engineering", "Scikit-Learn", "Model Deployment (AWS)"];
      }

      analysisResult = {
        atsScore: Math.floor(Math.random() * 20) + 65,
        uniqueness: Math.floor(Math.random() * 15) + 70,
        parsedDetails: {
          name: detectedName,
          skills: matchedSkills
        },
        missingKeywords: missingKeywords,
        formattingTips: [
          "Include a clean 'Skills' section grouped by category (e.g. Languages, Frameworks, Tools).",
          "Ensure your contact details are at the top and easy for parser bots to scan."
        ],
        contentTips: [
          "Start your bullet points with strong impact verbs (e.g., 'Architected', 'Optimized', 'Pioneered').",
          "Quantify your metrics (e.g., 'Improved load times by 25%', 'Handled 500+ active sessions')."
        ],
        projectTips: [
          "Add details about how you connected the frontend to the backend using SQLite or Prisma.",
          "Link your GitHub repositories for your key portfolio projects."
        ],
        overallSummary: `Your resume shows decent foundation skills for the ${targetJobTitle || 'desired'} role, but missing critical keywords decreases your ATS match rate. Optimizing these areas will significantly increase your callback chances.`
      };
    }

    res.json({
      success: true,
      analysis: analysisResult
    });

  } catch (error) {
    console.error('Error in analyze-resume:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- INTERVIEW PREPARATION API ---
app.post('/api/generate-interview-questions', async (req, res) => {
  try {
    const { targetJobTitle, resumeSkills, questionCount = 5, focusTopic } = req.body;

    const hasApiKey = process.env.GEMINI_API_KEY || process.env.GEM_API_KEY;
    let questions = [];

    if (hasApiKey) {
      const skillsContext = resumeSkills && resumeSkills.length > 0 ? `The candidate has the following skills: "${resumeSkills.join(', ')}".` : "";
      const topicContext = focusTopic && focusTopic.trim() !== "" ? `The interview MUST strictly focus on the topic of "${focusTopic}". All questions must be deeply related to this topic.` : `The interview should cover broad topics relevant to the role. Ensure a good mix of Technical, Behavioral, and System Design questions.`;

      const prompt = `You are a technical interviewer preparing a candidate for a "${targetJobTitle || 'Software Engineer'}" role.
${skillsContext}
${topicContext}

Generate exactly ${questionCount} high-yield interview questions.

For each question, also provide brief model answer guidelines (what key elements the candidate should mention in their answer).

You MUST return the output as a valid JSON object with the following structure:
{
  "questions": [
    {
      "id": 1,
      "category": "Technical",
      "question": "The question text here...",
      "guidelines": "Short bullet points of what to cover (e.g., explain time complexity, state differences)..."
    }
  ]
}
Return only the raw JSON, no markdown formatting.`;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });

      const text = response.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
         const parsed = JSON.parse(jsonMatch[0]);
         questions = parsed.questions;
      } else {
         throw new Error("Could not parse JSON from AI response.");
      }
    } else {
      // Mock Fallback Offline Mode
      const numQuestions = parseInt(questionCount, 10) || 5;
      const cleanTitle = targetJobTitle || 'Software Engineer';
      const topic = focusTopic ? focusTopic : cleanTitle;
      
      questions = [];
      for(let i = 0; i < numQuestions; i++) {
        let category = "Technical";
        if (i % 3 === 1) category = "Behavioral";
        if (i % 3 === 2) category = "System Design";
        
        questions.push({
          id: i + 1,
          category: category,
          question: `[OFFLINE MOCK] As a ${cleanTitle}, discuss a common challenge you face when working with ${topic}. (Question ${i + 1})`,
          guidelines: `Mention specific tools used in ${topic}, optimization techniques, and team collaboration.`
        });
      }
    }

    res.json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- INTERVIEW GRADER API ---
app.post('/api/grade-interview-answer', async (req, res) => {
  try {
    const { question, answer } = req.body;

    const hasApiKey = process.env.GEMINI_API_KEY || process.env.GEM_API_KEY;
    let gradeResult = {};

    if (hasApiKey) {
      const prompt = `You are a senior tech lead evaluating a candidate's response in an interview.
Question: "${question}"
Candidate's Answer: "${answer}"

Grade the response out of 10 and provide detailed structured feedback:
1. Verdict (Excellent, Good, Needs Improvement)
2. Score (out of 10)
3. Strong points in their answer
4. Missing details/Improvements needed
5. Model Response (what a perfect answer would sound like)

You MUST return the output as a valid JSON object with the following structure:
{
  "verdict": "Good",
  "score": 7,
  "strengths": ["Strong point 1", "Strong point 2"],
  "improvements": ["Improvement 1", "Improvement 2"],
  "modelAnswer": "Detailed model response..."
}
Return only the raw JSON, no markdown formatting.`;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });

      const text = response.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
         gradeResult = JSON.parse(jsonMatch[0]);
      } else {
         throw new Error("Could not parse JSON from AI response.");
      }
    } else {
      const len = (answer || "").trim().length;
      let score = 5;
      let verdict = "Needs Improvement";
      let strengths = ["You attempted to answer the core question prompt directly."];
      let improvements = [
        "Include more concrete technical examples or frameworks (like STAR methodology).",
        "Elaborate on the systems consequences and edge-cases."
      ];

      if (len > 150) {
        score = 8;
        verdict = "Good";
        strengths.push("Good depth and detail in explaining your reasoning.");
        improvements.push("Incorporate specific performance or speed metrics from your projects.");
      } else if (len > 70) {
        score = 7;
        verdict = "Good";
        strengths.push("Clear explanation, easy to read.");
      }

      gradeResult = {
        verdict,
        score,
        strengths,
        improvements,
        modelAnswer: `For the question: "${question}", an excellent response should start with a direct technical definition, proceed to explain the trade-offs, detail a real-world scenario (using the STAR method), and conclude with best practices regarding scalability and performance optimization.`
      };
    }

    res.json({ success: true, grading: gradeResult });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- STUDENT PROFILE API ---
app.get('/api/profile', async (req, res) => {
  try {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'student@example.com',
          name: 'Student Learner',
          mobile: '9876543210',
          bio: 'An aspiring software engineer learning new technologies.',
          targetRole: 'Full Stack Engineer',
          skills: 'HTML, CSS, JavaScript, React',
          profilePic: ''
        }
      });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/profile', async (req, res) => {
  try {
    const { name, email, mobile, bio, targetRole, skills, profilePic } = req.body;
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { name, email, mobile, bio, targetRole, skills, profilePic }
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name, email, mobile, bio, targetRole, skills, profilePic }
      });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- GOALS RETRIEVAL API ---
app.get('/api/goals', async (req, res) => {
  try {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'student@example.com', name: 'Student Learner' }
      });
    }
    const goals = await prisma.goal.findMany({
      where: { userId: user.id },
      include: {
        actionPlans: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- POMODORO STUDY SESSIONS API ---
app.post('/api/study-sessions', async (req, res) => {
  try {
    const { durationMinutes } = req.body;
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'student@example.com', name: 'Student Learner' }
      });
    }
    const session = await prisma.studySession.create({
      data: {
        userId: user.id,
        durationMinutes: parseInt(durationMinutes) || 25
      }
    });
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/study-sessions', async (req, res) => {
  try {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'student@example.com', name: 'Student Learner' }
      });
    }
    const sessions = await prisma.studySession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- AI STUDY COACH API ---
app.get('/api/ai-coach-report', async (req, res) => {
  try {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'student@example.com', name: 'Student Learner' }
      });
    }

    const sessions = await prisma.studySession.findMany({
      where: { userId: user.id }
    });
    const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);

    const goals = await prisma.goal.findMany({
      where: { userId: user.id },
      include: { actionPlans: true }
    });

    const hasApiKey = process.env.GEMINI_API_KEY || process.env.GEM_API_KEY;
    let coachReport = {};

    if (hasApiKey) {
      const activeGoalsInfo = goals.map(g => `- Goal: ${g.title}, Status: ${g.status}`).join('\n');
      const prompt = `You are an encouraging but disciplined AI Study Coach.
Analyze the following student progress profile:
- Student Name: ${user.name}
- Target Role: ${user.targetRole || 'Software Developer'}
- Skills: ${user.skills || 'Not specified'}
- Focus Sessions Logged: ${sessions.length} Pomodoro session(s) (${totalMinutes} minutes total)
- Active Roadmap(s):\n${activeGoalsInfo || 'No roadmaps generated yet'}

Provide a personalized weekly study report card. Mention their focus time, achievements (number of logged sessions or generated roadmaps), constructive critique, and a structured action plan.

You MUST return the output as a valid JSON object with the following structure:
{
  "verdict": "Outstanding Focus / Consistent Builder / Needs Momentum",
  "score": 8,
  "summary": "Detailed feedback summary explaining their performance...",
  "achievements": [
    "Achievement 1...",
    "Achievement 2..."
  ],
  "actionPlan": [
    "Action Item 1...",
    "Action Item 2..."
  ]
}
Return only raw JSON, no markdown code block wrapper.`;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });

      const text = response.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
         coachReport = JSON.parse(jsonMatch[0]);
      } else {
         throw new Error("Could not parse AI response.");
      }
    } else {
      // Mock Fallback
      let score = 5;
      let verdict = "Needs Momentum";
      let summary = "You are starting your journey! Logging study focus sessions and completing roadmap steps will unlock stronger insights.";
      let achievements = ["Initialized study profile and active goals."];
      
      if (sessions.length > 0) {
        score = totalMinutes > 100 ? 9 : totalMinutes > 40 ? 8 : 7;
        verdict = totalMinutes > 100 ? "Outstanding Focus" : "Consistent Builder";
        summary = `Great job! You have logged ${sessions.length} focus block(s) totaling ${totalMinutes} minutes this week. Keep up this momentum to lock in your learning habits!`;
        achievements.push(`Logged ${totalMinutes} minutes of focus study.`);
      }

      coachReport = {
        verdict,
        score,
        summary,
        achievements,
        actionPlan: [
          `Target 2 more Pomodoro focus blocks to hit your weekly targets.`,
          `Check off at least 2 steps on your active roadmap: ${goals[0]?.title || 'Study Roadmap'}.`,
          `Make summary notes on your learnings to test yourself with the AI Quizzer.`
        ]
      };
    }

    res.json(coachReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SKILL GAP ANALYZER API ---
app.post('/api/analyze-gap', async (req, res) => {
  try {
    const { jobDescription } = req.body;
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'student@example.com', name: 'Student Learner' }
      });
    }

    const studentSkills = (user.skills || "").split(',').map(s => s.trim()).filter(Boolean);
    const hasApiKey = process.env.GEMINI_API_KEY || process.env.GEM_API_KEY;
    let gapAnalysis = {};

    if (hasApiKey) {
      const prompt = `You are a career consultant and tech recruiter.
Compare the candidate's skills with the target Job Description.

Candidate Profile:
- Target Role: ${user.targetRole || 'Software Developer'}
- Skills: ${user.skills || 'None listed'}

Job Description:
"""
${jobDescription}
"""

Identify matching skills, missing skills, and calculate a match score (0-100%).
Also design a 2-step customized mini study roadmap to bridge the exact missing skills.

You MUST return the output as a valid JSON object with the following structure:
{
  "matchPercentage": 70,
  "matchedSkills": ["Skill 1", "Skill 2"],
  "missingSkills": ["Missing Skill 1", "Missing Skill 2"],
  "gapRoadmap": {
    "title": "Bridge Gap: [Job Title/Role]",
    "description": "Mini-roadmap targeting missing competencies.",
    "steps": [
      {
        "day": "Day 1-7",
        "title": "Focus: [First missing skill block]",
        "tasks": ["Task 1", "Task 2"]
      },
      {
        "day": "Day 8-15",
        "title": "Focus: [Second missing skill block]",
        "tasks": ["Task 1", "Task 2"]
      }
    ]
  }
}
Return only raw JSON, no markdown code block wrapper.`;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });

      const text = response.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
         gapAnalysis = JSON.parse(jsonMatch[0]);
      } else {
         throw new Error("Could not parse AI response.");
      }
    } else {
      // Mock Fallback
      const matched = [];
      const missing = [];
      
      const jobLower = jobDescription.toLowerCase();
      const possibleSkills = ["node", "express", "sql", "prisma", "react", "html", "css", "javascript", "typescript", "git", "python", "docker", "aws", "kubernetes"];
      
      possibleSkills.forEach(s => {
        if (jobLower.includes(s)) {
          // Check if user has it
          const userHasSkill = studentSkills.some(us => us.toLowerCase().includes(s));
          if (userHasSkill) {
            matched.push(s.toUpperCase());
          } else {
            missing.push(s.toUpperCase());
          }
        }
      });

      // Default fills if text is too short or doesn't match
      if (matched.length === 0 && studentSkills.length > 0) {
        matched.push(studentSkills[0].toUpperCase());
      }
      if (missing.length === 0) {
        missing.push("NODE.JS", "EXPRESS.JS", "SQL", "DATABASE SECURITY");
      }

      const matchScore = Math.round((matched.length / Math.max(1, (matched.length + missing.length))) * 100);

      gapAnalysis = {
        matchPercentage: matchScore || 60,
        matchedSkills: matched.length > 0 ? matched : ["REACT", "JAVASCRIPT"],
        missingSkills: missing,
        gapRoadmap: {
          title: `Bridge Gap: ${user.targetRole || 'Full Stack Engineer'}`,
          description: `Custom mini-roadmap generated to master missing skills: ${missing.join(', ')}.`,
          steps: [
            {
              day: "Day 1-7",
              title: `Learn backend foundations (${missing[0] || 'NODE.JS'})`,
              tasks: [
                `Set up workspace and environment for ${missing[0] || 'NODE.JS'}`,
                `Learn basic syntax, modules, and API architecture`,
                `Build a mini CRUD server and handle simple endpoints`
              ]
            },
            {
              day: "Day 8-15",
              title: `Database and connection API layers`,
              tasks: [
                `Configure Prisma/SQLite mapping for models`,
                `Write endpoints handling database queries`,
                `Write testing assertions to verify API responses`
              ]
            }
          ]
        }
      };
    }

    res.json(gapAnalysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- STUDY NOTES & AI QUIZZER API ---
app.get('/api/notes', async (req, res) => {
  try {
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'student@example.com', name: 'Student Learner' }
      });
    }
    const notes = await prisma.studyNote.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const { id, title, content } = req.body;
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'student@example.com', name: 'Student Learner' }
      });
    }
    let note;
    if (id) {
      note = await prisma.studyNote.update({
        where: { id: id },
        data: { title, content }
      });
    } else {
      note = await prisma.studyNote.create({
        data: { userId: user.id, title, content }
      });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.studyNote.delete({
      where: { id: id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notes/enhance', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Please enter some notes content to enhance." });
    }

    const hasApiKey = process.env.GEMINI_API_KEY || process.env.GEM_API_KEY;
    let enhancedContent = "";

    if (hasApiKey) {
      const prompt = `You are a professional study assistant and technical editor.
Enhance and clean up the following study notes. Fix grammar, organize into clear markdown headers, highlight key terms, add bullet points, and structure the notes to help the student prepare for professional career roles.

Note Title: ${title || 'Untitled Note'}
Note Content:
"""
${content}
"""

Return only the enhanced note content in markdown. Do not wrap in a JSON payload or extra markdown code block wrapper, just return the raw formatted text.`;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });
      enhancedContent = response.text;
    } else {
      // Mock Fallback
      enhancedContent = `# ${title || 'Untitled Note'} (AI Enhanced)

## 📌 Executive Summary
This document compiles key concepts and definitions from your study session, optimized for rapid review and interview prep.

## 🔑 Key Takeaways & Concepts
*   **Core Concepts**: ${content}
*   **Active Learning Strategy**: Focus on practical implementation and hands-on build scripts.
*   **System Integrity**: Always review corner cases and verify error logs to avoid runtime crashes.

## 🚀 Interview & Career Readiness Action Plan
1.  **Read Official Documentation**: Deepen knowledge of these terms.
2.  **Build a Sandbox Mockup**: Build a micro-project applying these principles.
3.  **Explain Out Loud**: Explain these concepts using the Feynman Technique.

---
*Enhanced by EduNav AI Coach on ${new Date().toLocaleDateString()}*`;
    }

    res.json({ success: true, enhancedContent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notes/generate-quiz', async (req, res) => {
  try {
    const { content, questionCount = 5 } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Please enter some notes content to formulate a quiz." });
    }

    const hasApiKey = process.env.GEMINI_API_KEY || process.env.GEM_API_KEY;
    let quiz = [];

    if (hasApiKey) {
      const prompt = `You are a technical tutor.
Create exactly ${questionCount} multiple-choice questions based ONLY on the following study note content.

Study Note Content:
"""
${content}
"""

Each question must have exactly 4 choices and exactly 1 correct answer.

You MUST return the output as a valid JSON object with the following structure:
{
  "questions": [
    {
      "question": "Question text here...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option B (this must exactly match one of the options text)"
    }
  ]
}
Return only raw JSON, no markdown code block wrapper.`;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });

      const text = response.text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
         const parsed = JSON.parse(jsonMatch[0]);
         quiz = parsed.questions;
      } else {
         throw new Error("Could not parse AI response.");
      }
    } else {
      // Mock Fallback Offline Mode
      const numQuestions = parseInt(questionCount, 10) || 5;
      quiz = [];
      
      for(let i = 0; i < numQuestions; i++) {
        quiz.push({
          question: `[OFFLINE MOCK] Based on your notes, what is the core concept of topic #${i + 1}?`,
          options: [
            `Option A: Implementation ${i + 1}`,
            `Option B: Architecture ${i + 1}`,
            `Option C: Testing ${i + 1}`,
            `Option D: Deployment ${i + 1}`
          ],
          answer: `Option B: Architecture ${i + 1}`
        });
      }
    }

    res.json({ success: true, questions: quiz });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`EduNav Backend listening at http://localhost:${port}`);
});


