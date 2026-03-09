"use client";

import { animate, stagger } from "animejs";
import {
  ArrowBigDown,
  ArrowBigUp,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Briefcase,
  Calendar,
  MessageCircle,
  Plus,
  Search,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/Sidebar";

// Types
interface Discussion {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  category: "interview" | "experience" | "tips" | "events" | "question";
  company?: string;
  title: string;
  content: string;
  fullArticle: string;
  upvotes: number;
  downvotes: number;
  comments: number;
  timeAgo: string;
  tags: string[];
  userVote?: "up" | "down" | null;
  saved?: boolean;
}

export default function CareerPage() {
  const mainRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");
  const [selectedPost, setSelectedPost] = useState<Discussion | null>(null);

  const [discussions, setDiscussions] = useState<Discussion[]>([
    {
      id: "1",
      author: { name: "Arjun Kumar", avatar: "A", role: "SDE @ Google" },
      category: "interview",
      company: "Google",
      title: "Just cleared Google L4 interview - Here's my complete experience",
      content:
        "After 3 months of preparation, I finally cleared the Google L4 interviews! The process had 5 rounds - 2 DSA, 1 System Design, 1 Behavioral, and 1 Team Match. Here's what worked for me...",
      fullArticle: `# My Complete Google L4 Interview Experience

After 3 months of intense preparation, I'm thrilled to share that I've successfully cleared the Google L4 (SDE-2) interview process! This was my dream company, and the journey was both challenging and rewarding.

## The Interview Process

The entire process consisted of **5 rounds**:

### Round 1 & 2: Data Structures & Algorithms (90 mins each)
- **Round 1**: Started with a medium-level array problem, followed by a tree traversal question
  - Question 1: Find the longest substring without repeating characters
  - Question 2: Validate Binary Search Tree with follow-up optimization
  - Interviewer was very friendly and gave hints when I was stuck
  
- **Round 2**: Graph and Dynamic Programming
  - Question 1: Number of Islands (with various constraints)
  - Question 2: Longest Increasing Subsequence
  - More challenging, but I managed to optimize my initial O(n²) solution to O(n log n)

### Round 3: System Design (60 mins)
This was the most challenging round for me. I was asked to design a **URL shortening service like bit.ly**.

Key topics covered:
- Load balancing and horizontal scaling
- Database schema design (SQL vs NoSQL trade-offs)
- Caching strategies (Redis)
- Rate limiting
- Analytics and tracking
- Custom short URLs

**Pro tip**: Don't jump straight into implementation. Spend the first 10-15 minutes understanding requirements and constraints!

### Round 4: Behavioral (45 mins)
Standard behavioral questions using Google's Leadership Principles:
- Tell me about a time you handled conflict
- Describe a project where you went above and beyond
- How do you handle tight deadlines?
- Tell me about a technical decision you regretted

**My approach**: Used the STAR method (Situation, Task, Action, Result) for every answer.

### Round 5: Team Match (30 mins)
This was more conversational. I spoke with a potential manager about:
- Current projects their team is working on
- Team culture and work-life balance
- Career growth opportunities
- My interests and what I'm looking for

## My Preparation Strategy

### 1. DSA Preparation (2 months)
- **LeetCode**: Solved ~200 problems (focused on medium-hard)
- **Pattern Recognition**: Grouped problems by patterns (sliding window, two pointers, etc.)
- **Daily Practice**: 2-3 problems every day without fail
- **Mock Interviews**: Did 10+ mock interviews on Pramp and interviewing.io

### 2. System Design (3 weeks)
- Read "Designing Data-Intensive Applications" by Martin Kleppmann
- Watched Gaurav Sen's YouTube series
- Practiced with friends and senior engineers
- Drew diagrams for common systems (Twitter, Instagram, Netflix, etc.)

### 3. Behavioral Prep (1 week)
- Listed 10 STAR stories from my past experiences
- Practiced telling them concisely
- Got feedback from friends on my storytelling

## Key Takeaways

✅ **Communicate your thought process** - Even if you're stuck, talk through your approach
✅ **Ask clarifying questions** - Don't make assumptions about the problem
✅ **Start with brute force** - Then optimize. Shows problem-solving skills
✅ **Test your code** - Walk through test cases, including edge cases
✅ **Be honest** - If you don't know something, say it. Show willingness to learn

## Resources I Used

**For DSA:**
- LeetCode Premium (totally worth it)
- "Cracking the Coding Interview" by Gayle McDowell
- NeetCode 150 problems roadmap

**For System Design:**
- "System Design Interview" by Alex Xu
- Gaurav Sen YouTube channel
- ByteByteGo newsletter

**For Behavioral:**
- Google's careers page (understanding their culture)
- Blind app discussions
- Mock behavioral interviews

## Timeline

- **Week 1-8**: DSA grinding (3-4 hours daily)
- **Week 9-11**: System Design focus (2 hours daily) + DSA maintenance
- **Week 12**: Mock interviews, behavioral prep, resume polishing
- **Week 13**: Actual interview week!

## Final Thoughts

The key is **consistent practice** and **not giving up**. I failed interviews at Meta and Amazon before this, but each failure taught me something valuable.

Remember: Interviews are a skill that can be learned and improved. Don't get discouraged by initial rejections!

Feel free to ask any questions in the comments. Happy to help fellow engineers! 🚀

**Update**: Received the offer letter yesterday with a package of 60L CTC. Starting in March 2026!`,
      upvotes: 342,
      downvotes: 12,
      comments: 89,
      timeAgo: "2h ago",
      tags: ["Google", "SDE", "DSA", "System Design"],
      userVote: null,
    },
    {
      id: "2",
      author: { name: "Priya Sharma", avatar: "P", role: "Fresher" },
      category: "question",
      title: "How to prepare for Amazon SDE-1 in 2 months?",
      content:
        "I have an Amazon interview scheduled in 2 months. I'm comfortable with arrays and strings but weak in DP and graphs. What should be my preparation strategy?",
      fullArticle: `# Need Help: Amazon SDE-1 Preparation Strategy

Hi everyone! I recently got a call from Amazon recruiter for the SDE-1 position, and my interviews are scheduled in **2 months**. I'm both excited and nervous!

## My Current Situation

**Background:**
- Final year CS student from tier-2 college
- CGPA: 8.2/10
- Have done 2 internships (one in web dev, one in mobile app development)
- Comfortable with Java and Python

**DSA Preparation Status:**
- ✅ Arrays & Strings: Comfortable, solved ~50 problems
- ✅ Linked Lists: Moderate comfort, solved ~25 problems
- ⚠️ Trees & Graphs: Basic understanding, solved only ~15 problems
- ❌ Dynamic Programming: Very weak, struggled with most problems
- ❌ Backtracking: Haven't practiced much

## The Problem

I've heard Amazon focuses heavily on **Leadership Principles** and asks 2-3 medium-hard DSA problems per round. I'm particularly worried about:

1. **Dynamic Programming** - I understand the basics but struggle with identifying patterns
2. **Graph Algorithms** - BFS/DFS are okay, but advanced topics like Dijkstra, Union-Find confuse me
3. **Behavioral Questions** - Don't have much work experience to draw from

## My Questions

1. **Is 2 months enough time?** Given my current preparation level?

2. **Should I focus on breadth or depth?** 
   - Should I solve many easy-medium problems across all topics?
   - Or go deep into DP and graphs even if it means less coverage?

3. **What's more important: LeetCode or Projects?**
   - I have decent projects, but not sure if I should spend time building more

4. **How to prepare for Leadership Principles?**
   - Most online examples are from experienced professionals
   - How can I frame my internship/college experiences?

5. **Mock interviews - worth it?**
   - Should I invest in paid mock interview platforms?

## What I've Tried So Far

- Tried following Striver's SDE sheet (completed 30/180)
- Read some DP tutorials but can't solve problems on my own
- Watched Abdul Bari's YouTube videos on algorithms
- Solved about 80 LeetCode problems total (mostly easy)

## My Tentative Plan

**Month 1:**
- Week 1-2: Focus on Trees & Graphs (solve 40-50 problems)
- Week 3-4: Introduction to DP (patterns like 0/1 Knapsack, LCS, etc.)

**Month 2:**
- Week 5-6: Practice DP problems + revision of strong topics
- Week 7: Mock interviews + behavioral prep
- Week 8: Light practice + final revision

**Daily Schedule** (I can dedicate 4-5 hours):
- 2 hours: New problem solving
- 1 hour: Revision of previous problems
- 1 hour: Theory/concepts
- 1 hour: Mock interviews (3-4 times/week)

## Questions for the Community

❓ Is my plan realistic?
❓ Should I modify anything?
❓ What resources worked best for you for DP?
❓ Any Amazon-specific tips?
❓ How many mock interviews should I do?

Really appreciate any guidance! This is my dream opportunity and I don't want to mess it up.

**Edit**: Thanks for all the responses! Based on suggestions, I'm going to focus more on DP fundamentals using Aditya Verma's YouTube playlist. Also signed up for Pramp for free mock interviews!`,
      upvotes: 156,
      downvotes: 3,
      comments: 67,
      timeAgo: "5h ago",
      tags: ["Amazon", "SDE-1", "Preparation"],
      userVote: null,
    },
    {
      id: "3",
      author: { name: "Rahul M", avatar: "R", role: "Ex-Microsoft" },
      category: "tips",
      title: "Top 10 mistakes I made during my first tech interviews",
      content:
        "After giving 50+ interviews and getting rejected many times, here are the mistakes I wish I had avoided earlier. #1: Not asking clarifying questions...",
      fullArticle: `# Top 10 Interview Mistakes That Cost Me Jobs (And How to Avoid Them)

After giving **50+ technical interviews** over 3 years and getting rejected from companies like Google, Microsoft, and Amazon (multiple times), I've finally learned what NOT to do. Here are the biggest mistakes I made:

## 1. Not Asking Clarifying Questions ❌

**The Mistake:**
I jumped straight into coding without understanding the problem fully. In one interview, I spent 30 minutes solving the wrong problem because I assumed integers would be positive.

**The Fix:**
✅ Always ask about:
- Input constraints (size, range, data types)
- Edge cases (null, empty, duplicates)
- Expected output format
- Time/space complexity expectations

**Example:**
- "Can the input be negative?"
- "Do we need to handle duplicates?"
- "What should we return if the input is empty?"

## 2. Silence While Thinking 🤐

**The Mistake:**
I went quiet for 5-10 minutes trying to think of the optimal solution. The interviewer thought I was stuck and started giving hints prematurely.

**The Fix:**
✅ Talk through your thought process:
- "Let me think about this..."
- "I'm considering using a hash map here because..."
- "One approach could be X, but let me think if there's something better..."

**Why it matters:**
Interviewers want to see HOW you think, not just the final answer.

## 3. Jumping to Code Too Quickly 💨

**The Mistake:**
Started writing code without explaining my approach. Made mistakes and had to rewrite everything.

**The Fix:**
✅ Follow this structure:
1. Understand the problem (ask questions)
2. Think of 2-3 approaches
3. Discuss trade-offs
4. Choose the best approach
5. Explain the algorithm step-by-step
6. THEN start coding

**Time saved:** 10-15 minutes by avoiding rewrites!

## 4. Not Testing My Code 🐛

**The Mistake:**
After writing code, I immediately said "I'm done!" without testing. The interviewer found 3 bugs in 2 minutes.

**The Fix:**
✅ Always walk through your code with:
- A simple test case
- An edge case (empty, single element, etc.)
- A complex test case

**Pro tip:** Use meaningful variable names so testing is easier!

## 5. Ignoring Time/Space Complexity 📊

**The Mistake:**
Interviewer asked "What's the complexity?" and I said "umm... O(n) maybe?"

**The Fix:**
✅ Always mention complexity BEFORE coding:
- "My approach will be O(n²) time and O(1) space"
- If asked to optimize: "I can reduce it to O(n log n) using a heap"

**Practice:** Analyze complexity of every problem you solve on LeetCode

## 6. Giving Up Too Easily 😔

**The Mistake:**
When stuck, I said "I don't know" instead of trying different approaches.

**The Fix:**
✅ When stuck, try:
- Start with brute force (it's better than nothing!)
- Think of similar problems you've solved
- Draw examples/diagrams
- Ask for a small hint

**Remember:** Interviewers want to see resilience!

## 7. Not Preparing Behavioral Questions 🗣️

**The Mistake:**
"Tell me about a challenging project" - I rambled for 10 minutes with no clear point.

**The Fix:**
✅ Prepare 5-7 STAR stories:
- **S**ituation: Brief context
- **T**ask: What needed to be done
- **A**ction: What YOU did (use "I", not "we")
- **R**esult: Impact with numbers if possible

**Example:** "Reduced API response time by 60% by implementing Redis caching"

## 8. Bad Communication with Interviewer 🚫

**The Mistake:**
Argued with interviewer when they suggested a different approach.

**The Fix:**
✅ Be collaborative:
- "That's an interesting point, let me think about that..."
- "Oh, I see what you mean. That could work better because..."
- Accept hints gracefully

**Remember:** Interview is a conversation, not a confrontation!

## 9. Not Managing Time Well ⏰

**The Mistake:**
Spent 40 minutes on problem 1 and had only 5 minutes for problem 2.

**The Fix:**
✅ Time management strategy:
- Problem understanding: 3-5 minutes
- Approach discussion: 5-7 minutes
- Coding: 20-25 minutes
- Testing: 5-10 minutes
- Buffer: 5 minutes

**If running out of time:** Explain your complete approach even if you can't code everything

## 10. Not Asking Questions at the End ❓

**The Mistake:**
"Do you have any questions for me?" - "No, I'm good!"

**The Fix:**
✅ Always prepare 3-4 thoughtful questions:
- About the team/project
- About company culture
- About growth opportunities
- About day-to-day work

**Good examples:**
- "What does a typical day look like for this role?"
- "What's the biggest challenge your team is facing?"
- "How do you measure success in this position?"

**Never ask:** Salary, work from home policy (save for HR round)

## Bonus Mistake: Not Following Up ✉️

Send a thank-you email within 24 hours:
- Thank them for their time
- Mention something specific from the interview
- Reiterate your interest

## My Interview Journey Timeline

- **2021**: Started giving interviews, rejected by 10+ companies
- **2022**: Learned from mistakes, cleared Microsoft but low package
- **2023**: Applied these lessons, cleared Google with 40L offer

## Resources That Helped Me

1. **For Communication:** "Cracking the Coding Interview" - Chapter on behavioral questions
2. **For DSA:** NeetCode (better explanations than most YouTube channels)
3. **For Practice:** Daily mock interviews with friends
4. **For System Design:** ByteByteGo newsletter

## Final Thoughts

Every rejection taught me something. The key is to:
1. Record your interviews (if allowed) or write notes immediately after
2. Analyze what went wrong
3. Practice that specific area
4. Try again!

Don't give up. You only need ONE success to change everything! 💪

Feel free to DM me if you want to practice mock interviews together. Happy to help! 🚀`,
      upvotes: 523,
      downvotes: 18,
      comments: 124,
      timeAgo: "1d ago",
      tags: ["Tips", "Interview", "Mistakes"],
      userVote: "up",
    },
    {
      id: "4",
      author: { name: "Tech Events India", avatar: "T", role: "Community" },
      category: "events",
      title: "🚀 Hiring Drive at Flipkart - 500+ positions open!",
      content:
        "Flipkart is conducting a massive hiring drive for SDE roles. Positions available: SDE-1, SDE-2, SDE-3. Apply before Feb 15th. Off-campus allowed!",
      fullArticle: `# 🚀 MEGA Hiring Drive at Flipkart - 500+ Open Positions!

## 🎯 Event Overview

Flipkart is conducting one of its **BIGGEST hiring drives** for 2026! This is a golden opportunity for both freshers and experienced professionals.

**Quick Details:**
- 📅 Application Deadline: **February 15, 2026**
- 🏢 Locations: Bangalore, Hyderabad, Delhi NCR
- 💼 Positions: 500+ across SDE-1, SDE-2, SDE-3
- 🎓 Open to: Off-campus candidates welcome!
- 💰 Package: Competitive (details below)

## 📋 Positions Available

### SDE-1 (Freshers/0-2 years) - 300 positions
**Requirements:**
- B.Tech/M.Tech in CS/IT or related fields
- Strong foundation in DSA
- Knowledge of at least one programming language (Java, Python, C++, Go)
- Understanding of OOP concepts
- Basic knowledge of databases

**Package Range:** ₹12-18 LPA
**Bonus:** Joining bonus + Relocation support

**Interview Process:**
1. Online Assessment (2 coding problems, 90 mins)
2. Technical Round 1 (DSA focus)
3. Technical Round 2 (Problem-solving + Design)
4. Hiring Manager Round

### SDE-2 (2-4 years experience) - 150 positions
**Requirements:**
- 2-4 years of software development experience
- Strong in DSA and System Design
- Experience with microservices architecture
- Knowledge of distributed systems
- Experience with cloud platforms (AWS/GCP/Azure)

**Package Range:** ₹25-35 LPA
**Bonus:** ESOP + Performance bonus

**Interview Process:**
1. Online Assessment (2 coding + 1 design problem)
2. Technical Round 1 (Advanced DSA)
3. Technical Round 2 (System Design)
4. Technical Round 3 (Architecture + Past Projects)
5. Hiring Manager Round

### SDE-3 (4-7 years experience) - 50 positions
**Requirements:**
- 4-7 years of experience in product companies
- Expert in System Design and Architecture
- Experience leading technical initiatives
- Strong in distributed systems, scalability
- Experience mentoring junior engineers

**Package Range:** ₹40-60 LPA
**Bonus:** Significant ESOP + Leadership premium

**Interview Process:**
1. Resume screening (strict)
2. System Design Round 1 (Design complex system)
3. System Design Round 2 (Architecture deep dive)
4. Technical Leadership Round
5. Bar Raiser Round
6. Hiring Manager + Director Round

## 🎯 What Flipkart is Looking For

### Technical Skills
- **Core CS Fundamentals**: DSA, OS, DBMS, Networks
- **Backend Technologies**: Java, Spring Boot, Microservices
- **Databases**: MySQL, MongoDB, Redis, Elasticsearch
- **Cloud & DevOps**: Docker, Kubernetes, AWS
- **Problem-Solving**: LeetCode Medium-Hard level

### Behavioral Traits
- Ownership and accountability
- Customer obsession
- Innovation mindset
- Bias for action
- Team collaboration

## 📚 Preparation Resources

### For SDE-1
1. **DSA Practice:**
   - LeetCode top 150 problems
   - Striver's SDE Sheet
   - Focus on Arrays, Strings, Trees, Graphs, DP

2. **System Design Basics:**
   - Understand REST APIs
   - Database normalization
   - Caching basics (Redis)
   - Load balancing concepts

3. **Projects:**
   - Build 2-3 full-stack projects
   - Deploy them (use free hosting)
   - Be ready to explain architecture

### For SDE-2/3
1. **Advanced DSA:**
   - LeetCode Medium-Hard problems
   - Focus on optimization
   - Time complexity analysis

2. **System Design:**
   - "Designing Data-Intensive Applications" by Martin Kleppmann
   - Gaurav Sen YouTube channel
   - Practice: Design Uber, Instagram, Netflix, etc.

3. **Past Projects:**
   - Document your impact with metrics
   - Be ready to discuss technical decisions
   - Prepare for deep dives

## 💡 Interview Tips (From Previous Candidates)

### Common Questions Asked
1. **DSA:** Array manipulation, Tree traversals, Graph algorithms, DP problems
2. **System Design:** E-commerce platform, notification system, rate limiter
3. **Behavioral:** "Tell me about a time you faced a tight deadline"

### What Helped Candidates Succeed
✅ Clear communication during problem-solving
✅ Starting with brute force, then optimizing
✅ Asking clarifying questions
✅ Drawing diagrams for system design
✅ Discussing trade-offs
✅ Being honest when stuck

### Common Mistakes to Avoid
❌ Not testing code
❌ Silence while thinking
❌ Jumping to code without planning
❌ Not considering edge cases
❌ Arguing with interviewer

## 🔗 How to Apply

### Application Process
1. **Visit:** [careers.flipkart.com](https://careers.flipkart.com) (example link)
2. **Create Profile:** Upload resume (PDF format, max 2MB)
3. **Select Position:** Choose SDE-1/2/3
4. **Online Assessment:** Will be sent within 3-5 days
5. **Results:** Shortlisted candidates notified in 7-10 days

### Application Tips
- **Resume:** Keep it to 1-2 pages, quantify achievements
- **Skills Section:** Only include skills you can defend in interview
- **Projects:** 2-3 strong projects are better than 10 mediocre ones
- **GitHub:** Clean, well-documented code
- **LinkedIn:** Keep it updated and professional

## 📊 Selection Stats (Based on Previous Drives)

**Application to Shortlist:** ~5-8%
**Shortlist to Offer:** ~15-20%
**Overall Success Rate:** ~1-2%

**Don't let stats discourage you!** Good preparation significantly improves your chances.

## 🌟 Why Join Flipkart?

### Learning Opportunities
- Work on products used by 450M+ users
- Exposure to massive scale (handling peak sale traffic)
- Learn from top engineers in India
- Access to internal tech talks and conferences

### Work Culture
- Flexible work hours
- Hybrid work model (3 days office, 2 days WFH)
- Excellent health insurance
- Learning budget (₹50k/year for courses)
- Internal mobility (can switch teams)

### Growth Path
- Clear career ladder
- Bi-annual performance reviews
- Internal job postings
- Mentorship programs
- Leadership development

## 📅 Important Dates

- **Feb 1:** Applications open
- **Feb 15:** Application deadline (11:59 PM IST)
- **Feb 16-20:** Online assessments
- **Feb 21-28:** Shortlist announcements
- **Mar 1-31:** Interview rounds
- **Apr 1-15:** Offer rollouts
- **May/June:** Expected joining

## 🤝 Community Support

**Join Our Prep Groups:**
- WhatsApp Group: [Link] (1000+ members preparing together)
- Discord Server: [Link] (Daily mock interviews)
- Telegram Channel: [Link] (Resources + updates)

**Free Resources:**
- Resume review sessions (Every Saturday)
- Mock interview drives (Twice a week)
- System design workshops (Every Sunday)

## 📞 Contact & Queries

**For Technical Queries:**
- Email: recruitment@flipkart.com
- Phone: 1800-XXX-XXXX (10 AM - 6 PM)

**For Application Status:**
- Check portal dashboard
- Email notifications
- SMS updates

## ⚠️ Important Notes

1. **Apply Early:** Applications reviewed on rolling basis
2. **Be Honest:** False information = instant rejection + blacklist
3. **One Application:** Applying multiple times won't help
4. **Check Spam:** Interview emails might land in spam
5. **Be Prepared:** Keep 1 month free for interview rounds

## 🎊 Success Stories

> "I was working at a service company with 5 LPA. After clearing Flipkart SDE-2, my package jumped to 30 LPA. The preparation was tough but worth it!" - **Amit K, SDE-2**

> "As a fresher from tier-3 college, I never thought I'd get into a product company. Flipkart gave me that chance. Applied in their drive, prepared for 2 months, and here I am!" - **Sneha R, SDE-1**

> "The interview process was fair and transparent. They really test your problem-solving skills, not just rote learning." - **Rahul M, SDE-3**

## 🏆 Final Checklist

Before applying, make sure you have:
- [ ] Updated resume (quantified achievements)
- [ ] Clean GitHub profile (good README files)
- [ ] LinkedIn profile updated
- [ ] 2-3 strong projects to discuss
- [ ] Practiced 100+ DSA problems
- [ ] System design fundamentals clear
- [ ] STAR stories prepared for behavioral
- [ ] Mock interviews done (at least 5)
- [ ] Stable internet for online assessment
- [ ] Quiet place for video interviews

---

**All the best to everyone applying! Let's crush this! 💪🚀**

Remember: This is just one opportunity. If it doesn't work out, there will be others. Keep learning, keep growing!

Share this with friends who might be interested. Let's help each other succeed! 🙌`,
      upvotes: 892,
      downvotes: 5,
      comments: 234,
      timeAgo: "12h ago",
      tags: ["Flipkart", "Hiring", "Event"],
      userVote: null,
    },
    {
      id: "5",
      author: { name: "Sneha R", avatar: "S", role: "SDE @ Razorpay" },
      category: "experience",
      company: "Razorpay",
      title: "My journey from Tier-3 college to Razorpay - No DSA grinding!",
      content:
        "Contrary to popular belief, I got into Razorpay without solving 500 LeetCode problems. Here's how I focused on projects and real-world problem solving...",
      fullArticle: `# From Tier-3 College to Razorpay: My Unconventional Journey

**TL;DR:** Got into Razorpay as SDE-1 with 18 LPA package from a tier-3 college without solving 500 LeetCode problems. Focused on projects, fundamentals, and storytelling instead.

## Background

**College:** Small engineering college in Tamil Nadu (CGPA: 7.8/10)
**Graduation Year:** 2025
**Previous Experience:** 1 internship at a small startup (₹10k/month stipend)
**LeetCode Count:** ~120 problems (mostly easy-medium)

Yes, you read that right. I didn't solve 300+ LeetCode problems. And I still got into a great product company.

## Why I Chose a Different Path

When I started preparing for placements in my 3rd year, everyone around me was grinding LeetCode. But I realized:

1. **I got bored** solving similar problems repeatedly
2. **I wasn't enjoying** the preparation
3. **My strengths** were in building things, not competitive programming

So I decided to try a different approach. If it didn't work, I could always go back to LeetCode grinding.

## My Strategy: Projects Over Practice

Instead of 4-5 hours daily on LeetCode, I:

### Built Real Projects (4-5 months)

**Project 1: Expense Tracker (Full-Stack)**
- Tech: React, Node.js, MongoDB, AWS
- Features: Multi-user support, budgeting, data visualization
- **Key Learning:** Authentication, database design, state management
- **Impact:** Used by 100+ students in my college
- Deployed on AWS EC2 (learned DevOps basics)

**Project 2: Real-time Collaborative Code Editor**
- Tech: Next.js, Socket.io, Redis, Docker
- Features: Multiple users, syntax highlighting, execution
- **Key Learning:** WebSockets, real-time systems, scalability
- **Impact:** Demo-ed in college tech fest, got 2nd place

**Project 3: API Rate Limiter (Open Source)**
- Tech: Go, Redis
- **Key Learning:** Distributed systems, rate limiting algorithms
- **Impact:** Got 200+ stars on GitHub!
- This project was a game-changer in interviews

### Focused on Fundamentals

Instead of advanced algorithms, I mastered:
- **Data Structures:** Arrays, Maps, Trees, Graphs (basic operations)
- **OOP:** Design patterns, SOLID principles
- **Databases:** SQL queries, indexing, normalization
- **System Design:** Basic understanding (caching, load balancing)
- **Operating Systems:** Processes, threads, memory management
- **Networks:** HTTP, TCP/IP, REST APIs

### Prepared Smart, Not Hard

**DSA Practice (2 hours/day for 2 months):**
- Focused on **patterns**, not quantity
- 20-30 problems per pattern (arrays, strings, trees, graphs, DP)
- **Total:** ~120 problems, but understood them deeply
- Could explain WHY each solution works, not just HOW

**System Design (1 hour/day for 1 month):**
- Didn't memorize designs
- Understood trade-offs and when to use what
- Practiced explaining my project architectures

## The Razorpay Interview Process

### Round 1: Online Assessment (Eliminated 80% candidates)
**2 Coding Problems (90 minutes)**

Problem 1: Medium (String manipulation + HashMap)
- Solved in 25 minutes
- Wrote test cases, optimized from O(n²) to O(n)

Problem 2: Medium-Hard (Tree + DFS)
- This was tough! Solved in 50 minutes
- Used a pattern I had practiced

**Result:** Cleared! Got interview call in 3 days

### Round 2: Technical Round 1 (60 mins)
**Interviewer:** Senior SDE

**Part 1 - DSA (30 mins):**
Question: "Implement LRU Cache"
- I had practiced this pattern!
- Explained approach: HashMap + Doubly Linked List
- Coded in 20 minutes, tested with examples
- **Bonus:** Discussed time complexity and why DLL was needed

**Part 2 - Project Deep Dive (25 mins):**
"Tell me about your most complex project"
- Chose my Real-time Code Editor
- Explained architecture with diagrams
- Discussed challenges (race conditions, state sync)
- **They loved** that I had handled real users!

**Questions asked:**
- "How did you handle concurrent edits?"
- "Why WebSockets over HTTP polling?"
- "How would you scale this to 10,000 users?"

**Feedback:** "You think beyond just writing code"

### Round 3: Technical Round 2 (60 mins)
**Interviewer:** Engineering Manager

**Part 1 - System Design (35 mins):**
"Design a simple payment gateway"
- Started with requirements gathering
- Drew architecture diagram
- Discussed database schema
- Talked about security, rate limiting, idempotency
- **Advantage:** My rate limiter project helped here!

**Part 2 - Behavioral (20 mins):**
- "Tell me about a time you failed"
- "How do you handle disagreements?"
- "Why Razorpay?"

**My secret:** Used STAR method + stories from my projects

### Round 4: Hiring Manager Round (45 mins)
**Interviewer:** Director of Engineering

This was more conversational:
- Discussed my learning approach
- Why I chose projects over LeetCode
- Career goals and interests
- Questions about Razorpay culture
- My questions about the team

**Key moment:**
He asked: "You've solved fewer problems than most candidates. Why should we hire you?"

My answer: "I may have solved fewer problems, but I've **built** more. I understand how real systems work, not just algorithmic solutions. When I join Razorpay, I'll be working on products, not LeetCode."

He smiled. I knew I had connected.

### Round 5: HR Round (30 mins)
- Discussed package expectations
- Joining timeline
- Relocation (I requested Bangalore)
- Benefits and policies

## The Offer

**Package:** ₹18 LPA (12L fixed + 6L ESOP)
**Joining Bonus:** ₹1L
**Location:** Bangalore
**Perks:** Health insurance, learning budget, flexible WFH

I cried when I got the offer letter. Coming from a tier-3 college with average grades, this was beyond my dreams.

## What Made the Difference

### ✅ Things That Helped

1. **Strong Projects:**
   - Demonstrated real problem-solving
   - Showed initiative and ownership
   - Proof of shipping code

2. **Deep Understanding:**
   - Could explain WHY, not just WHAT
   - Understood trade-offs
   - Connected concepts to real problems

3. **Clear Communication:**
   - Used diagrams
   - Thought out loud
   - Asked clarifying questions

4. **Genuine Passion:**
   - Actually enjoyed building things
   - Showed curiosity
   - Had opinions on tech choices

5. **GitHub Profile:**
   - Clean, documented code
   - Good README files
   - Active contributions

### ❌ What Didn't Matter

1. College tier or CGPA
2. Number of LeetCode problems solved
3. Competitive programming ratings
4. Internship at big company
5. Certifications

## My Advice (Especially for Tier-2/3 Students)

### 1. Play to Your Strengths
If you love building things, BUILD.
If you love problem-solving, do competitive programming.
Don't force yourself into others' strategies.

### 2. Quality > Quantity
120 well-understood problems > 500 rushed solutions
2 great projects > 10 tutorial clones

### 3. Learn to Tell Your Story
Practice explaining your projects:
- What problem did it solve?
- What were the challenges?
- How did you overcome them?
- What did you learn?

### 4. Document Everything
- Good README files
- Code comments
- Architecture diagrams
- Blog about your learnings

### 5. Network and Get Feedback
- Share projects on LinkedIn/Twitter
- Get code reviews from seniors
- Participate in hackathons
- Join developer communities

### 6. Don't Ignore DSA Completely
You still need fundamentals:
- Master basic data structures
- Understand common patterns
- Practice enough to be confident
- But don't overdo it

### 7. Be Ready to Explain Trade-offs
"Why did you choose MongoDB over PostgreSQL?"
"Why React over Vue?"
"Why microservices over monolith?"

Having opinions (with reasoning) shows maturity.

## Resources That Helped Me

**For Projects:**
- YouTube: Web Dev Simplified, Traversy Media
- Courses: Full Stack Open (free!)
- Ideas: Build from scratch, don't clone tutorials

**For DSA (Smart Practice):**
- NeetCode 150 (focused on patterns)
- Striver's SDE Sheet (selectively)
- GeeksforGeeks (for concept clarity)

**For System Design:**
- Gaurav Sen YouTube
- "Designing Data-Intensive Applications" (read selectively)
- ByteByteGo newsletter

**For Fundamentals:**
- Operating Systems: Gate Smashers YouTube
- DBMS: Knowledge Gate
- Networks: Computer Networks by Tanenbaum

## Common Questions I Get

**Q: Will this work for every company?**
A: Maybe not for companies with hard DSA rounds (Google, Meta). But worked for Razorpay, Flipkart, Swiggy, Paytm.

**Q: How long did this take?**
A: ~6 months of focused preparation:
- 4 months: Projects
- 2 months: DSA + System Design
- Throughout: Fundamentals

**Q: What if I don't have project ideas?**
A: Build things YOU need:
- Automate your daily tasks
- Solve a problem in your college
- Contribute to open source
- Rebuild existing apps with your twist

**Q: Is 18 LPA good for fresher?**
A: It's great for tier-3 college! Average in my college was 3-4 LPA.

## My Current Journey at Razorpay

It's been 3 months since I joined. Here's what I've learned:

**What I Expected:** Would need to upskill in DSA
**Reality:** Projects taught me more about production code

**Actual Work:**
- Building features for dashboard
- Writing tests, reviewing PRs
- Learning from amazing engineers
- Working with real scale (millions of transactions)

**The Best Part:**
That rate limiter I built? We use similar concepts in production!

## Final Thoughts

You don't need to be from IIT.
You don't need 9+ CGPA.
You don't need to solve 1000 LeetCode problems.

You need:
- Strong fundamentals
- Ability to build things
- Clear communication
- Genuine curiosity
- Persistence

**The DSA grind works.** Many people get jobs that way. But it's not the ONLY way.

If you're someone who enjoys building, who gets excited seeing your code run, who wants to create impact - consider this path.

It worked for me. It might work for you too.

---

**Update (Feb 2026):** After my post went viral, I got 500+ DMs. I can't respond to everyone, but here are answers to common questions:

**Q: Can we connect for mentorship?**
A: Created a Discord server! Link in my bio. Join for project feedback, resume reviews, and mock interviews!

**Q: Will you share your projects' GitHub?**
A: Yes! Check my profile. Stars/forks welcome 😊

**Q: Can this work for experienced professionals?**
A: Absolutely! Projects matter even more when you have experience.

Feel free to ask questions in comments. I'll try to answer everyone! 🚀

Good luck with your journey! Remember: There's no single "right" way. Find YOUR way! 💪`,
      upvotes: 1205,
      downvotes: 45,
      comments: 312,
      timeAgo: "2d ago",
      tags: ["Razorpay", "Tier-3", "Projects"],
      userVote: null,
    },
  ]);

  const filters = [
    { id: "all", label: "All", icon: Sparkles },
    { id: "interview", label: "Interviews", icon: MessageCircle },
    { id: "experience", label: "Experiences", icon: TrendingUp },
    { id: "tips", label: "Tips", icon: Briefcase },
    { id: "events", label: "Events", icon: Calendar },
    { id: "question", label: "Questions", icon: Users },
  ];

  const filteredDiscussions =
    activeFilter === "all"
      ? discussions
      : discussions.filter((d) => d.category === activeFilter);

  useEffect(() => {
    if (mainRef.current) {
      animate(mainRef.current.querySelectorAll(".post-card"), {
        translateY: [20, 0],
        opacity: [0, 1],
        delay: stagger(50),
        duration: 400,
        easing: "easeOutExpo",
      });
    }
  }, []);

  const handleVote = (postId: string, voteType: "up" | "down") => {
    setDiscussions((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        const wasUpvoted = post.userVote === "up";
        const wasDownvoted = post.userVote === "down";

        if (voteType === "up") {
          if (wasUpvoted) {
            return { ...post, upvotes: post.upvotes - 1, userVote: null };
          }
          return {
            ...post,
            upvotes: post.upvotes + 1,
            downvotes: wasDownvoted ? post.downvotes - 1 : post.downvotes,
            userVote: "up",
          };
        } else {
          if (wasDownvoted) {
            return { ...post, downvotes: post.downvotes - 1, userVote: null };
          }
          return {
            ...post,
            downvotes: post.downvotes + 1,
            upvotes: wasUpvoted ? post.upvotes - 1 : post.upvotes,
            userVote: "down",
          };
        }
      }),
    );
  };

  const getCategoryStyle = (category: string) => {
    const styles: Record<string, string> = {
      interview: "bg-blue-500/20 text-blue-400",
      experience: "bg-green-500/20 text-green-400",
      tips: "bg-purple-500/20 text-purple-400",
      events: "bg-orange-500/20 text-orange-400",
      question: "bg-yellow-500/20 text-yellow-400",
    };
    return styles[category] || "bg-gray-500/20 text-gray-400";
  };

  // Article view
  if (selectedPost) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        {/* Article Header */}
        <div className="border-b border-white/10 bg-[#0a0a0c]">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Feed
              </button>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-orange-400 border border-orange-500/30">
                {selectedPost.category.charAt(0).toUpperCase() +
                  selectedPost.category.slice(1)}
              </span>
              {selectedPost.company && (
                <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-orange-500/10 to-yellow-500/10 text-orange-400 border border-orange-500/20">
                  {selectedPost.company}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold mb-6">{selectedPost.title}</h1>

            {/* Author Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center text-black font-bold text-lg">
                  {selectedPost.author.avatar}
                </div>
                <div>
                  <p className="font-semibold">{selectedPost.author.name}</p>
                  <p className="text-sm text-white/60">
                    {selectedPost.author.role} • {selectedPost.timeAgo}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Bookmark className="w-5 h-5 text-white/60" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5 text-white/60" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <ArrowBigUp className="w-5 h-5 text-orange-500" />
                <span className="text-white/60">{selectedPost.upvotes}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-white/60" />
                <span className="text-white/60">
                  {selectedPost.comments} comments
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="prose prose-invert prose-lg max-w-none">
            <div
              className="text-white/80 leading-relaxed space-y-6"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {selectedPost.fullArticle.split("\n").map((line, index) => {
                // Headers
                if (line.startsWith("# ")) {
                  return (
                    <h1
                      key={`${index}-${line.slice(0, 20)}`}
                      className="text-3xl font-bold mt-8 mb-4 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent"
                    >
                      {line.replace("# ", "")}
                    </h1>
                  );
                }
                if (line.startsWith("## ")) {
                  return (
                    <h2
                      key={`${index}-${line.slice(0, 20)}`}
                      className="text-2xl font-bold mt-6 mb-3 text-orange-400"
                    >
                      {line.replace("## ", "")}
                    </h2>
                  );
                }
                if (line.startsWith("### ")) {
                  return (
                    <h3
                      key={`${index}-${line.slice(0, 20)}`}
                      className="text-xl font-semibold mt-4 mb-2 text-yellow-400"
                    >
                      {line.replace("### ", "")}
                    </h3>
                  );
                }

                // Bold text
                if (line.startsWith("**") && line.endsWith("**")) {
                  return (
                    <p
                      key={`${index}-${line.slice(0, 20)}`}
                      className="font-bold text-white mt-4"
                    >
                      {line.replace(/\*\*/g, "")}
                    </p>
                  );
                }

                // Lists with checkmarks or bullets
                if (line.startsWith("✅") || line.startsWith("❌")) {
                  return (
                    <p
                      key={`${index}-${line.slice(0, 20)}`}
                      className="ml-4 my-2"
                    >
                      {line}
                    </p>
                  );
                }

                if (line.startsWith("- ")) {
                  return (
                    <li
                      key={`${index}-${line.slice(0, 20)}`}
                      className="ml-6 my-1 text-white/70"
                    >
                      {line.replace("- ", "")}
                    </li>
                  );
                }

                // Blockquotes
                if (line.startsWith("> ")) {
                  return (
                    <blockquote
                      key={`${index}-${line.slice(0, 20)}`}
                      className="border-l-4 border-orange-500 pl-4 italic text-white/70 my-4"
                    >
                      {line.replace("> ", "")}
                    </blockquote>
                  );
                }

                // Horizontal rules
                if (line === "---") {
                  return (
                    <hr
                      key={`hr-${selectedPost.id}-${index}`}
                      className="border-white/10 my-8"
                    />
                  );
                }

                // Regular paragraphs
                if (line.trim()) {
                  return (
                    <p key={`${index}-${line.slice(0, 20)}`} className="my-3">
                      {line}
                    </p>
                  );
                }

                // Empty lines
                return (
                  <div
                    key={`empty-${selectedPost.id}-${index}`}
                    className="h-2"
                  />
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mt-12 pt-8 border-t border-white/10">
            {selectedPost.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-white/5 text-white/60 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Comments Section */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <h2 className="text-2xl font-bold mb-6">
              {selectedPost.comments} Comments
            </h2>
            <div className="bg-white/5 rounded-xl p-6 text-center text-white/60">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Comments section coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Sidebar />

      <div className="lg:ml-64">
        {/* Header */}
        <header className="h-12 sm:h-14 border-b border-white/5 flex items-center justify-between px-3 sm:px-6 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-2 pl-10 lg:pl-0">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
            <h1 className="text-sm sm:text-lg font-semibold">Career Hub</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search discussions..."
                className="w-64 pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowNewPostModal(true)}
              className="px-4 py-2 bg-orange-500 text-black rounded-lg font-medium flex items-center gap-2 hover:bg-orange-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Post
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-3 sm:p-6" ref={mainRef}>
          {/* AI Interview Banner */}
          <a
            href="/interview"
            className="block mb-6 bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 rounded-xl p-4 hover:border-violet-400/50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    AI Mock Interview
                  </h3>
                  <p className="text-xs text-gray-400">
                    Practice with 3D AI interviewer
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-violet-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter.id
                    ? "bg-orange-500 text-black"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <filter.icon className="w-4 h-4" />
                {filter.label}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-gray-500">Sort:</span>
              {["hot", "new", "top"].map((sort) => (
                <button
                  key={sort}
                  type="button"
                  onClick={() => setSortBy(sort as typeof sortBy)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    sortBy === sort
                      ? "bg-white/10 text-white"
                      : "text-gray-500 hover:text-white"
                  }`}
                >
                  {sort.charAt(0).toUpperCase() + sort.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-3">
            {filteredDiscussions.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => setSelectedPost(post)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedPost(post);
                  }
                }}
                className="post-card opacity-0 bg-[#0a0a0c] border border-white/5 rounded-xl p-4 hover:border-white/10 hover:bg-[#0d0d0f] transition-all cursor-pointer w-full text-left"
              >
                <div className="flex gap-3">
                  {/* Vote Column */}
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(post.id, "up");
                      }}
                      className={`p-1 rounded hover:bg-white/10 transition-colors ${
                        post.userVote === "up"
                          ? "text-orange-500"
                          : "text-gray-500"
                      }`}
                    >
                      <ArrowBigUp
                        className="w-6 h-6"
                        fill={post.userVote === "up" ? "currentColor" : "none"}
                      />
                    </button>
                    <span
                      className={`text-sm font-bold ${
                        post.userVote === "up"
                          ? "text-orange-500"
                          : post.userVote === "down"
                            ? "text-blue-500"
                            : "text-gray-400"
                      }`}
                    >
                      {post.upvotes - post.downvotes}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(post.id, "down");
                      }}
                      className={`p-1 rounded hover:bg-white/10 transition-colors ${
                        post.userVote === "down"
                          ? "text-blue-500"
                          : "text-gray-500"
                      }`}
                    >
                      <ArrowBigDown
                        className="w-6 h-6"
                        fill={
                          post.userVote === "down" ? "currentColor" : "none"
                        }
                      />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded ${getCategoryStyle(post.category)}`}
                      >
                        {post.category}
                      </span>
                      {post.company && (
                        <span className="px-2 py-0.5 bg-white/5 rounded">
                          {post.company}
                        </span>
                      )}
                      <span>•</span>
                      <span>Posted by {post.author.name}</span>
                      <span className="text-gray-600">
                        ({post.author.role})
                      </span>
                      <span>•</span>
                      <span>{post.timeAgo}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-white mb-2 hover:text-orange-400 cursor-pointer transition-colors">
                      {post.title}
                    </h3>

                    {/* Preview */}
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                      {post.content}
                    </p>

                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-3">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-white/5 text-gray-400 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {post.comments} Comments
                      </button>
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        <Bookmark className="w-4 h-4" />
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <NewPostModal onClose={() => setShowNewPostModal(false)} />
      )}
    </div>
  );
}

function NewPostModal({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState<string>("experience");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a0a0c] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Create Post</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Category */}
          <div>
            <span className="block text-sm text-gray-400 mb-2">Category</span>
            <div className="flex flex-wrap gap-2">
              {["interview", "experience", "tips", "question", "events"].map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                      category === cat
                        ? "bg-orange-500 text-black"
                        : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="post-title"
              className="block text-sm text-gray-400 mb-2"
            >
              Title
            </label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your experience or question?"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="post-content"
              className="block text-sm text-gray-400 mb-2"
            >
              Content
            </label>
            <textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your full story, tips, or ask your question..."
              rows={6}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 resize-none"
            />
          </div>

          {/* Company (optional) */}
          <div>
            <label
              htmlFor="post-company"
              className="block text-sm text-gray-400 mb-2"
            >
              Company (optional)
            </label>
            <input
              id="post-company"
              type="text"
              placeholder="e.g., Google, Amazon, Flipkart..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-orange-500 text-black rounded-lg font-medium hover:bg-orange-400 transition-colors"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
