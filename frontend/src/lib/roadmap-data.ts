// This file acts as the "Brain" for generating dynamic roadmaps.

export interface TopicResource {
  title: string;
  type: "video" | "article" | "code";
  url: string;
}

export interface RoadmapNodeData {
  id: string;
  title: string;
  description: string;
  xp: number;
  topics: string[];
  resources: TopicResource[];
}

// THE GIANT GENERIC MAP
// Role -> Stack -> Nodes
export const ROADMAP_DATA: Record<string, Record<string, RoadmapNodeData[]>> = {
  frontend: {
    react: [
      {
        id: "fe-basics",
        title: "Web Fundamentals",
        description: "HTML5, Semantic Tags, and CSS Box Model",
        xp: 100,
        topics: ["HTML5", "CSS3", "DOM", "Accessibility", "Semantic HTML"],
        resources: [
          { title: "HTML Crash Course", type: "video", url: "#" },
          { title: "MDN Web Docs", type: "article", url: "#" },
          { title: "CSS Grid & Flexbox", type: "code", url: "#" },
        ],
      },
      {
        id: "css-mastery",
        title: "CSS Mastery",
        description: "Flexbox, Grid, Animations, and Responsive Design",
        xp: 200,
        topics: [
          "Flexbox",
          "Grid",
          "Animations",
          "Media Queries",
          "CSS Variables",
        ],
        resources: [
          { title: "Complete CSS Guide", type: "video", url: "#" },
          { title: "CSS Tricks & Techniques", type: "article", url: "#" },
        ],
      },
      {
        id: "js-core",
        title: "JavaScript Core",
        description: "ES6+, Async/Await, and Closures",
        xp: 300,
        topics: [
          "ES6",
          "Promises",
          "Fetch API",
          "Closures",
          "Prototypes",
          "Event Loop",
        ],
        resources: [
          { title: "JavaScript Info", type: "article", url: "#" },
          { title: "JS Async Await Tutorial", type: "video", url: "#" },
          { title: "Event Loop Visualized", type: "code", url: "#" },
        ],
      },
      {
        id: "js-advanced",
        title: "Advanced JavaScript",
        description: "Design Patterns, Module Systems, and Performance",
        xp: 400,
        topics: [
          "Design Patterns",
          "Modules",
          "Webpack",
          "Performance Optimization",
        ],
        resources: [
          { title: "JS Design Patterns", type: "video", url: "#" },
          { title: "Modern Module Systems", type: "article", url: "#" },
        ],
      },
      {
        id: "react-start",
        title: "React Essentials",
        description: "Components, Props, and State Management",
        xp: 500,
        topics: ["Components", "Hooks", "JSX", "Props", "State", "Lifecycle"],
        resources: [
          { title: "React Docs", type: "article", url: "#" },
          { title: "React Hooks Crash Course", type: "video", url: "#" },
          { title: "Build a React App", type: "code", url: "#" },
        ],
      },
      {
        id: "react-hooks",
        title: "React Hooks Deep Dive",
        description: "useState, useEffect, useContext, Custom Hooks",
        xp: 600,
        topics: [
          "useState",
          "useEffect",
          "useContext",
          "Custom Hooks",
          "useRef",
          "useMemo",
        ],
        resources: [
          { title: "Complete Hooks Guide", type: "video", url: "#" },
          { title: "Custom Hooks Patterns", type: "article", url: "#" },
        ],
      },
      {
        id: "react-adv",
        title: "Advanced React",
        description: "Context API, Redux, and Performance",
        xp: 800,
        topics: ["Redux", "Context", "Memo", "Suspense", "Error Boundaries"],
        resources: [
          { title: "Redux Toolkit Tutorial", type: "video", url: "#" },
          { title: "React Context Guide", type: "article", url: "#" },
        ],
      },
      {
        id: "nextjs",
        title: "Next.js Framework",
        description: "SSR, SSG, API Routes, and App Router",
        xp: 900,
        topics: [
          "Server Components",
          "SSR",
          "SSG",
          "App Router",
          "API Routes",
          "Middleware",
        ],
        resources: [
          { title: "Next.js 14 Complete Guide", type: "video", url: "#" },
          { title: "Next.js Documentation", type: "article", url: "#" },
        ],
      },
      {
        id: "testing",
        title: "Testing & Quality",
        description: "Jest, React Testing Library, E2E Testing",
        xp: 700,
        topics: ["Jest", "RTL", "Cypress", "Unit Testing", "Integration Tests"],
        resources: [
          { title: "Testing React Apps", type: "video", url: "#" },
          { title: "Testing Best Practices", type: "article", url: "#" },
        ],
      },
      {
        id: "deployment",
        title: "Deployment & DevOps",
        description: "CI/CD, Vercel, Docker, Performance Monitoring",
        xp: 600,
        topics: [
          "Vercel",
          "Docker",
          "GitHub Actions",
          "Performance",
          "Monitoring",
        ],
        resources: [
          { title: "Deployment Strategies", type: "video", url: "#" },
          { title: "CI/CD Pipeline Setup", type: "article", url: "#" },
        ],
      },
    ],
    vue: [
      {
        id: "fe-basics",
        title: "Web Fundamentals",
        description: "HTML5, Semantic Tags, and CSS Box Model",
        xp: 100,
        topics: ["HTML5", "CSS3", "DOM", "Accessibility"],
        resources: [
          { title: "HTML5 Full Course", type: "video", url: "#" },
          { title: "CSS Grid vs Flexbox", type: "article", url: "#" },
        ],
      },
      {
        id: "js-core",
        title: "JavaScript Core",
        description: "ES6+, Async/Await, and Closures",
        xp: 300,
        topics: ["ES6", "Promises", "Async/Await", "Closures"],
        resources: [
          { title: "Modern JavaScript Tutorial", type: "video", url: "#" },
          { title: "Closures Explained", type: "article", url: "#" },
        ],
      },
      {
        id: "vue-start",
        title: "Vue 3 Basics",
        description: "Options API vs Composition API",
        xp: 500,
        topics: ["Directives", "State", "Computed", "Watchers", "Reactivity"],
        resources: [
          { title: "Vue 3 Crash Course", type: "video", url: "#" },
          { title: "VueJS Official Docs", type: "article", url: "#" },
        ],
      },
      {
        id: "vue-composition",
        title: "Composition API",
        description: "Modern Vue with Composition API",
        xp: 600,
        topics: ["setup()", "Composables", "Lifecycle Hooks", "Provide/Inject"],
        resources: [
          { title: "Composition API Guide", type: "video", url: "#" },
          { title: "Building Composables", type: "article", url: "#" },
        ],
      },
      {
        id: "vue-router",
        title: "Vue Router",
        description: "Client-side routing and navigation",
        xp: 400,
        topics: [
          "Routes",
          "Navigation Guards",
          "Dynamic Routes",
          "Lazy Loading",
        ],
        resources: [
          { title: "Vue Router Complete Guide", type: "video", url: "#" },
          { title: "Router Patterns", type: "article", url: "#" },
        ],
      },
      {
        id: "pinia",
        title: "Pinia State Management",
        description: "Modern Vuex alternative",
        xp: 500,
        topics: ["Stores", "Actions", "Getters", "State Management"],
        resources: [
          { title: "Pinia Tutorial", type: "video", url: "#" },
          { title: "State Management Patterns", type: "article", url: "#" },
        ],
      },
      {
        id: "nuxt",
        title: "Nuxt Framework",
        description: "SSR and full-stack Vue applications",
        xp: 800,
        topics: ["SSR", "SSG", "Auto-imports", "Server Routes", "Nitro"],
        resources: [
          { title: "Nuxt 3 Complete Guide", type: "video", url: "#" },
          { title: "Nuxt Best Practices", type: "article", url: "#" },
        ],
      },
    ],
    angular: [
      {
        id: "fe-basics",
        title: "Web Fundamentals",
        description: "HTML5, Semantic Tags, and CSS Box Model",
        xp: 100,
        topics: ["HTML5", "CSS3", "DOM", "TypeScript Basics"],
        resources: [
          { title: "HTML & CSS Fundamentals", type: "video", url: "#" },
          { title: "TypeScript Essentials", type: "article", url: "#" },
        ],
      },
      {
        id: "typescript",
        title: "TypeScript Mastery",
        description: "Types, Interfaces, Generics, Decorators",
        xp: 400,
        topics: [
          "Types",
          "Interfaces",
          "Generics",
          "Decorators",
          "Type Guards",
        ],
        resources: [
          { title: "TypeScript Complete Course", type: "video", url: "#" },
          { title: "Advanced TypeScript", type: "article", url: "#" },
        ],
      },
      {
        id: "angular-start",
        title: "Angular Fundamentals",
        description: "Components, Modules, and Services",
        xp: 500,
        topics: ["Components", "Modules", "Dependency Injection", "Services"],
        resources: [
          { title: "Angular Full Course", type: "video", url: "#" },
          { title: "Angular Architecture", type: "article", url: "#" },
        ],
      },
      {
        id: "angular-di",
        title: "Dependency Injection",
        description: "Deep dive into DI and Modules",
        xp: 600,
        topics: [
          "Providers",
          "Injectors",
          "Hierarchical DI",
          "Singleton Services",
        ],
        resources: [
          { title: "DI Patterns in Angular", type: "video", url: "#" },
          { title: "Angular DI Guide", type: "article", url: "#" },
        ],
      },
      {
        id: "rxjs",
        title: "RxJS & Observables",
        description: "Reactive Programming with RxJS",
        xp: 700,
        topics: ["Observables", "Operators", "Subjects", "Async Pipe"],
        resources: [
          { title: "RxJS Complete Guide", type: "video", url: "#" },
          { title: "Reactive Patterns", type: "article", url: "#" },
        ],
      },
      {
        id: "angular-router",
        title: "Angular Router",
        description: "Navigation, Guards, and Lazy Loading",
        xp: 500,
        topics: ["Routes", "Guards", "Lazy Loading", "Route Resolvers"],
        resources: [
          { title: "Angular Router Deep Dive", type: "video", url: "#" },
          { title: "Routing Best Practices", type: "article", url: "#" },
        ],
      },
      {
        id: "ngrx",
        title: "NgRx State Management",
        description: "Redux pattern for Angular",
        xp: 800,
        topics: ["Store", "Actions", "Reducers", "Effects", "Selectors"],
        resources: [
          { title: "NgRx Complete Tutorial", type: "video", url: "#" },
          { title: "State Management Patterns", type: "article", url: "#" },
        ],
      },
    ],
  },
  backend: {
    node: [
      {
        id: "js-fundamentals",
        title: "JavaScript Fundamentals",
        description: "Core JavaScript concepts for backend",
        xp: 200,
        topics: ["ES6+", "Async/Await", "Modules", "Error Handling"],
        resources: [
          { title: "JavaScript for Backend", type: "video", url: "#" },
          { title: "Modern JS Features", type: "article", url: "#" },
        ],
      },
      {
        id: "js-server",
        title: "Server-side JS",
        description: "Node Runtime and Event Loop",
        xp: 300,
        topics: ["Node", "NPM", "Event Loop", "Streams", "File System"],
        resources: [
          { title: "Node.js Crash Course", type: "video", url: "#" },
          { title: "Understanding Event Loop", type: "article", url: "#" },
        ],
      },
      {
        id: "express",
        title: "API Development",
        description: "Building RESTful APIs with Express",
        xp: 500,
        topics: [
          "Routing",
          "Middleware",
          "JWT",
          "Error Handling",
          "Validation",
        ],
        resources: [
          { title: "Express API Tutorial", type: "video", url: "#" },
          { title: "JWT Auth Implementation", type: "article", url: "#" },
        ],
      },
      {
        id: "db-sql",
        title: "Relational Databases",
        description: "PostgreSQL and ORMs",
        xp: 600,
        topics: ["SQL", "Prisma", "Transactions", "Indexing", "Normalization"],
        resources: [
          { title: "SQL Basics 101", type: "video", url: "#" },
          { title: "Prisma ORM Guide", type: "article", url: "#" },
        ],
      },
      {
        id: "db-nosql",
        title: "NoSQL Databases",
        description: "MongoDB, Redis, and Caching",
        xp: 600,
        topics: ["MongoDB", "Redis", "Caching Strategies", "Data Modeling"],
        resources: [
          { title: "MongoDB Complete Guide", type: "video", url: "#" },
          { title: "Redis Caching Patterns", type: "article", url: "#" },
        ],
      },
      {
        id: "auth-security",
        title: "Authentication & Security",
        description: "JWT, OAuth, Security Best Practices",
        xp: 700,
        topics: [
          "JWT",
          "OAuth 2.0",
          "CORS",
          "CSRF",
          "Rate Limiting",
          "Encryption",
        ],
        resources: [
          { title: "Security in Node.js", type: "video", url: "#" },
          { title: "OAuth Implementation", type: "article", url: "#" },
        ],
      },
      {
        id: "testing-backend",
        title: "Backend Testing",
        description: "Unit, Integration, and E2E Testing",
        xp: 500,
        topics: ["Jest", "Supertest", "Integration Tests", "Mocking"],
        resources: [
          { title: "Testing Node Apps", type: "video", url: "#" },
          { title: "Testing Best Practices", type: "article", url: "#" },
        ],
      },
      {
        id: "microservices",
        title: "Microservices Architecture",
        description: "Distributed Systems and Message Queues",
        xp: 900,
        topics: ["Microservices", "RabbitMQ", "API Gateway", "Service Mesh"],
        resources: [
          { title: "Microservices Patterns", type: "video", url: "#" },
          { title: "Message Queue Guide", type: "article", url: "#" },
        ],
      },
      {
        id: "deployment-backend",
        title: "Deployment & DevOps",
        description: "Docker, Kubernetes, CI/CD",
        xp: 800,
        topics: ["Docker", "Kubernetes", "CI/CD", "AWS", "Monitoring"],
        resources: [
          { title: "Docker & Kubernetes", type: "video", url: "#" },
          { title: "DevOps Best Practices", type: "article", url: "#" },
        ],
      },
    ],
    python: [
      {
        id: "py-basics",
        title: "Python Fundamentals",
        description: "Syntax, Data Structures and Core Concepts",
        xp: 200,
        topics: ["Syntax", "Lists", "Dicts", "Functions", "OOP"],
        resources: [
          { title: "Python Full Course", type: "video", url: "#" },
          { title: "Python OOP Explained", type: "article", url: "#" },
        ],
      },
      {
        id: "py-advanced",
        title: "Advanced Python",
        description: "Decorators, Generators, Context Managers",
        xp: 400,
        topics: [
          "Decorators",
          "Generators",
          "Context Managers",
          "Meta classes",
        ],
        resources: [
          { title: "Advanced Python Features", type: "video", url: "#" },
          { title: "Python Design Patterns", type: "article", url: "#" },
        ],
      },
      {
        id: "fastapi",
        title: "FastAPI Framework",
        description: "Modern Async Web Framework",
        xp: 600,
        topics: [
          "Pydantic",
          "Async",
          "Swagger",
          "Dependencies",
          "Background Tasks",
        ],
        resources: [
          { title: "FastAPI Tutorial for Beginners", type: "video", url: "#" },
          { title: "Async Programming in Python", type: "article", url: "#" },
        ],
      },
      {
        id: "django",
        title: "Django Framework",
        description: "Full-featured web framework",
        xp: 700,
        topics: ["Models", "Views", "Templates", "ORM", "Admin Panel"],
        resources: [
          { title: "Django Complete Guide", type: "video", url: "#" },
          { title: "Django Best Practices", type: "article", url: "#" },
        ],
      },
      {
        id: "py-db",
        title: "Database Integration",
        description: "SQLAlchemy, PostgreSQL, MongoDB",
        xp: 600,
        topics: ["SQLAlchemy", "PostgreSQL", "MongoDB", "Alembic Migrations"],
        resources: [
          { title: "SQLAlchemy Tutorial", type: "video", url: "#" },
          { title: "Database Optimization", type: "article", url: "#" },
        ],
      },
      {
        id: "py-testing",
        title: "Testing in Python",
        description: "pytest, unittest, coverage",
        xp: 500,
        topics: ["pytest", "unittest", "Mocking", "Coverage", "TDD"],
        resources: [
          { title: "Python Testing Guide", type: "video", url: "#" },
          { title: "TDD with Python", type: "article", url: "#" },
        ],
      },
      {
        id: "celery",
        title: "Async Task Queues",
        description: "Celery, Redis, Background Jobs",
        xp: 700,
        topics: ["Celery", "Redis", "Task Scheduling", "Workers"],
        resources: [
          { title: "Celery Complete Guide", type: "video", url: "#" },
          { title: "Task Queue Patterns", type: "article", url: "#" },
        ],
      },
      {
        id: "py-deployment",
        title: "Python Deployment",
        description: "Docker, Gunicorn, Nginx",
        xp: 600,
        topics: ["Docker", "Gunicorn", "Nginx", "Systemd", "Supervisor"],
        resources: [
          { title: "Deploying Python Apps", type: "video", url: "#" },
          { title: "Production Setup Guide", type: "article", url: "#" },
        ],
      },
    ],
  },
  ai_engineer: {
    llm: [
      {
        id: "python-ml",
        title: "Python for ML",
        description: "NumPy, Pandas, Matplotlib basics",
        xp: 300,
        topics: ["NumPy", "Pandas", "Matplotlib", "Data Manipulation"],
        resources: [
          { title: "NumPy Crash Course", type: "video", url: "#" },
          { title: "Pandas Complete Guide", type: "article", url: "#" },
        ],
      },
      {
        id: "python-adv",
        title: "Advanced Python",
        description: "Decorators, Generators, for AI",
        xp: 400,
        topics: ["Decorators", "Generators", "Async", "Type Hints"],
        resources: [
          { title: "Advanced Python Techniques", type: "video", url: "#" },
          { title: "Python Best Practices", type: "article", url: "#" },
        ],
      },
      {
        id: "ml-basics",
        title: "Machine Learning Fundamentals",
        description: "Supervised, Unsupervised Learning",
        xp: 600,
        topics: ["Regression", "Classification", "Clustering", "scikit-learn"],
        resources: [
          { title: "ML Crash Course", type: "video", url: "#" },
          { title: "scikit-learn Tutorial", type: "article", url: "#" },
        ],
      },
      {
        id: "deep-learning",
        title: "Deep Learning",
        description: "Neural Networks with PyTorch/TensorFlow",
        xp: 800,
        topics: ["Neural Networks", "PyTorch", "TensorFlow", "Backpropagation"],
        resources: [
          { title: "Deep Learning Specialization", type: "video", url: "#" },
          { title: "PyTorch Tutorial", type: "article", url: "#" },
        ],
      },
      {
        id: "transformers",
        title: "Transformers Architecture",
        description: "Understanding Attention Mechanism",
        xp: 1000,
        topics: ["Attention", "Embeddings", "BERT", "GPT", "Self-Attention"],
        resources: [
          { title: "Transformers Visualized", type: "video", url: "#" },
          { title: "Attention Is All You Need", type: "article", url: "#" },
        ],
      },
      {
        id: "huggingface",
        title: "Hugging Face Ecosystem",
        description: "Pre-trained models and fine-tuning",
        xp: 700,
        topics: [
          "Transformers Library",
          "Datasets",
          "Tokenizers",
          "Fine-tuning",
        ],
        resources: [
          { title: "Hugging Face Course", type: "video", url: "#" },
          { title: "Fine-tuning Guide", type: "article", url: "#" },
        ],
      },
      {
        id: "langchain",
        title: "LangChain & Agents",
        description: "Building AI Applications",
        xp: 900,
        topics: ["Chains", "RAG", "Vector DBs", "Agents", "Memory"],
        resources: [
          { title: "LangChain Crash Course", type: "video", url: "#" },
          { title: "Building RAG Apps", type: "article", url: "#" },
        ],
      },
      {
        id: "vectordb",
        title: "Vector Databases",
        description: "Pinecone, Weaviate, ChromaDB",
        xp: 600,
        topics: ["Embeddings", "Similarity Search", "Pinecone", "ChromaDB"],
        resources: [
          { title: "Vector DB Guide", type: "video", url: "#" },
          { title: "Embeddings Explained", type: "article", url: "#" },
        ],
      },
      {
        id: "llm-deployment",
        title: "LLM Deployment",
        description: "Serving models at scale",
        xp: 800,
        topics: ["Model Serving", "API Design", "Scaling", "Optimization"],
        resources: [
          { title: "Deploying LLMs", type: "video", url: "#" },
          { title: "Production ML Systems", type: "article", url: "#" },
        ],
      },
    ],
    cv: [
      {
        id: "python-ml",
        title: "Python for ML",
        description: "NumPy, Pandas, Matplotlib basics",
        xp: 300,
        topics: ["NumPy", "Pandas", "Matplotlib", "Data Manipulation"],
        resources: [
          { title: "NumPy Crash Course", type: "video", url: "#" },
          { title: "Pandas Complete Guide", type: "article", url: "#" },
        ],
      },
      {
        id: "opencv",
        title: "OpenCV Fundamentals",
        description: "Image processing with OpenCV",
        xp: 500,
        topics: ["Image Processing", "Filters", "Edge Detection", "Morphology"],
        resources: [
          { title: "OpenCV Complete Course", type: "video", url: "#" },
          { title: "Image Processing Guide", type: "article", url: "#" },
        ],
      },
      {
        id: "cnn",
        title: "Convolutional Neural Networks",
        description: "CNNs for image recognition",
        xp: 800,
        topics: ["CNNs", "Convolution", "Pooling", "Transfer Learning"],
        resources: [
          { title: "CNN Explained", type: "video", url: "#" },
          { title: "Transfer Learning Guide", type: "article", url: "#" },
        ],
      },
      {
        id: "object-detection",
        title: "Object Detection",
        description: "YOLO, R-CNN, SSD",
        xp: 900,
        topics: ["YOLO", "R-CNN", "SSD", "Bounding Boxes", "NMS"],
        resources: [
          { title: "Object Detection Tutorial", type: "video", url: "#" },
          { title: "YOLO Implementation", type: "article", url: "#" },
        ],
      },
      {
        id: "segmentation",
        title: "Image Segmentation",
        description: "Semantic and instance segmentation",
        xp: 800,
        topics: ["U-Net", "Mask R-CNN", "Semantic Segmentation"],
        resources: [
          { title: "Segmentation Models", type: "video", url: "#" },
          { title: "U-Net Architecture", type: "article", url: "#" },
        ],
      },
      {
        id: "pose-estimation",
        title: "Pose Estimation",
        description: "Human pose and gesture recognition",
        xp: 700,
        topics: ["OpenPose", "MediaPipe", "Keypoints", "Tracking"],
        resources: [
          { title: "Pose Estimation Guide", type: "video", url: "#" },
          { title: "MediaPipe Tutorial", type: "article", url: "#" },
        ],
      },
      {
        id: "cv-deployment",
        title: "CV Model Deployment",
        description: "Edge devices, ONNX, TensorRT",
        xp: 700,
        topics: ["ONNX", "TensorRT", "Edge Deployment", "Optimization"],
        resources: [
          { title: "Model Optimization", type: "video", url: "#" },
          { title: "Edge AI Guide", type: "article", url: "#" },
        ],
      },
    ],
    data: [
      {
        id: "python-ml",
        title: "Python for Data Science",
        description: "NumPy, Pandas, Matplotlib",
        xp: 300,
        topics: ["NumPy", "Pandas", "Matplotlib", "Seaborn", "Data Viz"],
        resources: [
          { title: "Data Science with Python", type: "video", url: "#" },
          { title: "Pandas Guide", type: "article", url: "#" },
        ],
      },
      {
        id: "statistics",
        title: "Statistics & Probability",
        description: "Statistical analysis fundamentals",
        xp: 500,
        topics: [
          "Probability",
          "Distributions",
          "Hypothesis Testing",
          "A/B Testing",
        ],
        resources: [
          { title: "Statistics for Data Science", type: "video", url: "#" },
          { title: "Probability Theory", type: "article", url: "#" },
        ],
      },
      {
        id: "data-cleaning",
        title: "Data Cleaning & Preprocessing",
        description: "Handling missing data, outliers",
        xp: 400,
        topics: [
          "Missing Data",
          "Outliers",
          "Feature Engineering",
          "Normalization",
        ],
        resources: [
          { title: "Data Cleaning Techniques", type: "video", url: "#" },
          { title: "Feature Engineering Guide", type: "article", url: "#" },
        ],
      },
      {
        id: "sql-analytics",
        title: "SQL for Analytics",
        description: "Advanced SQL queries and optimization",
        xp: 600,
        topics: ["Window Functions", "CTEs", "Query Optimization", "Joins"],
        resources: [
          { title: "Advanced SQL Course", type: "video", url: "#" },
          { title: "SQL Optimization Guide", type: "article", url: "#" },
        ],
      },
      {
        id: "ml-algorithms",
        title: "ML Algorithms",
        description: "Classification, Regression, Clustering",
        xp: 700,
        topics: ["Random Forest", "XGBoost", "K-Means", "PCA"],
        resources: [
          { title: "ML Algorithms Explained", type: "video", url: "#" },
          { title: "Ensemble Methods", type: "article", url: "#" },
        ],
      },
      {
        id: "time-series",
        title: "Time Series Analysis",
        description: "ARIMA, Prophet, forecasting",
        xp: 800,
        topics: ["ARIMA", "Prophet", "Seasonality", "Forecasting"],
        resources: [
          { title: "Time Series Course", type: "video", url: "#" },
          { title: "Forecasting Guide", type: "article", url: "#" },
        ],
      },
      {
        id: "big-data",
        title: "Big Data Tools",
        description: "Spark, Hadoop, distributed processing",
        xp: 900,
        topics: ["Spark", "Hadoop", "PySpark", "Distributed Computing"],
        resources: [
          { title: "Apache Spark Tutorial", type: "video", url: "#" },
          { title: "Big Data Architecture", type: "article", url: "#" },
        ],
      },
      {
        id: "dashboards",
        title: "Data Visualization & BI",
        description: "Tableau, Power BI, Streamlit",
        xp: 600,
        topics: ["Tableau", "Power BI", "Streamlit", "Plotly Dash"],
        resources: [
          { title: "Building Dashboards", type: "video", url: "#" },
          { title: "BI Best Practices", type: "article", url: "#" },
        ],
      },
    ],
  },
};

// Helper to get nodes safely
export function getRoadmapForUser(
  role: string,
  tech: string,
): RoadmapNodeData[] {
  const roleData = ROADMAP_DATA[role];
  if (!roleData) return []; // Fallback

  return roleData[tech] || Object.values(roleData)[0] || [];
}
