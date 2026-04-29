export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/this-project", label: "This Project" },
  { href: "/help", label: "Help" },
  { href: "/contact", label: "Contact" }
];

export const metrics = [
  { value: "01", label: "MERN stack development with frontend and backend ownership" },
  { value: "02", label: "Portfolio messaging secured with email verification" },
  { value: "03", label: "Current academic journey through BCA at Amity University Online" }
];

export const chips = ["MongoDB", "Express", "React", "Node.js", "JavaScript", "Resend"];

export const aboutHighlights = [
  {
    title: "Current role",
    body:
      "I am currently a MERN stack developer focused on building reliable web applications with strong frontend experiences and dependable backend systems."
  },
  {
    title: "Education",
    body:
      "I am currently pursuing a BCA degree from Amity University Online, where I am continuing to strengthen both technical depth and problem-solving discipline."
  },
  {
    title: "What I am building",
    body:
      "searchOnMe is my portfolio base, while globMe is my ongoing product project. Together they represent both my current execution and my direction as a developer."
  }
];

export const projects = [
  {
    eyebrow: "Ongoing project",
    tag: "Social media-like platform",
    title: "globMe",
    featured: true,
    body:
      "globMe is my current ongoing project, a social media-like website inspired by modern social platforms. I am shaping it as a product with room for community interaction, profile-driven experiences, content flow, and scalable MERN architecture.",
    points: [
      "Active development with social-product exploration in motion",
      "Focused on user interaction, structure, usability, and long-term growth",
      "Represents the future direction of my portfolio work"
    ]
  },
  {
    eyebrow: "Current portfolio",
    tag: "Full-stack build",
    title: "searchOnMe",
    body:
      "searchOnMe is my current portfolio platform, combining a React frontend, secure Express backend, MongoDB data flow, and verified contact communication."
  },
  {
    eyebrow: "Future-ready section",
    tag: "More work coming",
    title: "Upcoming Projects",
    body:
      "This portfolio is structured so I can keep adding new projects as I build them. Future work can be added by extending the projects data list without changing the section layout."
  }
];

export const projectsSectionNote =
  "Projects in this section are data-driven, so more future builds can be added easily as my work grows.";

export const helpCards = [
  {
    number: "01",
    title: "How to reach me",
    body: "Use the contact form for project work, collaboration, questions, or opportunities related to MERN stack development."
  },
  {
    number: "02",
    title: "How verification works",
    body: "Every message is verified by email before it reaches me, which keeps the portfolio contact workflow clean and more secure."
  },
  {
    number: "03",
    title: "What to include",
    body: "Share your project goal, timeline, stack needs, or the kind of help you want so I can respond with better context."
  }
];

export const thisProjectOverview = {
  title: "searchOnMe",
  body:
    "searchOnMe is my current full-stack portfolio platform. It combines a React frontend, a secure Node.js and Express backend, MongoDB data handling, Resend-powered transactional email, and a verified contact flow that keeps communication professional and trustworthy."
};

export const thisProjectFeatureGroups = [
  {
    title: "Frontend features",
    items: [
      "React-based portfolio interface with page-based navigation",
      "Component-specific CSS Modules for scoped styling",
      "Separate routes for Home, About, Projects, This Project, Help, and Contact",
      "Private admin asset pages for resume, academic documents, and photos",
      "Responsive layout designed for future content expansion"
    ]
  },
  {
    title: "Backend features",
    items: [
      "Express API with MongoDB and Mongoose models",
      "Verified contact flow using tokenized email confirmation",
      "Admin authentication with JWT stored in HTTP-only cookies",
      "Protected admin routes for viewing messages and replying",
      "Admin-only Cloudinary signed uploads for portfolio assets",
      "Resend email service for verification, admin alerts, and replies"
    ]
  },
  {
    title: "Security and validation",
    items: [
      "bcrypt password hashing for admin credentials",
      "helmet and cors configuration for safer HTTP handling",
      "express-rate-limit for message endpoint protection",
      "express-validator input validation",
      "Verification only after email confirmation before admin notification"
    ]
  }
];

export const thisProjectApiRoutes = [
  "GET /api/health",
  "POST /api/messages",
  "GET /api/messages/verify/:token",
  "POST /api/admin/login",
  "POST /api/admin/logout",
  "GET /api/admin/messages",
  "GET /api/admin/messages/:id",
  "POST /api/admin/reply/:id",
  "GET /api/admin/assets",
  "POST /api/admin/assets/signature",
  "POST /api/admin/assets",
  "DELETE /api/admin/assets/:id"
];

export const thisProjectFrontendDependencies = [
  "react",
  "react-dom",
  "vite",
  "@vitejs/plugin-react"
];

export const thisProjectBackendDependencies = [
  "express",
  "mongoose",
  "bcryptjs",
  "jsonwebtoken",
  "cookie-parser",
  "cors",
  "helmet",
  "express-rate-limit",
  "express-validator",
  "dotenv",
  "resend",
  "nodemon"
];

export const thisProjectDeployment = [
  "Frontend is prepared for Vercel deployment",
  "Backend is prepared for Render deployment",
  "Frontend uses VITE_API_BASE_URL for backend communication",
  "Backend uses CLIENT_URL for trusted frontend access",
  "Client and server are separated into their own folders for clean deployment"
];
