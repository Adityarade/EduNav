import React, { useState, useEffect } from 'react';
import { Mail, Phone, Lock, ChevronRight, Activity, Target, BookOpen, Settings, LogOut, CheckCircle2, Circle, ArrowRight, MessageSquare, Send, X, Compass, Award, Flame, Search, Loader2, Star, HelpCircle, TrendingUp, Sparkles, Zap, Globe, Shield, Heart, User, Camera, Timer, PenSquare, BrainCircuit, Download } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email');
  const [isSignUp, setIsSignUp] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Goals and Roadmaps
  const [goals, setGoals] = useState([]);
  const [activeGoalId, setActiveGoalId] = useState(null);
  
  // Roadmap Form Wizard
  const [surveySkill, setSurveySkill] = useState('');
  const [surveyLevel, setSurveyLevel] = useState('Beginner');
  const [surveyCommitment, setSurveyCommitment] = useState('1 hour');
  const [surveyStyle, setSurveyStyle] = useState('Visual');
  const [surveyDuration, setSurveyDuration] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Interview Prep & Resume States
  const [resumeJobTitle, setResumeJobTitle] = useState('');
  const [interviewJobTitle, setInterviewJobTitle] = useState('');
  const [interviewFocusTopic, setInterviewFocusTopic] = useState('');
  const [interviewQuestionCount, setInterviewQuestionCount] = useState(5);
  const [quizQuestionCount, setQuizQuestionCount] = useState(5);
  const [targetJobDescription, setTargetJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeInputMode, setResumeInputMode] = useState('upload'); // 'upload' or 'text'
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [gradingResult, setGradingResult] = useState(null);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  
  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { text: "Hi! I am PathFinder AI, your study guide and app helper. Ask me anything about creating roadmaps or tracking goals!", sender: 'ai' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Student Profile States
  const [profileName, setProfileName] = useState('Student Learner');
  const [profileEmail, setProfileEmail] = useState('student@example.com');
  const [profileMobile, setProfileMobile] = useState('9876543210');
  const [profileBio, setProfileBio] = useState('An aspiring software engineer learning new technologies.');
  const [profileRole, setProfileRole] = useState('Full Stack Engineer');
  const [profileSkills, setProfileSkills] = useState('HTML, CSS, JavaScript, React');
  const [profilePic, setProfilePic] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // --- NEW MODULES STATES ---
  // Pomodoro states
  const [pomodoroTime, setPomodoroTime] = useState(1500); // 25 minutes
  const [pomodoroMode, setPomodoroMode] = useState('focus'); // 'focus' or 'break'
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [studySessions, setStudySessions] = useState([]);
  
  // AI Coach states
  const [coachReport, setCoachReport] = useState(null);
  const [isLoadingCoachReport, setIsLoadingCoachReport] = useState(false);

  // Skill Gap states
  const [gapJobDescription, setGapJobDescription] = useState('');
  const [isAnalyzingGap, setIsAnalyzingGap] = useState(false);
  const [gapResult, setGapResult] = useState(null);
  const [isSavingGapRoadmap, setIsSavingGapRoadmap] = useState(false);

  // Smart Notes states
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isEnhancingNote, setIsEnhancingNote] = useState(false);
  const [quizSelectedNoteId, setQuizSelectedNoteId] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [activeQuizIdx, setActiveQuizIdx] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState('');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Certificate Overlay state
  const [showCertificate, setShowCertificate] = useState(false);

  // Fetch goals from backend on load
  const fetchGoals = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/goals`);
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map(g => {
          if (g.actionPlans && g.actionPlans.length > 0) {
            const plan = g.actionPlans[0];
            return {
              ...g,
              steps: JSON.parse(plan.steps).map((s, idx) => ({ ...s, id: `${g.id}-step-${idx}`, completed: false })),
              resources: JSON.parse(plan.resources)
            };
          }
          return g;
        });
        setGoals(formatted);
        if (formatted.length > 0 && !activeGoalId) {
          setActiveGoalId(formatted[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to fetch goals:", e);
    }
  };

  // Fetch profile from backend on load
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/profile`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setProfileName(data.name || '');
          setProfileEmail(data.email || '');
          setProfileMobile(data.mobile || '');
          setProfileBio(data.bio || '');
          setProfileRole(data.targetRole || '');
          setProfileSkills(data.skills || '');
          setProfilePic(data.profilePic || '');
        }
      }
    } catch (e) {
      console.error("Failed to fetch profile:", e);
    }
  };

  // Save profile to backend
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          mobile: profileMobile,
          bio: profileBio,
          targetRole: profileRole,
          skills: profileSkills,
          profilePic: profilePic
        })
      });
      if (res.ok) {
        alert('Profile settings saved successfully!');
      } else {
        alert('Failed to save profile settings.');
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert('Error connecting to profile API.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Convert uploaded image to Base64
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Profile picture size must be under 2MB!");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result); // Base64 Data URL
    };
    reader.readAsDataURL(file);
  };

  // --- NEW FETCH HELPER FUNCTIONS ---
  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/notes`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
        if (data.length > 0) {
          if (!activeNoteId) {
            setActiveNoteId(data[0].id);
            setNoteTitle(data[0].title);
            setNoteContent(data[0].content);
          }
          setQuizSelectedNoteId(prev => prev || data[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
    }
  };

  const fetchStudySessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/study-sessions`);
      if (res.ok) {
        const data = await res.json();
        setStudySessions(data);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  };

  const fetchCoachReport = async () => {
    setIsLoadingCoachReport(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai-coach-report`);
      if (res.ok) {
        const data = await res.json();
        setCoachReport(data);
      }
    } catch (err) {
      console.error("Error fetching coach report:", err);
    } finally {
      setIsLoadingCoachReport(false);
    }
  };

  // Pomodoro Completion handler
  const handleTimerCompletion = async () => {
    setIsTimerRunning(false);
    if (pomodoroMode === 'focus') {
      alert("🎉 Focus session completed! Logging session...");
      try {
        const res = await fetch(`${API_BASE}/api/study-sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ durationMinutes: 25 })
        });
        if (res.ok) {
          fetchStudySessions();
          fetchCoachReport(); // Refresh coach report metrics
        }
      } catch (err) {
        console.error("Error logging study session:", err);
      }
      setPomodoroMode('break');
      setPomodoroTime(5 * 60); // 5 minutes break
    } else {
      alert("☕ Break completed! Ready to focus?");
      setPomodoroMode('focus');
      setPomodoroTime(25 * 60); // 25 minutes focus
    }
  };

  // Skill Gap Analyzer handlers
  const handleAnalyzeGap = async (e) => {
    e.preventDefault();
    if (!gapJobDescription.trim()) return;
    setIsAnalyzingGap(true);
    setGapResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/analyze-gap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: gapJobDescription })
      });
      if (res.ok) {
        const data = await res.json();
        setGapResult(data);
      }
    } catch (err) {
      console.error("Error analyzing gap:", err);
    } finally {
      setIsAnalyzingGap(false);
    }
  };

  const handleSaveGapRoadmap = async () => {
    if (!gapResult?.gapRoadmap) return;
    setIsSavingGapRoadmap(true);
    try {
      const res = await fetch(`${API_BASE}/api/generate-roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill: gapResult.gapRoadmap.title,
          level: 'Intermediate',
          timeCommitment: '2 hours',
          learningStyle: 'Practical',
          duration: 30
        })
      });
      if (res.ok) {
        alert("Gap Roadmap integrated successfully! Check your 'My Roadmaps' tab.");
        fetchGoals();
      }
    } catch (err) {
      console.error("Error saving gap roadmap:", err);
    } finally {
      setIsSavingGapRoadmap(false);
    }
  };

  // Smart Notes handlers
  const handleSelectNote = (note) => {
    setActiveNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setQuizQuestions([]);
    setQuizCompleted(false);
  };

  const handleCreateNote = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Note', content: '' })
      });
      if (res.ok) {
        const newNote = await res.json();
        setNotes(prev => [newNote, ...prev]);
        handleSelectNote(newNote);
      }
    } catch (err) {
      console.error("Error creating note:", err);
    }
  };

  const handleSaveNote = async () => {
    if (!activeNoteId) return;
    setIsSavingNote(true);
    try {
      const res = await fetch(`${API_BASE}/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeNoteId, title: noteTitle, content: noteContent })
      });
      if (res.ok) {
        const updated = await res.json();
        setNotes(prev => prev.map(n => n.id === activeNoteId ? updated : n));
      }
    } catch (err) {
      console.error("Error saving note:", err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/notes/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== id));
        if (activeNoteId === id) {
          setActiveNoteId(null);
          setNoteTitle('');
          setNoteContent('');
        }
      }
    } catch (err) {
      console.error("Error deleting note:", err);
    }
  };

  const handleEnhanceNote = async () => {
    if (!activeNoteId || !noteContent.trim()) return;
    setIsEnhancingNote(true);
    try {
      const res = await fetch(`${API_BASE}/api/notes/enhance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: noteTitle, content: noteContent })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNoteContent(data.enhancedContent);
          // Auto-save the enhanced content immediately in the DB
          const saveRes = await fetch(`${API_BASE}/api/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: activeNoteId, title: noteTitle, content: data.enhancedContent })
          });
          if (saveRes.ok) {
            const updated = await saveRes.json();
            setNotes(prev => prev.map(n => n.id === activeNoteId ? updated : n));
          }
        }
      }
    } catch (err) {
      console.error("Error enhancing note:", err);
    } finally {
      setIsEnhancingNote(false);
    }
  };

  const handleGenerateQuiz = async () => {
    const selectedNote = notes.find(n => n.id === quizSelectedNoteId) || notes.find(n => n.id === activeNoteId);
    const content = selectedNote ? selectedNote.content : noteContent;

    if (!content || !content.trim()) {
      alert("Please select or type note contents first!");
      return;
    }
    setIsGeneratingQuiz(true);
    setQuizQuestions([]);
    setQuizCompleted(false);
    setQuizScore(0);
    setActiveQuizIdx(0);
    setSelectedQuizOption('');

    try {
      const res = await fetch(`${API_BASE}/api/notes/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, questionCount: parseInt(quizQuestionCount, 10) })
      });
      if (res.ok) {
        const data = await res.json();
        setQuizQuestions(data.questions);
      }
    } catch (err) {
      console.error("Error generating quiz:", err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSubmitQuizAnswer = () => {
    const currentQ = quizQuestions[activeQuizIdx];
    if (!selectedQuizOption || !currentQ) return;

    if (selectedQuizOption === currentQ.answer) {
      setQuizScore(prev => prev + 1);
    }

    if (activeQuizIdx < quizQuestions.length - 1) {
      setActiveQuizIdx(prev => prev + 1);
      setSelectedQuizOption('');
    } else {
      setQuizCompleted(true);
    }
  };

  // Pomodoro countdown timer interval
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(prev => prev - 1);
      }, 1000);
    } else if (isTimerRunning && pomodoroTime === 0) {
      handleTimerCompletion();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroTime, pomodoroMode]);

  // Auth startup sync hook
  useEffect(() => {
    if (isLoggedIn) {
      fetchGoals();
      fetchProfile();
      fetchNotes();
      fetchStudySessions();
      fetchCoachReport();
    }
  }, [isLoggedIn]);



  // Handle roadmap generation submission
  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    if (!surveySkill.trim()) return;
    setIsGenerating(true);

    try {
      const response = await fetch(`${API_BASE}/api/generate-roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skill: surveySkill,
          level: surveyLevel,
          timeCommitment: surveyCommitment,
          learningStyle: surveyStyle,
          duration: surveyDuration
        })
      });

      if (response.ok) {
        const newRoadmap = await response.json();
        const formattedRoadmap = {
          id: newRoadmap.goalId,
          title: newRoadmap.title,
          description: newRoadmap.description,
          steps: newRoadmap.steps.map((s, idx) => ({ ...s, id: `${newRoadmap.goalId}-step-${idx}`, completed: false })),
          resources: newRoadmap.resources
        };

        setGoals(prev => [formattedRoadmap, ...prev]);
        setActiveGoalId(newRoadmap.goalId);
        setActiveTab('goals'); 
        setSurveySkill(''); 
      }
    } catch (err) {
      console.error("Error generating roadmap:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle step completion status
  const toggleStepCompletion = (stepId) => {
    setGoals(prevGoals => {
      return prevGoals.map(goal => {
        if (goal.steps) {
          return {
            ...goal,
            steps: goal.steps.map(step => {
              if (step.id === stepId) {
                return { ...step, completed: !step.completed };
              }
              return step;
            })
          };
        }
        return goal;
      });
    });
  };

  // Send chatbot query
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { text: chatInput, sender: 'user' };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { text: data.reply, sender: 'ai' }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages(prev => [...prev, { text: "Sorry, I am having trouble connecting to the pathfinder server. Please check again in a bit!", sender: 'ai' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Handle resume upload analysis only
  const handleAnalyzeResume = async (e) => {
    e.preventDefault();
    if (!resumeJobTitle.trim()) {
      alert("Please specify a target job title!");
      return;
    }
    if (resumeInputMode === 'upload' && !resumeFile) {
      alert("Please upload your resume PDF or TXT file, or switch to 'Paste Text' mode.");
      return;
    }
    if (resumeInputMode === 'text' && !resumeText.trim()) {
      alert("Please paste your resume text.");
      return;
    }

    setIsAnalyzing(true);
    setAtsResult(null);
    setGradingResult(null);

    const formData = new FormData();
    if (resumeInputMode === 'upload' && resumeFile) {
      formData.append('resume', resumeFile);
    } else {
      formData.append('resumeText', resumeText);
    }
    formData.append('targetJobTitle', resumeJobTitle);
    formData.append('targetJobDescription', targetJobDescription);

    try {
      const response = await fetch(`${API_BASE}/api/analyze-resume`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setAtsResult(data.analysis);
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`Analysis failed: ${errData.error || response.statusText || 'Server error'}`);
      }
    } catch (err) {
      console.error("Resume analysis error:", err);
      alert(`Network error: ${err.message || 'Failed to connect to the backend server.'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate mock interview questions based on job title and resume skills
  const handleGenerateQuestions = async (e, customTitle) => {
    if (e && e.preventDefault) e.preventDefault();
    const titleToUse = customTitle || interviewJobTitle;
    if (!titleToUse.trim()) {
      alert("Please specify a target job title!");
      return;
    }
    setIsGeneratingQuestions(true);
    setInterviewQuestions([]);
    setGradingResult(null);
    setUserAnswer('');

    try {
      const qRes = await fetch(`${API_BASE}/api/generate-interview-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetJobTitle: titleToUse,
          resumeSkills: atsResult?.parsedDetails?.skills || [],
          focusTopic: interviewFocusTopic,
          questionCount: parseInt(interviewQuestionCount, 10)
        })
      });

      if (qRes.ok) {
        const qData = await qRes.json();
        setInterviewQuestions(qData.questions);
        setActiveQuestionIdx(0);
      }
    } catch (err) {
      console.error("Error generating interview questions:", err);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Grade candidate typed response
  const handleGradeAnswer = async (e) => {
    e.preventDefault();
    const currentQ = interviewQuestions[activeQuestionIdx];
    if (!currentQ || !userAnswer.trim()) return;
    setIsGrading(true);
    setGradingResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/grade-interview-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ.question,
          answer: userAnswer
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGradingResult(data.grading);
      }
    } catch (err) {
      console.error("Grading error:", err);
    } finally {
      setIsGrading(false);
    }
  };

  // Calculations for dashboard and progress
  const activeGoal = goals.find(g => g.id === activeGoalId) || goals[0];
  
  const totalSteps = activeGoal?.steps ? activeGoal.steps.length : 0;
  const completedSteps = activeGoal?.steps ? activeGoal.steps.filter(s => s.completed).length : 0;

  const totalTasks = activeGoal?.steps ? activeGoal.steps.reduce((acc, step) => acc + step.tasks.length, 0) : 0;
  const completedTasks = activeGoal?.steps ? activeGoal.steps.reduce((acc, step) => {
    return acc + (step.completed ? step.tasks.length : 0);
  }, 0) : 0;

  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getRoadmapProgress = (goal) => {
    if (!goal?.steps) return 0;
    const totalT = goal.steps.reduce((acc, step) => acc + step.tasks.length, 0);
    const completedT = goal.steps.reduce((acc, step) => {
      return acc + (step.completed ? step.tasks.length : 0);
    }, 0);
    return totalT > 0 ? Math.round((completedT / totalT) * 100) : 0;
  };

  // Determine Knowledge Level rating
  const getKnowledgeRating = () => {
    if (totalSteps === 0) return { stars: 0, label: "Not Started", color: "text-slate-400" };
    const ratio = completedSteps / totalSteps;
    if (ratio === 0) return { stars: 0, label: "Not Started", color: "text-slate-400" };
    if (ratio < 0.35) return { stars: 2, label: "Novice (Level 1)", color: "text-orange-500" };
    if (ratio < 0.7) return { stars: 3, label: "Apprentice (Level 2)", color: "text-indigo-600" };
    if (ratio < 1) return { stars: 4, label: "Competent (Level 3)", color: "text-pink-600" };
    return { stars: 5, label: "Expert (Level 4)", color: "text-emerald-600" };
  };

  const knowledge = getKnowledgeRating();

  const getNextFocus = () => {
    if (!activeGoal?.steps) return "Generate a study flow to start!";
    const nextUncompletedStep = activeGoal.steps.find(s => !s.completed);
    if (!nextUncompletedStep) return "Awesome! You completed this entire roadmap. Pick a new skill!";
    return `Next Up: ${nextUncompletedStep.title} (${nextUncompletedStep.day})`;
  };

  const getUpskillRecommendations = () => {
    if (!activeGoal) return [
      { name: "Fullstack Web Dev", match: "High Match", level: "Beginner", color: "from-sky-500 to-indigo-500", badgeColor: "bg-sky-50 text-sky-700 border-sky-100" },
      { name: "UI/UX Design", match: "Trending", level: "Intermediate", color: "from-purple-500 to-pink-500", badgeColor: "bg-purple-50 text-purple-700 border-purple-100" }
    ];
    const title = activeGoal.title.toLowerCase();
    if (title.includes('machine') || title.includes('ai') || title.includes('python')) {
      return [
        { name: "Deep Learning Foundations", match: "98% Match", level: "Intermediate", color: "from-purple-500 to-indigo-500", badgeColor: "bg-purple-50 text-purple-700 border-purple-100" },
        { name: "Data Visualization with Seaborn", match: "92% Match", level: "Beginner", color: "from-teal-500 to-emerald-500", badgeColor: "bg-teal-50 text-teal-700 border-teal-100" },
        { name: "MLOps & Model Deployment", match: "Trending", level: "Advanced", color: "from-rose-500 to-orange-500", badgeColor: "bg-rose-50 text-rose-700 border-rose-100" }
      ];
    }
    return [
      { name: "React Framework (Next.js)", match: "95% Match", level: "Intermediate", color: "from-blue-500 to-indigo-500", badgeColor: "bg-blue-50 text-blue-700 border-blue-100" },
      { name: "Tailwind CSS Styling", match: "90% Match", level: "Beginner", color: "from-pink-500 to-purple-500", badgeColor: "bg-pink-50 text-pink-700 border-pink-100" },
      { name: "Backend APIs with Express", match: "Trending", level: "Intermediate", color: "from-emerald-500 to-teal-500", badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100" }
    ];
  };

  // ---------------- LANDING PAGE VIEW ----------------
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#EEF2F6] via-[#F1F0FD] to-[#FDF2F8] flex flex-col font-sans relative overflow-x-hidden">
        
        {/* Navigation Header */}
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-indigo-100/40 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto w-full rounded-b-2xl shadow-sm">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <img src="./icon.png" alt="EduNav Logo" className="w-9 h-9 rounded-xl shadow-md transform group-hover:rotate-6 transition-transform duration-300" />
            <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">EduNav</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#about" className="hover:text-indigo-600 transition-colors">About</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">How it works</a>
            <a href="#services" className="hover:text-indigo-600 transition-colors">Services</a>
            <a href="#testimonials" className="hover:text-indigo-600 transition-colors">Testimonials</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
          </nav>

          <button onClick={() => setShowLoginModal(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-indigo-500/25 hover:shadow-lg transition-all duration-300 transform active:scale-95">
            Sign In
          </button>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 text-center space-y-8 relative z-10 flex-1 flex flex-col justify-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-wide uppercase text-indigo-700 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
            <Sparkles className="w-4 h-4" /> AI-Driven Student Navigator
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl mx-auto">
            Discover your path. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
              Automate your learning roadmaps.
            </span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Enter any skill you want to learn, and let our student-centric AI generate custom checkable day-by-day study flows, recommend free resources, and rate your knowledge level.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button onClick={() => setShowLoginModal(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-500/30 hover:scale-105 transition-all duration-300">
              Start Navigating Now
            </button>
            <a href="#how-it-works" className="bg-white border border-slate-200 text-slate-700 font-bold px-8 py-4 rounded-2xl hover:bg-slate-50 hover:shadow-sm transition-all duration-300 flex items-center justify-center gap-2">
              Learn More <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="bg-white py-24 border-y border-indigo-100/30">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-2">Our Mission</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Designed by Students, Built for Learners
              </h2>
              <p className="text-slate-500 mt-4 leading-relaxed">
                EduNav AI was created to simplify the complex world of online learning. Instead of scrolling through hundreds of tutorials, our system crafts a cohesive, day-by-day curriculum tailored to your commit time and current level.
              </p>
              <div className="mt-8 flex gap-6">
                <div className="flex flex-col">
                  <span className="font-extrabold text-3xl text-indigo-600">100%</span>
                  <span className="text-xs font-bold text-slate-400 mt-1 uppercase">Free Resources</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-3xl text-purple-600">10x</span>
                  <span className="text-xs font-bold text-slate-400 mt-1 uppercase">Faster Navigation</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-10"></div>
              <div className="relative bg-[#F8FAFC] border border-slate-100 rounded-3xl p-8 space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600"><Compass className="w-5 h-5" /></div>
                  <h4 className="font-extrabold text-slate-800">Custom Roadmap generation</h4>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-xl text-purple-600"><Star className="w-5 h-5" /></div>
                  <h4 className="font-extrabold text-slate-800">Knowledge rating stars</h4>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-pink-100 p-2 rounded-xl text-pink-600"><MessageSquare className="w-5 h-5" /></div>
                  <h4 className="font-extrabold text-slate-800">PathFinder chat assistant</h4>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-widest block mb-2">Process</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">How It Works</h2>
            <p className="text-slate-500 mt-2 text-sm md:text-base">Get a complete visual learning path in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-4 relative group">
              <span className="absolute -top-6 left-8 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-extrabold text-lg w-12 h-12 rounded-2xl flex items-center justify-center shadow-md shadow-indigo-500/20">1</span>
              <h3 className="font-extrabold text-slate-900 text-xl pt-4">Enter Your Goal</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Specify the skill you want to master (e.g. machine learning, database management), and select your commit hours.</p>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-4 relative group">
              <span className="absolute -top-6 left-8 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-extrabold text-lg w-12 h-12 rounded-2xl flex items-center justify-center shadow-md shadow-purple-500/20">2</span>
              <h3 className="font-extrabold text-slate-900 text-xl pt-4">Get AI Roadmap</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Our system builds checkable modules and retrieves top-rated, free YouTube crash courses matching your style.</p>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-4 relative group">
              <span className="absolute -top-6 left-8 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-extrabold text-lg w-12 h-12 rounded-2xl flex items-center justify-center shadow-md shadow-pink-500/20">3</span>
              <h3 className="font-extrabold text-slate-900 text-xl pt-4">Track Consistency</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Check off milestones, watch your knowledge level stars rise, and talk to Pathfinder AI to solve queries.</p>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="bg-white py-24 border-t border-indigo-100/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold text-pink-600 uppercase tracking-widest block mb-2">Our Offerings</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Our Services</h2>
              <p className="text-slate-500 mt-2 text-sm md:text-base">We provide all resources required for student learning journeys.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-6 rounded-3xl border border-indigo-100/40 space-y-3">
                <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600 w-fit"><Compass className="w-6 h-6" /></div>
                <h4 className="font-extrabold text-slate-900">Custom Roadmaps</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Personalized daily study milestones aligned to beginner/advanced choices.</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-6 rounded-3xl border border-purple-100/40 space-y-3">
                <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600 w-fit"><Activity className="w-6 h-6" /></div>
                <h4 className="font-extrabold text-slate-900">Visual Analytics</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Line chart graphs and ring gauges tracking task completion rates.</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500/5 to-rose-500/5 p-6 rounded-3xl border border-pink-100/40 space-y-3">
                <div className="bg-pink-100 p-2.5 rounded-xl text-pink-600 w-fit"><BookOpen className="w-6 h-6" /></div>
                <h4 className="font-extrabold text-slate-900">Free Curations</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Highly rated, structured YouTube playlists and documents.</p>
              </div>
              <div className="bg-gradient-to-br from-teal-500/5 to-emerald-500/5 p-6 rounded-3xl border border-teal-100/40 space-y-3">
                <div className="bg-teal-100 p-2.5 rounded-xl text-teal-600 w-fit"><MessageSquare className="w-6 h-6" /></div>
                <h4 className="font-extrabold text-slate-900">PathFinder Guide</h4>
                <p className="text-xs text-slate-500 leading-relaxed">Chatbot help answering general queries about studying or navigation.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="bg-[#F8FAFC]/40 py-24 border-t border-indigo-100/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-2">Success Stories</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                What Our Students Say
              </h2>
              <p className="text-slate-500 mt-2 text-sm md:text-base font-medium">
                Real feedback from students who transformed their learning journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex gap-0.5 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <p className="text-slate-600 text-sm leading-relaxed italic">
                  "EduNav helped me learn Machine Learning in 30 days! The day-by-day modules and recommended free YouTube resources were absolutely spot-on."
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                    SJ
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">Sarah Jenkins</h4>
                    <span className="text-xs text-slate-400">Computer Science Student</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex gap-0.5 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <p className="text-slate-600 text-sm leading-relaxed italic">
                  "PathFinder AI chatbot answered all my questions while learning React. It feels like having a personal tutor available 24/7."
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                    AC
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">Alex Chen</h4>
                    <span className="text-xs text-slate-400">Self-Taught Developer</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="flex gap-0.5 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <p className="text-slate-600 text-sm leading-relaxed italic">
                  "The daily study flows and consistency tracker kept me focused. Love the visual charts and the star ratings for knowledge gained."
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                    MS
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">Maria Santos</h4>
                    <span className="text-xs text-slate-400">High School Student</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 max-w-7xl mx-auto px-6 border-t border-indigo-100/30">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-purple-600 uppercase tracking-widest block mb-2">Simple Pricing</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              100% Free, Forever
            </h2>
            <p className="text-slate-500 mt-2 text-sm md:text-base font-medium">
              Education should be accessible to everyone. Start learning without any barriers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
                  Free Starter
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">$0</span>
                  <span className="text-slate-400 text-sm">/ month</span>
                </div>
                <p className="text-slate-500 text-sm">Perfect for absolute beginners testing out new subjects.</p>
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                    <span>Up to 2 active roadmaps</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                    <span>Standard AI generation speed</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                    <span>Access to free youtube curations</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowLoginModal(true)} className="w-full py-3 px-4 border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition">
                Get Started
              </button>
            </div>

            {/* Student Pro Plan Card (Highlights) */}
            <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 border border-indigo-950 shadow-xl space-y-6 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-xl"></div>
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-200 bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 rounded-full">
                    Student Pro
                  </span>
                  <span className="text-xs text-yellow-400 font-bold">Popular</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$0</span>
                  <span className="text-slate-400 text-sm">/ month</span>
                </div>
                <p className="text-slate-300 text-sm font-medium">For active learners looking for unlimited progress tracking.</p>
                <div className="border-t border-slate-800 pt-4 space-y-3">
                  <div className="flex items-center gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    <span>Unlimited custom roadmaps</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    <span>Priority AI generation speed</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    <span>Unlimited PathFinder AI Chat guidance</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    <span>Advanced knowledge rating analytics</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowLoginModal(true)} className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition relative z-10 border border-transparent">
                Claim Free Upgrade
              </button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-2">Q&A</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800">Is EduNav free to use?</h4>
              <p className="text-slate-500 text-sm mt-2">Yes! We prioritize curated open-source documents, textbooks, and free YouTube courses to keep learning completely free.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800">How is the knowledge rating calculated?</h4>
              <p className="text-slate-500 text-sm mt-2">It is based on the completion of the roadmap steps. Completing more milestones increases your level up to an Expert (5 stars).</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-950 text-white py-12 px-6 border-t border-slate-800 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <img src="./icon.png" alt="EduNav Logo" className="w-6 h-6 rounded-md shadow-sm" />
              <span className="font-extrabold text-base tracking-tight">EduNav AI</span>
            </div>

            {/* Aditya Footer Signature & copyright */}
            <div className="text-center md:text-right space-y-1">
              <p className="text-slate-400 text-sm flex items-center justify-center md:justify-end gap-1.5 font-medium">
                Made with love ❤️ by <span className="font-bold text-white ml-1">Aditya</span>
              </p>
              <p className="text-slate-500 text-xs font-medium">
                &copy; {new Date().getFullYear()} EduNav AI. All rights reserved.
              </p>
            </div>
          </div>
        </footer>

        {/* Auth / Login Modal Overlay */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden bg-slate-900/60 backdrop-blur-md transition-opacity duration-500">
            
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
              <div className="absolute w-[40rem] h-[40rem] bg-indigo-500/40 rounded-full blur-3xl mix-blend-screen animate-blob animation-delay-2000"></div>
              <div className="absolute top-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-purple-500/40 rounded-full blur-3xl mix-blend-screen animate-blob animation-delay-4000"></div>
              <div className="absolute bottom-[-20%] left-[10%] w-[45rem] h-[45rem] bg-pink-500/40 rounded-full blur-3xl mix-blend-screen animate-blob"></div>
            </div>

            <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] p-10 max-w-md w-full shadow-[0_0_60px_-15px_rgba(99,102,241,0.6)] border border-white/60 relative animate-modal-enter overflow-hidden z-10">
              {/* Colorful Top Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500"></div>

              <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 relative z-10">
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6 relative z-10">
                <h3 className="text-2xl font-extrabold text-slate-900">
                  {isSignUp ? 'Create an Account' : 'Welcome Back'}
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  {isSignUp ? 'Start your learning journey today.' : 'Enter your details to sign in to your dashboard.'}
                </p>
              </div>

              {/* Sliding Tab Selector */}
              <div className="flex mb-6 bg-slate-100 p-1 rounded-xl relative z-10">
                <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ${loginMethod === 'email' ? 'left-1' : 'left-[calc(50%+2px)]'}`}></div>
                <button onClick={() => setLoginMethod('email')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg z-10 transition-all ${loginMethod === 'email' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}>Email</button>
                <button onClick={() => setLoginMethod('mobile')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg z-10 transition-all ${loginMethod === 'mobile' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}>Mobile</button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); setShowLoginModal(false); }} className="space-y-4 relative z-10">
                <div className="transition-all duration-300">
                  <label className="block text-xs font-bold text-slate-700 mb-1">{loginMethod === 'email' ? 'Email Address' : 'Mobile Number'}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-500">
                      {loginMethod === 'email' ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                    </div>
                    {/* Key property forces input remount & triggers the slide-up animation */}
                    <input key={loginMethod} type="text" required className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white animate-slide-up" placeholder={loginMethod === 'email' ? 'you@example.com' : '+1 (555) 000-0000'} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input type="password" required className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white" placeholder="••••••••" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" className="h-3.5 w-3.5 text-indigo-600 focus:ring-indigo-600 border-slate-300 rounded" />
                    <span className="ml-1.5 text-slate-600 font-medium">Remember me</span>
                  </label>
                  <a href="#" className="font-semibold text-indigo-600">Forgot password?</a>
                </div>

                <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2.5 rounded-xl shadow-md transition mt-4">
                  {isSignUp ? 'Create Account' : 'Log In'}
                </button>
              </form>

              <div className="mt-5 text-center text-xs text-slate-500 relative z-10">
                {isSignUp ? 'Or sign up via Google with the icon:' : 'Or log in via Google with the icon:'}
                <button onClick={() => { setIsLoggedIn(true); setShowLoginModal(false); }} className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition font-bold text-slate-600">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  {isSignUp ? 'Sign up with Google' : 'Login with Google'}
                </button>
                
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-sm font-medium">
                  <span className="text-slate-500">
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}
                  </span>
                  <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-indigo-600 hover:text-indigo-700 transition font-bold">
                    {isSignUp ? "Log In" : "Create new account"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------------- AUTHENTICATED DASHBOARD VIEW ----------------
  return (
    <>
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans relative print:hidden">
      
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-white border-r border-slate-200 px-4 py-6 flex flex-col hidden md:flex">
        <div className="flex items-center gap-2.5 mb-10 px-2 group cursor-pointer">
          <img src="./icon.png" alt="EduNav Logo" className="w-8 h-8 rounded-xl shadow-md transform group-hover:rotate-6 transition-transform duration-300" />
          <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">EduNav</span>
        </div>
        
        <div className="space-y-1 flex-1">
          <button onClick={() => { setActiveTab('dashboard'); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <Activity className="w-5 h-5" />
            Dashboard
          </button>
          <button onClick={() => { setActiveTab('create-roadmap'); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${activeTab === 'create-roadmap' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <Compass className="w-5 h-5" />
            Create Roadmap
          </button>
          <button onClick={() => { setActiveTab('goals'); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${activeTab === 'goals' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <Target className="w-5 h-5" />
            My Roadmaps ({goals.length})
          </button>
          <button onClick={() => { setActiveTab('resume-analyzer'); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${activeTab === 'resume-analyzer' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <BookOpen className="w-5 h-5" />
            Resume Analyzer
          </button>
          <button onClick={() => { setActiveTab('interview-prep'); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${activeTab === 'interview-prep' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <Award className="w-5 h-5" />
            Interview Prep
          </button>
          <button onClick={() => { setActiveTab('notes'); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${activeTab === 'notes' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <PenSquare className="w-5 h-5" />
            Smart Notes
          </button>
          <button onClick={() => { setActiveTab('quizzer'); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${activeTab === 'quizzer' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <HelpCircle className="w-5 h-5" />
            AI Quizzer
          </button>
          <button onClick={() => { setActiveTab('gap-analyzer'); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${activeTab === 'gap-analyzer' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <BrainCircuit className="w-5 h-5" />
            Skill Gap Analyzer
          </button>
          <button onClick={() => { setActiveTab('profile'); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
            <User className="w-5 h-5" />
            My Profile
          </button>
        </div>


        <div className="pt-6 border-t border-slate-100 mb-4 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-indigo-500/20 bg-indigo-50 flex items-center justify-center text-indigo-700 font-extrabold text-sm shrink-0">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{profileName ? profileName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'ST'}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800 truncate">{profileName}</p>
              <p className="text-[10px] text-slate-400 font-semibold truncate">{profileRole || 'Aspiring Professional'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-1 pt-4 border-t border-slate-100">
          <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl font-semibold transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-h-screen overflow-y-auto pb-24">
        {/* Mobile Header */}
        <div className="flex md:hidden justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <img src="./icon.png" alt="EduNav Logo" className="w-7 h-7 rounded-lg shadow-md transform group-hover:rotate-6 transition-transform duration-300" />
            <span className="text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">EduNav</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsChatOpen(!isChatOpen)} className="text-indigo-600 bg-indigo-50 p-2 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </button>
            <button onClick={() => setActiveTab('profile')} className="w-8 h-8 rounded-full overflow-hidden border border-indigo-500/20 bg-indigo-50 flex items-center justify-center text-indigo-700 font-extrabold text-xs shrink-0">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{profileName ? profileName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'ST'}</span>
              )}
            </button>
            <button onClick={() => setIsLoggedIn(false)} className="text-slate-500">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>


        <div className="max-w-5xl mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
                <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500/30 bg-indigo-50 flex items-center justify-center text-indigo-700 font-extrabold text-xl shrink-0 shadow-sm">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span>{profileName ? profileName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'ST'}</span>
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back, {profileName}! 👋</h1>
                    <p className="text-indigo-600 text-sm font-semibold mt-0.5">{profileRole || 'Aspiring Professional'}</p>
                    <p className="text-slate-500 text-xs mt-1 max-w-xl italic">"{profileBio || 'Learning, growing, and navigating my goals.'}"</p>
                  </div>
                </div>
                <button onClick={() => setActiveTab('profile')} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-indigo-100/50 transition-colors shrink-0 relative z-10 shadow-sm">
                  Edit Profile
                </button>
              </div>


              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Left Column: Core Stats */}
                <div className="xl:col-span-2 space-y-6">
                  
                  {activeGoal ? (
                    <div className="bg-white rounded-[2rem] p-8 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-indigo-50/50 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/80 rounded-full blur-3xl -mr-20 -mt-20 opacity-70"></div>
                      <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
                        <div className="space-y-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase text-purple-700 bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-100/50">
                            Active Learning Flow
                          </span>
                          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{activeGoal.title}</h2>
                          <p className="text-slate-500 text-sm max-w-md leading-relaxed">{activeGoal.description}</p>
                          
                          <div className="flex items-center gap-2 pt-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2.5 rounded-2xl border border-indigo-100/50 w-fit">
                            <span className="text-xs font-bold text-indigo-700">Knowledge Level:</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className={`w-4 h-4 ${s <= knowledge.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                              ))}
                            </div>
                            <span className={`text-xs font-extrabold ${knowledge.color}`}>{knowledge.label}</span>
                          </div>
                        </div>
                        
                        <div className="relative w-28 h-28 shrink-0 self-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-purple-600" strokeWidth="3.5" strokeDasharray={`${progressPercent}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-extrabold text-slate-800">{progressPercent}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="relative z-10 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-purple-100/60 rounded-2xl p-4 mt-6 flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold text-purple-700 block uppercase tracking-wider">Recommended Next Focus</span>
                          <span className="text-sm text-slate-800 font-bold block mt-1">{getNextFocus()}</span>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-600">Tasks Completed: {completedTasks} / {totalTasks}</span>
                        <button onClick={() => setActiveTab('goals')} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                          View Full Roadmap <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 text-center">
                      <Award className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                      <h3 className="font-bold text-slate-800 text-xl">No active study flows</h3>
                      <p className="text-slate-500 mt-2 max-w-sm mx-auto">Create a customized, AI-driven learning roadmap to kickstart your journey!</p>
                      <button onClick={() => setActiveTab('create-roadmap')} className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md hover:from-indigo-700 hover:to-purple-700 transition">
                        Get Started
                      </button>
                    </div>
                  )}

                  {activeGoal && (
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-indigo-50/30">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-900 text-lg">Performance Analytics</h3>
                        <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-md">Roadmap Progress Over Time</span>
                      </div>
                      <div className="w-full h-48 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-100 p-4 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute inset-0 flex flex-col justify-between p-4 py-8 pointer-events-none">
                          <div className="border-b border-dashed border-slate-200 w-full h-px"></div>
                          <div className="border-b border-dashed border-slate-200 w-full h-px"></div>
                          <div className="border-b border-dashed border-slate-200 w-full h-px"></div>
                        </div>
                        <svg className="w-full h-full relative z-10" viewBox="0 0 300 100" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d={`M 0 100 L 0 ${100 - (progressPercent * 0.2)} L 100 ${100 - (progressPercent * 0.45)} L 200 ${100 - (progressPercent * 0.75)} L 300 ${100 - (progressPercent * 1.0)} L 300 100 Z`} fill="url(#chartGrad)" />
                          <path d={`M 0 ${100 - (progressPercent * 0.2)} L 100 ${100 - (progressPercent * 0.45)} L 200 ${100 - (progressPercent * 0.75)} L 300 ${100 - (progressPercent * 1.0)}`} fill="none" stroke="url(#lineGrad)" strokeWidth="3.5" strokeLinecap="round" />
                          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#6366F1" />
                            <stop offset="50%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#EC4899" />
                          </linearGradient>
                          <circle cx="0" cy={100 - (progressPercent * 0.2)} r="4" fill="#6366F1" stroke="white" strokeWidth="2" />
                          <circle cx="100" cy={100 - (progressPercent * 0.45)} r="4" fill="#8B5CF6" stroke="white" strokeWidth="2" />
                          <circle cx="200" cy={100 - (progressPercent * 0.75)} r="4" fill="#D946EF" stroke="white" strokeWidth="2" />
                          <circle cx="300" cy={100 - (progressPercent * 1.0)} r="5" fill="#EC4899" stroke="white" strokeWidth="2.5" />
                        </svg>
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 z-10">
                          <span>Day 1</span>
                          <span>Midpoint</span>
                          <span>Current Stage</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Streaks & Study Widgets */}
                <div className="space-y-6">
                  
                  {/* Pomodoro Timer Widget */}
                  <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden space-y-4">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-500/10 to-orange-500/10 rounded-full blur-xl"></div>
                    <div className="flex justify-between items-center relative z-10">
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        <Timer className="w-5 h-5 text-rose-500" />
                        Focus Timer
                      </h3>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${pomodoroMode === 'focus' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                        {pomodoroMode === 'focus' ? 'Focus Block' : 'Break Time'}
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center py-4 relative z-10">
                      {/* Timer Display */}
                      <span className="text-4xl font-black text-slate-800 tracking-tight">
                        {Math.floor(pomodoroTime / 60)}:{String(pomodoroTime % 60).padStart(2, '0')}
                      </span>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">
                        {pomodoroMode === 'focus' ? 'Stay focused for 25 minutes' : 'Take a short 5-minute break'}
                      </p>

                      <div className="flex gap-2 mt-4 w-full">
                        <button type="button" onClick={() => setIsTimerRunning(!isTimerRunning)} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${isTimerRunning ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-rose-500/20 hover:shadow-md'}`}>
                          {isTimerRunning ? 'Pause' : 'Start'}
                        </button>
                        <button type="button" onClick={() => { setIsTimerRunning(false); setPomodoroTime(pomodoroMode === 'focus' ? 1500 : 300); }} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs font-bold transition-all">
                          Reset
                        </button>
                      </div>

                      {/* Fast Forward debug option to complete in 5s */}
                      <button type="button" onClick={() => { setPomodoroTime(5); }} className="text-[8px] text-slate-400 hover:text-slate-500 font-bold mt-2 hover:underline uppercase tracking-widest">
                        Test Completion (5s)
                      </button>
                    </div>
                  </div>

                  {/* AI Coach Widget */}
                  <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden space-y-4">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-xl"></div>
                    <div className="flex justify-between items-center relative z-10">
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-indigo-500" />
                        AI Study Coach
                      </h3>
                      <button type="button" onClick={fetchCoachReport} disabled={isLoadingCoachReport} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-40">
                        {isLoadingCoachReport ? 'Analyzing...' : 'Refresh'}
                      </button>
                    </div>

                    {coachReport ? (
                      <div className="space-y-3 relative z-10">
                        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Coach Verdict:</span>
                          <span className="text-xs font-extrabold text-indigo-600">{coachReport.verdict} ({coachReport.score}/10)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">"{coachReport.summary}"</p>
                        
                        <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                          <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wide block">Next Steps:</span>
                          <ul className="space-y-1.5 pl-0.5">
                            {coachReport.actionPlan && coachReport.actionPlan.map((act, i) => (
                              <li key={i} className="text-[10px] text-slate-600 leading-relaxed flex items-start gap-1.5">
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1 shrink-0"></span>
                                <span>{act}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 relative z-10">
                        <Loader2 className="w-8 h-8 text-indigo-400 mx-auto animate-spin mb-2" />
                        <p className="text-xs text-slate-400">Evaluating study progress...</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2rem] p-8 shadow-xl text-white relative overflow-hidden">

                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
                    <h3 className="font-bold text-slate-100 mb-8 flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-400 animate-bounce" />
                      Consistency Stats
                    </h3>
                    <div className="flex justify-between items-end h-28 gap-2 mb-6">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                        const heights = [30, 45, 75, 90, 40, 20, 10];
                        const colors = [
                          'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]',
                          'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]',
                          'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]',
                          'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]',
                          'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.3)]',
                          'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]',
                          'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                        ];
                        return (
                          <div key={i} className="flex flex-col items-center gap-3 flex-1">
                            <div className={`w-full rounded-lg transition-all duration-300 ${colors[i]}`} style={{ height: `${heights[i]}%` }}></div>
                            <span className={`text-xs font-semibold ${i === 3 ? 'text-white' : 'text-slate-400'}`}>{day}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pt-5 border-t border-slate-700/50 flex justify-between items-end">
                      <div>
                        <span className="text-xs font-medium text-slate-400 block mb-1">Current Streak</span>
                        <span className="font-bold text-2xl tracking-tight">4 Days 🔥</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium text-slate-400 block mb-1">Best Streak</span>
                        <span className="font-bold text-lg text-slate-300">12 Days</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500 animate-pulse" />
                        Upskill Suggestions
                      </h3>
                    </div>
                    <div className="space-y-3.5">
                      {getUpskillRecommendations().map((rec, i) => (
                        <div key={i} className="group p-4 border border-slate-100 rounded-2xl bg-gradient-to-r hover:border-transparent hover:shadow-md transition-all duration-300 cursor-pointer bg-slate-50/50 relative overflow-hidden">
                          <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                          <div className="flex justify-between items-start pl-2">
                            <div>
                              <h4 className="text-sm font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors">{rec.name}</h4>
                              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border mt-2 inline-block ${rec.badgeColor}`}>{rec.match}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-500">{rec.level}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'create-roadmap' && (
            <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mt-4">
              <header className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">AI Roadmap Generator</h2>
                <p className="text-slate-500 text-sm mt-1">Answer these details to generate a custom day-by-day learning structure.</p>
              </header>

              <form onSubmit={handleGenerateRoadmap} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">What skill or topic do you want to learn?</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Search className="h-5 w-5 text-indigo-500" />
                    </div>
                    <input type="text" value={surveySkill} onChange={(e) => setSurveySkill(e.target.value)} required className="block w-full pl-11 pr-3 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm bg-slate-50 focus:bg-white placeholder-slate-400 transition-all outline-none" placeholder="e.g. Python Programming, Machine Learning, Web Design" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your current level</label>
                    <select value={surveyLevel} onChange={(e) => setSurveyLevel(e.target.value)} className="block w-full py-3 px-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm bg-slate-50 outline-none">
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Daily time commitment</label>
                    <select value={surveyCommitment} onChange={(e) => setSurveyCommitment(e.target.value)} className="block w-full py-3 px-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm bg-slate-50 outline-none">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>2 hours</option>
                      <option>3+ hours</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Roadmap Duration (Days)</label>
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <input type="number" min="30" max="365" value={surveyDuration} onChange={(e) => setSurveyDuration(Number(e.target.value))} onBlur={() => { if (surveyDuration < 30 || isNaN(surveyDuration)) setSurveyDuration(30); }} required className="block w-full sm:w-1/3 py-3 px-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm bg-slate-50 outline-none" />
                    <span className="text-xs text-slate-500 font-medium">Select a duration in days. Spans a minimum of 30 days to ensure proper module pacing.</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Preferred learning style</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Visual', 'Practical', 'Reading'].map(style => (
                      <button key={style} type="button" onClick={() => setSurveyStyle(style)} className={`py-3 px-4 text-sm font-bold rounded-xl border transition-all ${surveyStyle === style ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}>{style}</button>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={isGenerating} className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/25 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none transition-colors disabled:bg-indigo-400 disabled:shadow-none">
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Study Roadmap...
                    </>
                  ) : (
                    <>
                      <Compass className="w-5 h-5" />
                      Generate Study Flow
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-8 mt-2">
              {goals.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Left Column: All Created Roadmaps list with progress */}
                  <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-bold text-slate-900 text-lg px-1">Your Roadmaps</h3>
                    <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                      {goals.map((goal) => {
                        const isSelected = goal.id === activeGoalId;
                        const progress = getRoadmapProgress(goal);
                        return (
                          <button
                            key={goal.id}
                            type="button"
                            onClick={() => setActiveGoalId(goal.id)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden group ${
                              isSelected
                                ? 'bg-white border-indigo-500 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500'
                                : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600"></div>
                            )}
                            <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-600 pl-1.5' : 'text-slate-700'}`}>
                              {goal.title}
                            </h4>
                            <div className={`mt-2 space-y-1 ${isSelected ? 'pl-1.5' : ''}`}>
                              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                                <span>Progress</span>
                                <span className={isSelected ? 'text-indigo-600' : ''}>{progress}%</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isSelected ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-slate-400'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Active Roadmap Detail */}
                  <div className="lg:col-span-3 space-y-6">
                    {activeGoal ? (
                      <>
                        <header className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl"></div>
                          <div className="relative z-10">
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{activeGoal.title}</h2>
                            <p className="text-slate-500 text-xs mt-2 max-w-xl leading-relaxed">{activeGoal.description}</p>
                          </div>
                          <div className="flex items-center gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 rounded-xl border border-indigo-100/50 shadow-sm shrink-0 self-center relative z-10">
                            <div>
                              <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-wider block">Flow Progress</span>
                              <span className="font-extrabold text-indigo-700 text-xl">{getRoadmapProgress(activeGoal)}%</span>
                            </div>
                          </div>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="md:col-span-2 space-y-4">
                            <h3 className="font-bold text-slate-900 text-lg">Daily Modules</h3>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                              {activeGoal.steps && activeGoal.steps.map((step) => (
                                <div key={step.id} className={`bg-white rounded-2xl p-5 border transition-all ${step.completed ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-100 shadow-sm'}`}>
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{step.day}</span>
                                      <h4 className={`font-bold text-slate-800 text-sm mt-1.5 ${step.completed ? 'line-through text-slate-400' : ''}`}>{step.title}</h4>
                                    </div>
                                    <button onClick={() => toggleStepCompletion(step.id)} className="text-slate-400 hover:text-indigo-600">
                                      {step.completed ? (
                                        <CheckCircle2 className="w-5.5 h-5.5 text-emerald-500" />
                                      ) : (
                                        <Circle className="w-5.5 h-5.5 text-slate-300" />
                                      )}
                                    </button>
                                  </div>
                                  <ul className="space-y-2 mt-3">
                                    {step.tasks.map((task, tidx) => (
                                      <li key={tidx} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0"></span>
                                        <span className={step.completed ? 'line-through text-slate-400' : ''}>{task}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4 relative overflow-hidden">
                              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                <Activity className="w-4 h-4 text-indigo-600" />
                                Roadmap Analytics
                              </h3>
                              <div className="space-y-3 pt-1">
                                <div className="flex justify-between text-xs font-medium">
                                  <span className="text-slate-500 font-medium">Modules Completed</span>
                                  <span className="font-bold text-slate-800">{activeGoal.steps ? activeGoal.steps.filter(s => s.completed).length : 0} / {activeGoal.steps ? activeGoal.steps.length : 0}</span>
                                </div>
                                <div className="flex justify-between text-xs font-medium">
                                  <span className="text-slate-500 font-medium">Tasks Completed</span>
                                  <span className="font-bold text-slate-800">
                                    {activeGoal.steps ? activeGoal.steps.reduce((acc, step) => acc + (step.completed ? step.tasks.length : 0), 0) : 0} / {activeGoal.steps ? activeGoal.steps.reduce((acc, step) => acc + step.tasks.length, 0) : 0}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs items-center font-medium">
                                  <span className="text-slate-500 font-medium">Knowledge Level</span>
                                  <span className={`text-[10px] font-extrabold ${knowledge.color}`}>{knowledge.label}</span>
                                </div>
                                <div className="flex gap-0.5 justify-end">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className={`w-4 h-4 ${s <= knowledge.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                                  ))}
                                </div>
                              </div>
                            </div>

                            <h3 className="font-bold text-slate-950 text-base font-sans">Curated Free Study Resources</h3>
                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                              {activeGoal.resources && activeGoal.resources.map((res, idx) => {
                                const types = {
                                  "YouTube Video": "bg-red-50 text-red-700 border-red-100",
                                  "YouTube Channel": "bg-red-50 text-red-700 border-red-100",
                                  "Documentation": "bg-emerald-50 text-emerald-700 border-emerald-100"
                                };
                                const classType = types[res.type] || "bg-indigo-50 text-indigo-700 border-indigo-100";
                                return (
                                  <a key={idx} href={res.url} target="_blank" rel="noreferrer" className="group block bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
                                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2">{res.name}</h4>
                                    <div className="flex justify-between items-center mt-3">
                                      <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${classType}`}>{res.type}</span>
                                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                                    </div>
                                  </a>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 text-center py-20 animate-slide-up">
                        <Compass className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="font-bold text-slate-800 text-lg">Select a roadmap to view details</h3>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 text-center py-20">
                  <Target className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                  <h3 className="font-bold text-slate-800 text-xl">No active study flows</h3>
                  <p className="text-slate-500 mt-2 max-w-sm mx-auto">Create a customized, AI-driven learning roadmap to kickstart your journey!</p>
                  <button onClick={() => setActiveTab('create-roadmap')} className="mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md hover:from-indigo-700 hover:to-purple-700 transition">
                    Get Started
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'resume-analyzer' && (
            <div className="space-y-8 mt-2 pb-16">
              <header className="mb-2">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Resume Analyzer & ATS Checker 📄</h1>
                <p className="text-slate-500 mt-2 text-lg">Analyze your resume against ATS criteria, verify uniqueness, and get custom optimization strategies.</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Input Form */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-indigo-600" />
                      Target Job Details
                    </h3>
                    
                    <form onSubmit={handleAnalyzeResume} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Target Job Title</label>
                        <input type="text" required value={resumeJobTitle} onChange={(e) => setResumeJobTitle(e.target.value)} className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm" placeholder="e.g. Frontend Engineer" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Job Preferences / Tech Keywords</label>
                        <input type="text" value={targetJobDescription} onChange={(e) => setTargetJobDescription(e.target.value)} className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm" placeholder="e.g. React, Node, Tailwind" />
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
                          <button type="button" onClick={() => setResumeInputMode('upload')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${resumeInputMode === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Upload File</button>
                          <button type="button" onClick={() => setResumeInputMode('text')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${resumeInputMode === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Paste Text</button>
                        </div>

                        {resumeInputMode === 'upload' ? (
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Upload Resume (PDF or TXT)</label>
                            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-500 transition rounded-2xl p-6 text-center cursor-pointer relative bg-slate-50/50 group">
                              <input type="file" accept=".pdf,.txt" onChange={(e) => setResumeFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              <div className="space-y-1">
                                <BookOpen className="w-8 h-8 text-indigo-400 mx-auto group-hover:scale-110 transition-transform" />
                                <p className="text-sm font-bold text-slate-700">{resumeFile ? resumeFile.name : "Click or Drag Resume Here"}</p>
                                <p className="text-xs text-slate-400">PDF or text format (Max 5MB)</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">Paste Resume Text</label>
                            <textarea rows="5" value={resumeText} onChange={(e) => setResumeText(e.target.value)} className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm" placeholder="Paste your resume details, skills, and projects here..." />
                          </div>
                        )}
                      </div>

                      <button type="submit" disabled={isAnalyzing} className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition disabled:bg-indigo-400">
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Analyzing Resume ATS Metrics...
                          </>
                        ) : (
                          <>
                            <Activity className="w-5 h-5" />
                            Analyze Resume
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Right Column: ATS Report */}
                <div className="lg:col-span-2 space-y-6">
                  {atsResult ? (
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-6">
                      <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-700" />
                        ATS Feedback Report
                      </h3>

                      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                        {/* ATS Circle progress */}
                        <div className="relative w-24 h-24 shrink-0">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className={atsResult.atsScore >= 80 ? 'text-emerald-500' : atsResult.atsScore >= 60 ? 'text-amber-500' : 'text-rose-500'} strokeWidth="3.5" strokeDasharray={`${atsResult.atsScore}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-extrabold text-slate-800">{atsResult.atsScore}%</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">ATS MATCH</span>
                          </div>
                        </div>

                        {/* Uniqueness Circle progress */}
                        <div className="relative w-24 h-24 shrink-0">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-purple-600" strokeWidth="3.5" strokeDasharray={`${atsResult.uniqueness}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-extrabold text-slate-800">{atsResult.uniqueness}%</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">UNIQUENESS</span>
                          </div>
                        </div>

                        {/* Summary details */}
                        <div className="flex-1 space-y-1">
                          <h4 className="font-extrabold text-slate-800 text-sm">Parsed Candidate: {atsResult.parsedDetails.name}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{atsResult.overallSummary}</p>
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {atsResult.parsedDetails.skills.map((sk, idx) => (
                              <span key={idx} className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100/50">{sk}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Missing Keywords */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                          Missing Critical Keywords (Insert these to boost ATS Score)
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {atsResult.missingKeywords.map((kw, idx) => (
                            <span key={idx} className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-xl">{kw}</span>
                          ))}
                        </div>
                      </div>

                      {/* Formatting & Content Optimization tips */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                        <div className="space-y-2.5">
                          <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-1.5 text-indigo-600">Formatting</h5>
                          <ul className="space-y-1.5">
                            {atsResult.formattingTips.map((tip, idx) => (
                              <li key={idx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-1.5">
                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0"></span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2.5">
                          <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-1.5 text-purple-600">Bullet Points</h5>
                          <ul className="space-y-1.5">
                            {atsResult.contentTips.map((tip, idx) => (
                              <li key={idx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-1.5">
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 shrink-0"></span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-2.5">
                          <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-1.5 text-pink-600">Project Enhancements</h5>
                          <ul className="space-y-1.5">
                            {atsResult.projectTips.map((tip, idx) => (
                              <li key={idx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-1.5">
                                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5 shrink-0"></span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Redirect CTA to Interview Preparation */}
                      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-100/40 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm">Ready to practice for this role?</h4>
                          <p className="text-xs text-slate-500 mt-1">Start a custom mock interview prep simulation based on your resume matching profile.</p>
                        </div>
                        <button onClick={() => { setInterviewJobTitle(resumeJobTitle); setActiveTab('interview-prep'); handleGenerateQuestions(null, resumeJobTitle); }} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow-md transition shrink-0">
                          Start Interview Prep 🚀
                        </button>
                      </div>

                    </div>
                  ) : (
                    <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 text-center py-20">
                      <BookOpen className="w-12 h-12 text-indigo-400 mx-auto mb-4 opacity-70" />
                      <h3 className="font-bold text-slate-800 text-xl">Resume Analyzer Report Pending</h3>
                      <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm leading-relaxed">Fill in your target job preferences and upload your resume on the left panel to receive your ATS feedback match report!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interview-prep' && (
            <div className="space-y-8 mt-2 pb-16">
              <header className="mb-2">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Mock Interview Simulator 💼</h1>
                <p className="text-slate-500 mt-2 text-lg">Practice personalized technical, behavioral, and system design questions aligned to your desired role.</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Generate trigger */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-indigo-600" />
                      Simulator Parameters
                    </h3>

                    <form onSubmit={handleGenerateQuestions} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Target Job Title</label>
                        <input type="text" required value={interviewJobTitle} onChange={(e) => setInterviewJobTitle(e.target.value)} className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm" placeholder="e.g. Frontend Engineer" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Focus Topic (Optional)</label>
                        <input type="text" value={interviewFocusTopic} onChange={(e) => setInterviewFocusTopic(e.target.value)} className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm" placeholder="e.g. React, System Design" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Number of Questions</label>
                        <input type="range" min="1" max="30" value={interviewQuestionCount} onChange={(e) => setInterviewQuestionCount(e.target.value)} className="w-full accent-indigo-600 mb-1" />
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>1</span>
                          <span className="text-indigo-600 font-extrabold">{interviewQuestionCount} Questions</span>
                          <span>30</span>
                        </div>
                      </div>

                      {atsResult && (
                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-1">
                          <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wide block">Skills from Resume:</span>
                          <div className="flex flex-wrap gap-1">
                            {atsResult.parsedDetails.skills.map((sk, idx) => (
                              <span key={idx} className="text-[9px] font-bold bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded">{sk}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <button type="submit" disabled={isGeneratingQuestions} className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition disabled:bg-indigo-400">
                        {isGeneratingQuestions ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating Mock Questions...
                          </>
                        ) : (
                          <>
                            <Compass className="w-5 h-5" />
                            Generate Mock Questions
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Right Column: Q&A Simulation Panel */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[2rem] p-6 shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                    <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-800/80 pb-3">
                      <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
                      Mock Interview Simulator
                    </h3>

                    {interviewQuestions.length > 0 ? (
                      <div className="space-y-5">
                        {/* Selector/Progress */}
                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span className="font-bold">Question {activeQuestionIdx + 1} of {interviewQuestions.length}</span>
                          <span className="bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800/60 uppercase text-[9px] font-extrabold">{interviewQuestions[activeQuestionIdx].category}</span>
                        </div>

                        {/* Question Text */}
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                          <p className="text-sm font-bold text-slate-100 leading-relaxed">{interviewQuestions[activeQuestionIdx].question}</p>
                        </div>

                        {/* Guidelines Tips */}
                        <div className="text-xs text-slate-400 space-y-1.5 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/40">
                          <span className="font-bold text-indigo-300 block">AI Tips & Guidelines:</span>
                          <p className="leading-relaxed">{interviewQuestions[activeQuestionIdx].guidelines}</p>
                        </div>

                        {/* Answer form */}
                        <form onSubmit={handleGradeAnswer} className="space-y-3.5 pt-2">
                          <textarea rows="4" required value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="Type your response here..." className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-200 font-sans leading-relaxed" />
                          <button type="submit" disabled={isGrading} className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition text-xs flex justify-center items-center gap-1.5">
                            {isGrading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Grading Response...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Submit & Grade Answer
                              </>
                            )}
                          </button>
                        </form>

                        {/* Grading Results */}
                        {gradingResult && (
                          <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3 pt-4 mt-4 border-t-2 border-t-indigo-500">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                              <span className="text-xs font-bold text-slate-200">AI Evaluation Verdict:</span>
                              <span className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded ${gradingResult.score >= 8 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : gradingResult.score >= 6 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>{gradingResult.verdict} ({gradingResult.score}/10)</span>
                            </div>
                            
                            <div className="space-y-2 text-[11px] text-slate-300 leading-relaxed font-sans">
                              <div>
                                <span className="font-bold text-emerald-400 block mb-0.5">Strengths:</span>
                                <ul className="list-disc pl-4 space-y-0.5">
                                  {gradingResult.strengths.map((str, idx) => <li key={idx}>{str}</li>)}
                                </ul>
                              </div>
                              <div>
                                <span className="font-bold text-amber-400 block mb-0.5">Improvements Needed:</span>
                                <ul className="list-disc pl-4 space-y-0.5">
                                  {gradingResult.improvements.map((imp, idx) => <li key={idx}>{imp}</li>)}
                                </ul>
                              </div>
                              <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                                <span className="font-bold text-indigo-300 block mb-1">AI Recommended Response:</span>
                                <p className="leading-relaxed text-[10px] text-slate-400 italic">{gradingResult.modelAnswer}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Navigation between questions */}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                          <button type="button" disabled={activeQuestionIdx === 0} onClick={() => { setActiveQuestionIdx(prev => prev - 1); setGradingResult(null); setUserAnswer(''); }} className="text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30">Previous</button>
                          <button type="button" disabled={activeQuestionIdx === interviewQuestions.length - 1} onClick={() => { setActiveQuestionIdx(prev => prev + 1); setGradingResult(null); setUserAnswer(''); }} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 disabled:opacity-30">Next Question</button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-20 space-y-3">
                        <Award className="w-12 h-12 text-indigo-400 mx-auto opacity-70 mb-2" />
                        <h4 className="font-bold text-slate-200 text-lg">Simulator Ready</h4>
                        <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed">Specify a target job title on the left panel and click **Generate Mock Questions** to initialize your interactive interview practice!</p>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-3xl mx-auto space-y-8 mt-2 pb-16">
              <header className="mb-2">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile Settings 👤</h1>
                <p className="text-slate-500 mt-2 text-lg">Manage your personal information, profile photo, and core learning credentials.</p>
              </header>

              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-20 -mt-20"></div>
                
                <form onSubmit={handleSaveProfile} className="space-y-8 relative z-10">
                  
                  {/* Profile Pic Upload Row */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
                    <div className="relative group w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-500/25 bg-indigo-50 flex items-center justify-center text-indigo-700 font-extrabold text-3xl shrink-0 shadow-md transition-all duration-300 hover:border-indigo-500/50">
                      {profilePic ? (
                        <img src={profilePic} alt="Profile Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span>{profileName ? profileName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'ST'}</span>
                      )}
                      
                      {/* Upload Camera Overlay */}
                      <label className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300">
                        <Camera className="w-6 h-6 text-white" />
                        <span className="text-[10px] font-bold mt-1 uppercase tracking-wide">Upload</span>
                        <input type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
                      </label>
                    </div>

                    <div className="text-center sm:text-left space-y-1">
                      <h3 className="font-extrabold text-slate-800 text-lg">Profile Picture</h3>
                      <p className="text-xs text-slate-400 font-medium">Upload a square image (.png, .jpg or .webp, max 2MB).</p>
                      <div className="flex justify-center sm:justify-start gap-2 pt-2">
                        <label className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-indigo-500/20 cursor-pointer transition-all">
                          Choose Photo
                          <input type="file" accept="image/*" onChange={handleProfilePicChange} className="hidden" />
                        </label>
                        {profilePic && (
                          <button type="button" onClick={() => setProfilePic('')} className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs px-4 py-2 rounded-xl border border-rose-100 transition-all">
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Core details fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
                      <input type="text" required value={profileName} onChange={(e) => setProfileName(e.target.value)} className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition-all" placeholder="John Doe" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
                      <input type="email" required value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition-all" placeholder="you@example.com" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Mobile Number</label>
                      <input type="text" value={profileMobile} onChange={(e) => setProfileMobile(e.target.value)} className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition-all" placeholder="+1 (555) 000-0000" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Career Role</label>
                      <input type="text" value={profileRole} onChange={(e) => setProfileRole(e.target.value)} className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition-all" placeholder="e.g. Full Stack Developer, Data Scientist" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Key Skills (Comma Separated)</label>
                    <input type="text" value={profileSkills} onChange={(e) => setProfileSkills(e.target.value)} className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition-all placeholder-slate-400" placeholder="e.g. React, Node.js, Python, Git, SQL" />
                    <span className="text-[10px] text-slate-400 font-medium block mt-1.5 pl-1">These skills will help customize your resume recommendations and interview simulation.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Short Bio</label>
                    <textarea rows="4" value={profileBio} onChange={(e) => setProfileBio(e.target.value)} className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition-all placeholder-slate-400 font-sans leading-relaxed" placeholder="Tell us a bit about your career journey, interests, or background..." />
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                    <button type="button" onClick={() => { setActiveTab('dashboard'); }} className="px-6 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition text-sm">
                      Cancel
                    </button>
                    <button type="submit" disabled={isSavingProfile} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all text-sm flex items-center justify-center gap-2">
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Save Settings
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-8 mt-2 pb-16">
              <header className="mb-2">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Smart Notes 📝</h1>
                <p className="text-slate-500 mt-2 text-lg">Jot down study summaries, compile code snippets, and organize your study resources.</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Notes List Pane */}
                <div className="lg:col-span-1 bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="font-bold text-slate-800 text-sm">My Notes ({notes.length})</span>
                    <button type="button" onClick={handleCreateNote} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-xl transition">
                      + New
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {notes.map(note => (
                      <div key={note.id} onClick={() => handleSelectNote(note)} className={`p-3 rounded-xl cursor-pointer border text-left transition-all ${activeNoteId === note.id ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 'bg-slate-50 border-slate-100 hover:bg-slate-105'}`}>
                        <p className="text-xs font-bold truncate">{note.title || 'Untitled Note'}</p>
                        <p className="text-[10px] text-slate-400 mt-1 truncate">{note.content || 'Empty note content...'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Editor Pane */}
                <div className="lg:col-span-3 bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
                  {activeNoteId ? (
                    <div className="space-y-4 text-left">
                      <div className="flex justify-between items-center">
                        <input type="text" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} onBlur={handleSaveNote} className="w-2/3 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 font-bold text-slate-800 text-lg outline-none pb-1 transition-all" placeholder="Note Title" />
                        <div className="flex gap-2">
                          <button type="button" onClick={handleEnhanceNote} disabled={isEnhancingNote || !noteContent.trim()} className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1">
                            {isEnhancingNote ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Enhancing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-white" />
                                AI Enhance
                              </>
                            )}
                          </button>
                          <button type="button" onClick={() => window.print()} disabled={!noteContent.trim()} className="text-xs bg-slate-800 hover:bg-slate-900 text-white font-bold px-3 py-1.5 rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1">
                            <Download className="w-3.5 h-3.5 text-white" />
                            PDF
                          </button>
                          <button type="button" onClick={handleSaveNote} disabled={isSavingNote} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-xl shadow-md transition disabled:opacity-50">
                            {isSavingNote ? 'Saving...' : 'Save'}
                          </button>
                          <button type="button" onClick={() => handleDeleteNote(activeNoteId)} className="text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold px-3 py-1.5 rounded-xl transition">
                            Delete
                          </button>
                        </div>
                      </div>
                      <textarea rows="14" value={noteContent} onChange={(e) => setNoteContent(e.target.value)} onBlur={handleSaveNote} className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed text-slate-700" placeholder="Start typing your study notes, key definitions, or code syntax here..." />
                      

                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <PenSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">Select or create a study note to start typing!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quizzer' && (
            <div className="space-y-8 mt-2 pb-16">
              <header className="mb-2">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Quizzer 🧠</h1>
                <p className="text-slate-500 mt-2 text-lg">Choose from your saved study notes, customize parameters, and generate AI-powered multiple-choice quizzes to evaluate your learning progress.</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Note Selector & Parameters */}
                <div className="lg:col-span-1 bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-6">
                  <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-650" />
                    Select Study Resource
                  </h3>

                  {notes.length === 0 ? (
                    <div className="space-y-4 text-center py-6">
                      <p className="text-xs font-bold text-slate-500 leading-relaxed">No study notes found. Go to Smart Notes to create your study resources!</p>
                      <button onClick={() => setActiveTab('notes')} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-xs hover:bg-indigo-100 transition">
                        Go to Smart Notes
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6 text-left">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Choose a Note</label>
                        <select
                          value={quizSelectedNoteId || ''}
                          onChange={(e) => {
                            setQuizSelectedNoteId(e.target.value);
                            setQuizQuestions([]);
                            setQuizCompleted(false);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-700 cursor-pointer"
                        >
                          <option value="" disabled>-- Select a study note --</option>
                          {notes.map(note => (
                            <option key={note.id} value={note.id}>
                              {note.title || 'Untitled Note'}
                            </option>
                          ))}
                        </select>
                      </div>

                      {(() => {
                        const selectedNote = notes.find(n => n.id === quizSelectedNoteId);
                        if (!selectedNote) return null;
                        return (
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Note Preview</span>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 max-h-[200px] overflow-y-auto">
                              <h4 className="font-bold text-slate-800 text-sm mb-1">{selectedNote.title || 'Untitled Note'}</h4>
                              <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap font-sans">
                                {selectedNote.content ? (selectedNote.content.length > 300 ? selectedNote.content.slice(0, 300) + '...' : selectedNote.content) : <span className="italic text-slate-400">Empty note contents</span>}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Number of Questions</label>
                        <input type="range" min="1" max="30" value={quizQuestionCount} onChange={(e) => setQuizQuestionCount(e.target.value)} className="w-full accent-indigo-600 mb-1" />
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-2">
                          <span>1</span>
                          <span className="text-indigo-600 font-extrabold">{quizQuestionCount} Questions</span>
                          <span>30</span>
                        </div>
                      </div>

                      <button
                        onClick={handleGenerateQuiz}
                        disabled={isGeneratingQuiz || !quizSelectedNoteId || !notes.find(n => n.id === quizSelectedNoteId)?.content?.trim()}
                        className="w-full py-3 bg-gradient-to-r from-indigo-650 via-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-md text-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isGeneratingQuiz ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            Formulating Quiz...
                          </>
                        ) : (
                          <>
                            <BrainCircuit className="w-4 h-4 text-white" />
                            Generate AI Quiz ⚡
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Column: Quiz Workspace */}
                <div className="lg:col-span-2 space-y-6">
                  {isGeneratingQuiz ? (
                    <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-slate-100 text-center py-24 space-y-4 flex flex-col justify-center items-center h-full">
                      <div className="relative">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center animate-pulse-slow">
                          <BrainCircuit className="w-8 h-8 text-indigo-600 animate-spin" style={{ animationDuration: '3s' }} />
                        </div>
                        <div className="absolute inset-0 w-16 h-16 border-2 border-indigo-500 rounded-full animate-ping opacity-25"></div>
                      </div>
                      <h3 className="font-bold text-slate-850 text-xl tracking-tight mt-4">Generating Your AI Quiz</h3>
                      <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
                        PathFinder AI is analyzing your study notes, selecting core concepts, and designing custom multiple-choice questions to test your retention.
                      </p>
                    </div>
                  ) : quizQuestions.length > 0 ? (
                    <div className="space-y-6">
                      {!quizCompleted ? (
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
                          {/* Progress indicator */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                              <span>Question {activeQuizIdx + 1} of {quizQuestions.length}</span>
                              <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">Score: {quizScore}</span>
                            </div>
                            {/* Visual progress bar */}
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${((activeQuizIdx) / quizQuestions.length) * 100}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Question text */}
                          <div className="pt-2 text-left">
                            <h2 className="text-lg font-bold text-slate-900 leading-relaxed font-sans select-none">
                              {quizQuestions[activeQuizIdx]?.question}
                            </h2>
                          </div>

                          {/* Options list */}
                          <div className="grid grid-cols-1 gap-3 pt-2">
                            {quizQuestions[activeQuizIdx]?.options.map((opt, oIdx) => {
                              const isSelected = selectedQuizOption === opt;
                              return (
                                <button
                                  key={oIdx}
                                  type="button"
                                  onClick={() => setSelectedQuizOption(opt)}
                                  className={`w-full text-left p-4 rounded-2xl text-sm font-semibold transition-all border flex items-center justify-between ${
                                    isSelected
                                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-sm'
                                      : 'bg-slate-50 hover:bg-slate-100 border-slate-100 text-slate-700'
                                  }`}
                                >
                                  <span className="flex items-center gap-3">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-bold ${
                                      isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 text-slate-500'
                                    }`}>
                                      {String.fromCharCode(65 + oIdx)}
                                    </span>
                                    <span>{opt}</span>
                                  </span>
                                  {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>

                          {/* Submit button */}
                          <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button
                              type="button"
                              onClick={handleSubmitQuizAnswer}
                              disabled={!selectedQuizOption}
                              className="py-3 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition shadow-md disabled:opacity-40 text-xs flex items-center gap-2"
                            >
                              <span>Submit Answer</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 rounded-[2rem] p-8 shadow-xl text-white text-center py-12 relative overflow-hidden space-y-6">
                          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
                          <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/5 rounded-full blur-3xl"></div>
                          
                          <Award className="w-16 h-16 text-yellow-400 mx-auto animate-bounce" />
                          <h3 className="text-2xl font-black tracking-tight text-white leading-tight">Quiz Completed! 🎉</h3>
                          
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-sm mx-auto space-y-2">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Your Performance Score</span>
                            <span className="text-5xl font-black text-indigo-400 block animate-pulse-slow">
                              {quizScore} <span className="text-xl text-slate-500">/ {quizQuestions.length}</span>
                            </span>
                            <p className="text-xs text-slate-300 pt-2 font-medium">
                              {quizScore === quizQuestions.length 
                                ? "Perfect score! You have fully mastered these concepts! 🏆" 
                                : quizScore >= quizQuestions.length / 2 
                                ? "Great effort! You've got a solid grasp, but there's room to improve. 👍" 
                                : "Keep studying! Review your notes and try again to cement your memory. 📚"}
                            </p>
                          </div>

                          <div className="flex gap-3 max-w-sm mx-auto pt-2">
                            <button
                              type="button"
                              onClick={handleGenerateQuiz}
                              className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl transition shadow-md"
                            >
                              Retake Quiz 🔄
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setQuizQuestions([]);
                                setQuizCompleted(false);
                                setQuizSelectedNoteId(null);
                              }}
                              className="px-4 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-bold rounded-xl transition"
                            >
                              Clear Selection
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : quizSelectedNoteId ? (
                    <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 text-center py-24 space-y-4 flex flex-col justify-center items-center h-full">
                      <BrainCircuit className="w-12 h-12 text-indigo-400 mx-auto opacity-70 animate-pulse-slow" />
                      <h3 className="font-bold text-slate-800 text-lg">AI Quiz Ready to Formulate</h3>
                      <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
                        Click the <span className="font-bold text-indigo-600">"Generate AI Quiz"</span> button in the left panel to scan the note and formulate practice questions.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 text-center py-24 space-y-4 flex flex-col justify-center items-center h-full">
                      <HelpCircle className="w-12 h-12 text-slate-350 mx-auto opacity-60" />
                      <h3 className="font-bold text-slate-800 text-lg">Select a Study Note</h3>
                      <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
                        Please select a study note from the dropdown in the left panel to start testing your retention using AI.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gap-analyzer' && (
            <div className="space-y-8 mt-2 pb-16">
              <header className="mb-2">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Skill Gap Analyzer ⚡</h1>
                <p className="text-slate-500 mt-2 text-lg">Compare your profile skills against target job description requirements to identify gaps and generate bridging goals.</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Input Form */}
                <div className="lg:col-span-1 bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4">
                  <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    Target Job Details
                  </h3>
                  <form onSubmit={handleAnalyzeGap} className="space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Paste Job Description</label>
                      <textarea rows="10" required value={gapJobDescription} onChange={(e) => setGapJobDescription(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white leading-relaxed text-slate-700 font-sans" placeholder="Paste the target job qualifications, requirements, or skills list here..." />
                    </div>
                    <button type="submit" disabled={isAnalyzingGap} className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-md text-xs transition disabled:opacity-55">
                      {isAnalyzingGap ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing Skill Gaps...
                        </>
                      ) : (
                        <>
                          <BrainCircuit className="w-4 h-4" />
                          Compare & Analyze Gaps
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Right Column: Gap Report dashboard */}
                <div className="lg:col-span-2 space-y-6">
                  {gapResult ? (
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-6 text-left">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-indigo-600" />
                          Comparison Report
                        </h3>
                        <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-md">Match Rate: {gapResult.matchPercentage}%</span>
                      </div>

                      {/* Percentage Ring */}
                      <div className="flex flex-col sm:flex-row items-center gap-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                        <div className="relative w-24 h-24 shrink-0">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path className="text-slate-100" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-indigo-600" strokeWidth="3.5" strokeDasharray={`${gapResult.matchPercentage}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center font-black text-slate-800 text-lg">
                            {gapResult.matchPercentage}%
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">Matched Skills:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {gapResult.matchedSkills.map((sk, i) => (
                                <span key={i} className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100/50">{sk}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wide block mb-1">Missing / Gap Competencies:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {gapResult.missingSkills.map((sk, i) => (
                                <span key={i} className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100/50">{sk}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bridge Roadmap Card */}
                      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl relative overflow-hidden space-y-4">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                        <h4 className="font-bold text-slate-100 text-sm flex items-center gap-1.5 relative z-10">
                          <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                          AI Bridging Roadmap Recommendation
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-xl relative z-10">{gapResult.gapRoadmap.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 relative z-10">
                          {gapResult.gapRoadmap.steps.map((st, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                              <span className="text-[10px] font-bold text-indigo-300">{st.day}</span>
                              <h5 className="font-bold text-slate-100 text-xs">{st.title}</h5>
                              <ul className="text-[10px] text-slate-400 space-y-1 pl-0.5">
                                {st.tasks.map((tsk, tIdx) => (
                                  <li key={tIdx} className="flex items-start gap-1">
                                    <span className="w-1 h-1 bg-indigo-400 rounded-full mt-1.5 shrink-0"></span>
                                    <span>{tsk}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        <div className="pt-4 border-t border-slate-800 flex justify-end relative z-10">
                          <button type="button" onClick={handleSaveGapRoadmap} disabled={isSavingGapRoadmap} className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1">
                            {isSavingGapRoadmap ? 'Integrating...' : 'Integrate Bridging Roadmap 🚀'}
                          </button>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-slate-100 text-center py-20">
                      <BrainCircuit className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="font-bold text-slate-800 text-xl">Skill Gap Analysis Pending</h3>
                      <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm leading-relaxed">Paste the job description you are targeting in the left panel to scan your profile skills against requirements and generate a personalized gap-bridging roadmap.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Celebratory Completion Certificate Overlay */}
          {showCertificate && (
            <div className="fixed inset-0 z-55 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl border border-indigo-100 relative text-center space-y-6">
                <button onClick={() => setShowCertificate(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-2">
                  <Award className="w-16 h-16 text-yellow-500 mx-auto animate-bounce" />
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Mastery Achieved! 🎉</h2>
                  <p className="text-slate-500 text-sm max-w-md mx-auto">Outstanding progress! You have completed 100% of your milestones on this roadmap curriculum.</p>
                </div>

                {/* Certificate Frame */}
                <div className="border-8 border-double border-indigo-900/10 p-6 rounded-2xl bg-indigo-50/20 relative overflow-hidden text-center select-none font-serif printable-content">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl"></div>
                  
                  <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-indigo-700 block mb-3">Certificate of Mastery</span>
                  <p className="text-xs font-sans text-slate-400">This is proudly presented to</p>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight my-2 italic border-b border-dashed border-slate-200 w-fit mx-auto pb-1 px-8">{profileName}</h3>
                  <p className="text-xs font-sans text-slate-500 max-w-sm mx-auto leading-relaxed mt-3">
                    for demonstrating proficiency and successfully completing all checkpoints in the custom curriculum:
                  </p>
                  <h4 className="text-sm font-sans font-bold text-indigo-900 mt-2">"{activeGoal?.title || 'Advanced Curriculum Roadmap'}"</h4>
                  
                  <div className="flex justify-between items-end mt-8 pt-4 border-t border-slate-200/50 text-[9px] font-sans font-semibold text-slate-400">
                    <div className="text-left font-sans">
                      <span>Authorized Signature</span>
                      <p className="text-indigo-600 font-bold italic text-[10px] mt-0.5">EduNav AI Coach</p>
                    </div>
                    <div className="text-right font-sans">
                      <span>Issued Date</span>
                      <p className="text-slate-800 font-bold mt-0.5">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => window.print()} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2 text-sm">
                    <Download className="w-4 h-4" />
                    Print / Download PDF
                  </button>
                  <button type="button" onClick={() => setShowCertificate(false)} className="px-6 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition text-sm">
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}


          {/* Authenticated Footer */}

          <footer className="max-w-5xl mx-auto mt-16 pt-6 border-t border-slate-200 pb-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium">
            <p className="flex items-center gap-1.5">
              Made with love ❤️ by <span className="font-semibold text-slate-600">Aditya</span>
            </p>
            <p>&copy; {new Date().getFullYear()} EduNav AI. All rights reserved.</p>
          </footer>
        </div>
      </main>

      {/* Floating Chatbot (PathFinder AI) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {isChatOpen && (
          <div className="w-[340px] sm:w-[380px] h-[460px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-4 transform transition-all duration-300">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="bg-white/10 p-1.5 rounded-lg">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">PathFinder AI</h4>
                  <span className="text-[10px] text-indigo-100 block">App Guide & study assistant</span>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white hover:bg-white/10 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white text-slate-400 border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    PathFinder is typing...
                  </div>
                </div>
              )}
            </div>

            <input type="hidden" />
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-100 bg-white flex gap-2">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2.5 rounded-xl hover:shadow-md transition">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        <button onClick={() => setIsChatOpen(!isChatOpen)} className="bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 z-40 flex justify-around py-2.5 shadow-lg rounded-t-2xl">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-500'}`}>
          <Activity className="w-5 h-5" />
          <span>Dashboard</span>
        </button>
        <button onClick={() => setActiveTab('create-roadmap')} className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'create-roadmap' ? 'text-indigo-600' : 'text-slate-500'}`}>
          <Compass className="w-5 h-5" />
          <span>Create</span>
        </button>
        <button onClick={() => setActiveTab('goals')} className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'goals' ? 'text-indigo-600' : 'text-slate-500'}`}>
          <Target className="w-5 h-5" />
          <span>Roadmaps</span>
        </button>
        <button onClick={() => setActiveTab('resume-analyzer')} className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'resume-analyzer' ? 'text-indigo-700' : 'text-slate-500'}`}>
          <BookOpen className="w-5 h-5" />
          <span>Resume</span>
        </button>
        <button onClick={() => setActiveTab('interview-prep')} className={`flex flex-col items-center gap-1 text-[10px] font-bold ${activeTab === 'interview-prep' ? 'text-indigo-700' : 'text-slate-500'}`}>
          <Award className="w-5 h-5" />
          <span>Interview</span>
        </button>
      </div>

    </div>

    {/* Root Level Print Container for clean PDF generation without scroll constraints */}
    <div className="hidden print:block w-full bg-white text-black p-8 font-sans">
      {showCertificate && activeGoal ? (
        <div className="text-center max-w-3xl mx-auto border-[12px] border-slate-50 p-12 mt-12">
          <h2 className="text-4xl font-bold text-slate-800 mb-4 flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-500" />
            Certificate of Mastery
          </h2>
          <p className="text-lg text-slate-500 mb-8">This is proudly presented to</p>
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight my-4 italic border-b border-dashed border-slate-300 pb-2">{profileName}</h3>
          <p className="text-base text-slate-600 mt-6 mb-2">for demonstrating proficiency and successfully completing all checkpoints in the custom curriculum:</p>
          <h4 className="text-xl font-bold text-indigo-900 mb-16">"{activeGoal?.title || 'Advanced Curriculum Roadmap'}"</h4>
          <div className="flex justify-between items-end pt-8 border-t border-slate-200 text-sm text-slate-500">
            <div className="text-left">
              <span>Authorized Signature</span>
              <p className="text-indigo-600 font-bold italic text-base mt-1">EduNav AI Coach</p>
            </div>
            <div className="text-right">
              <span>Issued Date</span>
              <p className="text-slate-800 font-bold mt-1">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      ) : (
        (activeTab === 'notes' && activeNoteId) ? (
          <div className="text-left max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-slate-900 font-sans mb-4">{noteTitle || 'Untitled Note'}</h1>
            <p className="text-sm text-slate-500 font-sans border-b border-slate-200 pb-4 mb-8">
              EduNav AI Study Resource &mdash; Date: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <div className="whitespace-pre-wrap text-base leading-relaxed text-slate-800 font-sans">
              {noteContent}
            </div>
          </div>
        ) : null
      )}
    </div>
    </>
  );
}

export default App;
