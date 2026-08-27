import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ============================================================
  // SKILLS (40+ skills across categories)
  // ============================================================
  const skillsData = [
    // Web Development
    { name: 'HTML', category: 'Web Development' },
    { name: 'CSS', category: 'Web Development' },
    { name: 'JavaScript', category: 'Web Development' },
    { name: 'TypeScript', category: 'Web Development' },
    { name: 'React', category: 'Web Development' },
    { name: 'Next.js', category: 'Web Development' },
    { name: 'Node.js', category: 'Web Development' },
    { name: 'Express', category: 'Web Development' },
    { name: 'REST APIs', category: 'Web Development' },
    { name: 'GraphQL', category: 'Web Development' },
    { name: 'Tailwind CSS', category: 'Web Development' },
    { name: 'Vue.js', category: 'Web Development' },
    // Data Science
    { name: 'Python', category: 'Data Science' },
    { name: 'SQL', category: 'Data Science' },
    { name: 'Statistics', category: 'Data Science' },
    { name: 'Probability', category: 'Data Science' },
    { name: 'NumPy', category: 'Data Science' },
    { name: 'Pandas', category: 'Data Science' },
    { name: 'Data Visualization', category: 'Data Science' },
    { name: 'Jupyter', category: 'Data Science' },
    { name: 'R', category: 'Data Science' },
    // Machine Learning
    { name: 'Machine Learning', category: 'Machine Learning' },
    { name: 'Deep Learning', category: 'Machine Learning' },
    { name: 'PyTorch', category: 'Machine Learning' },
    { name: 'TensorFlow', category: 'Machine Learning' },
    { name: 'NLP', category: 'Machine Learning' },
    { name: 'Computer Vision', category: 'Machine Learning' },
    { name: 'Feature Engineering', category: 'Machine Learning' },
    { name: 'Model Deployment', category: 'Machine Learning' },
    // Cloud & DevOps
    { name: 'Docker', category: 'Cloud & DevOps' },
    { name: 'Kubernetes', category: 'Cloud & DevOps' },
    { name: 'AWS', category: 'Cloud & DevOps' },
    { name: 'Azure', category: 'Cloud & DevOps' },
    { name: 'CI/CD', category: 'Cloud & DevOps' },
    { name: 'Linux', category: 'Cloud & DevOps' },
    { name: 'Git', category: 'Cloud & DevOps' },
    { name: 'Terraform', category: 'Cloud & DevOps' },
    // Other
    { name: 'Cybersecurity', category: 'Other' },
    { name: 'Product Management', category: 'Other' },
    { name: 'UI/UX Design', category: 'Other' },
    { name: 'Agile', category: 'Other' },
    { name: 'System Design', category: 'Other' },
  ]

  console.log('Creating skills...')
  const skills: Record<string, { id: string; name: string; category: string }> = {}
  for (const skill of skillsData) {
    const created = await prisma.skill.upsert({
      where: { name: skill.name },
      update: { category: skill.category },
      create: skill,
    })
    skills[skill.name] = created
  }
  console.log(`Created ${Object.keys(skills).length} skills`)

  // ============================================================
  // PREREQUISITES
  // ============================================================
  console.log('Creating prerequisites...')
  const prerequisiteChains = [
    // HTML -> CSS -> JavaScript -> TypeScript -> React -> Next.js
    ['HTML', 'CSS'],
    ['CSS', 'JavaScript'],
    ['JavaScript', 'TypeScript'],
    ['TypeScript', 'React'],
    ['React', 'Next.js'],
    // Python -> NumPy -> Pandas -> Machine Learning -> Deep Learning
    ['Python', 'NumPy'],
    ['NumPy', 'Pandas'],
    ['Pandas', 'Machine Learning'],
    ['Machine Learning', 'Deep Learning'],
    // Python -> Statistics -> Machine Learning
    ['Python', 'Statistics'],
    ['Statistics', 'Machine Learning'],
    // Linux -> Docker -> Kubernetes
    ['Linux', 'Docker'],
    ['Docker', 'Kubernetes'],
    // JavaScript -> Node.js -> Express -> REST APIs
    ['JavaScript', 'Node.js'],
    ['Node.js', 'Express'],
    ['Express', 'REST APIs'],
    // SQL -> Data Visualization -> Pandas
    ['SQL', 'Data Visualization'],
    ['Data Visualization', 'Pandas'],
    // Additional logical prerequisites
    ['Python', 'Jupyter'],
    ['Statistics', 'Probability'],
    ['Machine Learning', 'NLP'],
    ['Machine Learning', 'Computer Vision'],
    ['Machine Learning', 'Feature Engineering'],
    ['Deep Learning', 'PyTorch'],
    ['Deep Learning', 'TensorFlow'],
    ['Docker', 'CI/CD'],
    ['Git', 'CI/CD'],
    ['CSS', 'Tailwind CSS'],
    ['JavaScript', 'Vue.js'],
    ['JavaScript', 'GraphQL'],
    ['Kubernetes', 'Terraform'],
    ['Machine Learning', 'Model Deployment'],
    ['Docker', 'Model Deployment'],
  ]

  for (const [prereqName, skillName] of prerequisiteChains) {
    const skillRecord = skills[skillName]
    const prereqRecord = skills[prereqName]
    if (skillRecord && prereqRecord) {
      await prisma.prerequisite.upsert({
        where: {
          skillId_prerequisiteId: {
            skillId: skillRecord.id,
            prerequisiteId: prereqRecord.id,
          },
        },
        update: {},
        create: {
          skillId: skillRecord.id,
          prerequisiteId: prereqRecord.id,
        },
      })
    }
  }
  console.log(`Created ${prerequisiteChains.length} prerequisites`)

  // ============================================================
  // RESOURCES (60+ resources)
  // ============================================================
  console.log('Creating resources...')
  const resourcesData = [
    // Web Development - Beginner
    {
      title: 'HTML & CSS for Beginners',
      description: 'Learn the fundamentals of web development with HTML5 and CSS3. Build responsive websites from scratch.',
      type: 'course',
      provider: 'freeCodeCamp',
      url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
      difficulty: 'beginner',
      estimatedHours: 20,
      rating: 4.7,
      skills: ['HTML', 'CSS'],
    },
    {
      title: 'Responsive Web Design Certification',
      description: 'Complete certification covering HTML, CSS, Flexbox, Grid, and responsive design principles.',
      type: 'course',
      provider: 'freeCodeCamp',
      url: 'https://www.freecodecamp.org/learn/responsive-web-design/',
      difficulty: 'beginner',
      estimatedHours: 300,
      rating: 4.8,
      skills: ['HTML', 'CSS'],
    },
    {
      title: 'JavaScript Fundamentals',
      description: 'Master JavaScript basics including variables, functions, loops, DOM manipulation, and ES6+ features.',
      type: 'course',
      provider: 'freeCodeCamp',
      url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/',
      difficulty: 'beginner',
      estimatedHours: 40,
      rating: 4.6,
      skills: ['JavaScript'],
    },
    {
      title: 'The Complete JavaScript Course 2024',
      description: 'From zero to expert. Master modern JavaScript with projects, challenges, and theory.',
      type: 'course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/the-complete-javascript-course/',
      difficulty: 'beginner',
      estimatedHours: 69,
      rating: 4.8,
      skills: ['JavaScript'],
    },
    {
      title: 'JavaScript30 - 30 Day Challenge',
      description: 'Build 30 things in 30 days with vanilla JavaScript. No frameworks, no libraries.',
      type: 'tutorial',
      provider: 'Wes Bos',
      url: 'https://javascript30.com/',
      difficulty: 'beginner',
      estimatedHours: 15,
      rating: 4.9,
      skills: ['JavaScript', 'HTML', 'CSS'],
    },
    // Web Development - Intermediate
    {
      title: 'TypeScript: The Complete Developers Guide',
      description: 'Master TypeScript by building real-world applications. Learn types, generics, decorators, and advanced patterns.',
      type: 'course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/typescript-the-complete-developers-guide/',
      difficulty: 'intermediate',
      estimatedHours: 27,
      rating: 4.7,
      skills: ['TypeScript', 'JavaScript'],
    },
    {
      title: 'React - The Complete Guide',
      description: 'Dive into React.js! Learn React, Hooks, Redux, React Router, Next.js, and more.',
      type: 'course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
      difficulty: 'intermediate',
      estimatedHours: 48,
      rating: 4.7,
      skills: ['React', 'JavaScript', 'TypeScript'],
    },
    {
      title: 'Next.js & React - The Complete Guide',
      description: 'Learn Next.js from the ground up with App Router, Server Components, and full-stack development.',
      type: 'course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/nextjs-react-the-complete-guide/',
      difficulty: 'intermediate',
      estimatedHours: 35,
      rating: 4.8,
      skills: ['Next.js', 'React', 'TypeScript'],
    },
    {
      title: 'Node.js - The Complete Guide',
      description: 'Master Node.js by building real-world REST APIs, GraphQL APIs, and full-stack applications.',
      type: 'course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/nodejs-the-complete-guide/',
      difficulty: 'intermediate',
      estimatedHours: 40,
      rating: 4.7,
      skills: ['Node.js', 'Express', 'REST APIs', 'JavaScript'],
    },
    {
      title: 'Tailwind CSS From Scratch',
      description: 'Learn Tailwind CSS by building real projects. Master utility-first CSS framework.',
      type: 'tutorial',
      provider: 'Tailwind',
      url: 'https://tailwindcss.com/docs',
      difficulty: 'beginner',
      estimatedHours: 8,
      rating: 4.6,
      skills: ['Tailwind CSS', 'CSS'],
    },
    {
      title: 'Vue.js 3 - The Complete Guide',
      description: 'Learn Vue.js 3 from scratch with Composition API, Vuex, and Vue Router.',
      type: 'course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/vuejs-2-the-complete-guide/',
      difficulty: 'intermediate',
      estimatedHours: 32,
      rating: 4.7,
      skills: ['Vue.js', 'JavaScript'],
    },
    {
      title: 'GraphQL with React: The Complete Guide',
      description: 'Build full-stack applications with GraphQL, Apollo Client, and React.',
      type: 'course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/graphql-with-react-course/',
      difficulty: 'intermediate',
      estimatedHours: 13,
      rating: 4.5,
      skills: ['GraphQL', 'React', 'Node.js'],
    },
    {
      title: 'Build a Full-Stack E-Commerce App',
      description: 'Project-based learning: build a complete e-commerce platform with Next.js, Stripe, and PostgreSQL.',
      type: 'project',
      provider: 'YouTube',
      url: 'https://www.youtube.com/watch?v=5miHyP6lExg',
      difficulty: 'advanced',
      estimatedHours: 25,
      rating: 4.6,
      skills: ['Next.js', 'React', 'TypeScript', 'REST APIs'],
    },
    {
      title: 'REST API Design Best Practices',
      description: 'Learn how to design, build, and document production-ready REST APIs.',
      type: 'article',
      provider: 'freeCodeCamp',
      url: 'https://www.freecodecamp.org/news/rest-api-design-best-practices-build-a-rest-api/',
      difficulty: 'intermediate',
      estimatedHours: 3,
      rating: 4.4,
      skills: ['REST APIs', 'Node.js'],
    },
    // Data Science - Beginner
    {
      title: 'Python for Everybody Specialization',
      description: 'Learn to program and analyze data with Python. Perfect for beginners with no programming experience.',
      type: 'course',
      provider: 'Coursera',
      url: 'https://www.coursera.org/specializations/python',
      difficulty: 'beginner',
      estimatedHours: 60,
      rating: 4.8,
      skills: ['Python'],
    },
    {
      title: 'Automate the Boring Stuff with Python',
      description: 'Practical programming for total beginners. Learn Python by automating everyday tasks.',
      type: 'course',
      provider: 'Udemy',
      url: 'https://automatetheboringstuff.com/',
      difficulty: 'beginner',
      estimatedHours: 18,
      rating: 4.7,
      skills: ['Python'],
    },
    {
      title: 'SQL for Data Science',
      description: 'Learn SQL fundamentals for querying databases, joining tables, and aggregating data.',
      type: 'course',
      provider: 'Coursera',
      url: 'https://www.coursera.org/learn/sql-for-data-science',
      difficulty: 'beginner',
      estimatedHours: 15,
      rating: 4.5,
      skills: ['SQL'],
    },
    {
      title: 'The Complete SQL Bootcamp',
      description: 'Become an expert at SQL by learning PostgreSQL. Practice with exercises and real datasets.',
      type: 'course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/the-complete-sql-bootcamp/',
      difficulty: 'beginner',
      estimatedHours: 22,
      rating: 4.7,
      skills: ['SQL'],
    },
    {
      title: 'Statistics and Probability - Khan Academy',
      description: 'Comprehensive introduction to statistics and probability with interactive exercises.',
      type: 'course',
      provider: 'Khan Academy',
      url: 'https://www.khanacademy.org/math/statistics-probability',
      difficulty: 'beginner',
      estimatedHours: 40,
      rating: 4.8,
      skills: ['Statistics', 'Probability'],
    },
    // Data Science - Intermediate
    {
      title: 'Data Science with Python',
      description: 'Learn NumPy, Pandas, Matplotlib, and Seaborn for data analysis and visualization.',
      type: 'course',
      provider: 'Coursera',
      url: 'https://www.coursera.org/specializations/data-science-python',
      difficulty: 'intermediate',
      estimatedHours: 40,
      rating: 4.6,
      skills: ['Python', 'NumPy', 'Pandas', 'Data Visualization'],
    },
    {
      title: 'Python for Data Analysis with Pandas',
      description: 'Master Pandas for data manipulation, cleaning, and analysis. Work with real-world datasets.',
      type: 'course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/data-analysis-with-pandas/',
      difficulty: 'intermediate',
      estimatedHours: 20,
      rating: 4.5,
      skills: ['Pandas', 'Python', 'NumPy'],
    },
    {
      title: 'Data Visualization with Python',
      description: 'Create compelling visualizations using Matplotlib, Seaborn, and Plotly.',
      type: 'course',
      provider: 'Coursera',
      url: 'https://www.coursera.org/learn/python-for-data-visualization',
      difficulty: 'intermediate',
      estimatedHours: 18,
      rating: 4.4,
      skills: ['Data Visualization', 'Python'],
    },
    {
      title: 'Jupyter Notebook Complete Guide',
      description: 'Master Jupyter Notebook for data science workflows, from basics to advanced features.',
      type: 'tutorial',
      provider: 'Jupyter',
      url: 'https://jupyter.org/try',
      difficulty: 'beginner',
      estimatedHours: 5,
      rating: 4.3,
      skills: ['Jupyter', 'Python'],
    },
    {
      title: 'R Programming for Data Science',
      description: 'Learn R programming for statistical analysis, data manipulation, and visualization.',
      type: 'course',
      provider: 'Coursera',
      url: 'https://www.coursera.org/learn/r-programming',
      difficulty: 'intermediate',
      estimatedHours: 30,
      rating: 4.5,
      skills: ['R', 'Statistics'],
    },
    {
      title: 'Exploratory Data Analysis Project',
      description: 'Apply your data science skills to analyze a real dataset end-to-end.',
      type: 'project',
      provider: 'Kaggle',
      url: 'https://www.kaggle.com/learn',
      difficulty: 'intermediate',
      estimatedHours: 15,
      rating: 4.6,
      skills: ['Python', 'Pandas', 'Data Visualization', 'Jupyter'],
    },
    // Machine Learning - Intermediate
    {
      title: 'Machine Learning by Andrew Ng',
      description: 'The gold standard ML course. Learn supervised learning, unsupervised learning, and best practices.',
      type: 'course',
      provider: 'Coursera',
      url: 'https://www.coursera.org/specializations/machine-learning-introduction',
      difficulty: 'intermediate',
      estimatedHours: 60,
      rating: 4.9,
      skills: ['Machine Learning', 'Python', 'Statistics'],
    },
    {
      title: 'Hands-On Machine Learning with Scikit-Learn',
      description: 'Practical machine learning with Python. Build and deploy ML models using industry best practices.',
      type: 'course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/machinelearning/',
      difficulty: 'intermediate',
      estimatedHours: 45,
      rating: 4.7,
      skills: ['Machine Learning', 'Python', 'Feature Engineering'],
    },
    {
      title: 'Feature Engineering for Machine Learning',
      description: 'Learn techniques to create better features for ML models: encoding, scaling, feature selection.',
      type: 'course',
      provider: 'Kaggle',
      url: 'https://www.kaggle.com/learn/feature-engineering',
      difficulty: 'intermediate',
      estimatedHours: 12,
      rating: 4.5,
      skills: ['Feature Engineering', 'Python', 'Machine Learning'],
    },
    // Machine Learning - Advanced
    {
      title: 'Deep Learning Specialization',
      description: 'Master deep learning fundamentals: neural networks, CNNs, RNNs, transformers, and more.',
      type: 'course',
      provider: 'Coursera',
      url: 'https://www.coursera.org/specializations/deep-learning',
      difficulty: 'advanced',
      estimatedHours: 80,
      rating: 4.9,
      skills: ['Deep Learning', 'Machine Learning', 'Python'],
    },
    {
      title: 'PyTorch for Deep Learning',
      description: 'Learn PyTorch from basics to advanced. Build CNNs, GANs, and transformers.',
      type: 'course',
      provider: 'freeCodeCamp',
      url: 'https://www.youtube.com/watch?v=V_xro1bcAuA',
      difficulty: 'advanced',
      estimatedHours: 35,
      rating: 4.7,
      skills: ['PyTorch', 'Deep Learning', 'Python'],
    },
    {
      title: 'TensorFlow Developer Certificate',
      description: 'Prepare for the TensorFlow Developer Certificate. Build and deploy ML models with TensorFlow.',
      type: 'course',
      provider: 'Coursera',
      url: 'https://www.coursera.org/professional-certificates/tensorflow-in-practice',
      difficulty: 'advanced',
      estimatedHours: 50,
      rating: 4.6,
      skills: ['TensorFlow', 'Deep Learning', 'Python'],
    },
    {
      title: 'Natural Language Processing with Transformers',
      description: 'Learn modern NLP with Hugging Face Transformers, BERT, GPT, and fine-tuning techniques.',
      type: 'course',
      provider: 'Hugging Face',
      url: 'https://huggingface.co/learn/nlp-course',
      difficulty: 'advanced',
      estimatedHours: 30,
      rating: 4.7,
      skills: ['NLP', 'Deep Learning', 'Python', 'PyTorch'],
    },
    {
      title: 'Computer Vision with Deep Learning',
      description: 'Master computer vision: image classification, object detection, segmentation, and GANs.',
      type: 'course',
      provider: 'Coursera',
      url: 'https://www.coursera.org/specializations/generative-adversarial-networks-gans',
      difficulty: 'advanced',
      estimatedHours: 40,
      rating: 4.6,
      skills: ['Computer Vision', 'Deep Learning', 'Python', 'TensorFlow'],
    },
    {
      title: 'ML Model Deployment with Docker & FastAPI',
      description: 'Learn to deploy machine learning models to production using Docker, FastAPI, and cloud services.',
      type: 'course',
      provider: 'YouTube',
      url: 'https://www.youtube.com/watch?v=h5wLuVDr0oc',
      difficulty: 'advanced',
      estimatedHours: 15,
      rating: 4.5,
      skills: ['Model Deployment', 'Docker', 'Python', 'Machine Learning'],
    },
    {
      title: 'Build a Recommendation System',
      description: 'Project: Build a production-ready recommendation system using collaborative and content-based filtering.',
      type: 'project',
      provider: 'Kaggle',
      url: 'https://www.kaggle.com/competitions',
      difficulty: 'advanced',
      estimatedHours: 20,
      rating: 4.6,
      skills: ['Machine Learning', 'Python', 'Feature Engineering'],
    },
    // Cloud & DevOps
    {
      title: 'Linux Command Line Basics',
      description: 'Learn essential Linux commands for navigation, file management, and system administration.',
      type: 'course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/linux-mastery/',
      difficulty: 'beginner',
      estimatedHours: 12,
      rating: 4.5,
      skills: ['Linux'],
    },
    {
      title: 'Git & GitHub Complete Guide',
      description: 'Master Git version control from basics to advanced branching strategies and collaboration workflows.',
      type: 'course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/git-and-github-bootcamp/',
      difficulty: 'beginner',
      estimatedHours: 15,
      rating: 4.7,
      skills: ['Git'],
    },
    {
      title: 'Docker Mastery: with Kubernetes + Swarm',
      description: 'Build, compose, deploy, and manage Docker containers and Kubernetes clusters.',
      type: 'course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/docker-mastery/',
      difficulty: 'intermediate',
      estimatedHours: 20,
      rating: 4.7,
      skills: ['Docker', 'Kubernetes', 'Linux'],
    },
    {
      title: 'Kubernetes for the Absolute Beginners',
      description: 'Learn Kubernetes concepts and hands-on labs with practical exercises.',
      type: 'course',
      provider: 'KodeKloud',
      url: 'https://kodekloud.com/courses/kubernetes-for-the-absolute-beginners/',
      difficulty: 'intermediate',
      estimatedHours: 10,
      rating: 4.6,
      skills: ['Kubernetes', 'Docker'],
    },
    {
      title: 'AWS Certified Solutions Architect',
      description: 'Complete preparation for AWS Solutions Architect certification with hands-on labs.',
      type: 'course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/aws-certified-solutions-architect-associate-saa-c03/',
      difficulty: 'intermediate',
      estimatedHours: 50,
      rating: 4.8,
      skills: ['AWS'],
    },
    {
      title: 'Microsoft Azure Fundamentals (AZ-900)',
      description: 'Learn Azure cloud concepts, services, security, and pricing for the AZ-900 certification.',
      type: 'course',
      provider: 'Microsoft Learn',
      url: 'https://learn.microsoft.com/en-us/training/paths/az-900-describe-cloud-concepts/',
      difficulty: 'beginner',
      estimatedHours: 20,
      rating: 4.5,
      skills: ['Azure'],
    },
    {
      title: 'CI/CD with GitHub Actions',
      description: 'Automate your development workflow with GitHub Actions. Build, test, and deploy automatically.',
      type: 'tutorial',
      provider: 'GitHub',
      url: 'https://docs.github.com/en/actions/learn-github-actions',
      difficulty: 'intermediate',
      estimatedHours: 8,
      rating: 4.6,
      skills: ['CI/CD', 'Git', 'Docker'],
    },
    {
      title: 'Terraform for Infrastructure as Code',
      description: 'Learn infrastructure as code with Terraform. Deploy and manage cloud resources programmatically.',
      type: 'course',
      provider: 'HashiCorp',
      url: 'https://developer.hashicorp.com/terraform/tutorials',
      difficulty: 'advanced',
      estimatedHours: 18,
      rating: 4.6,
      skills: ['Terraform', 'AWS', 'Docker'],
    },
    {
      title: 'Deploy a Microservices Application',
      description: 'Project: Deploy a microservices app using Docker Compose and Kubernetes on AWS.',
      type: 'project',
      provider: 'YouTube',
      url: 'https://www.youtube.com/watch?v=s_o8dwzRlu4',
      difficulty: 'advanced',
      estimatedHours: 20,
      rating: 4.5,
      skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
    },
    // Other
    {
      title: 'Cybersecurity Fundamentals',
      description: 'Introduction to cybersecurity concepts, threats, encryption, and network security.',
      type: 'course',
      provider: 'Coursera',
      url: 'https://www.coursera.org/specializations/intro-cyber-security',
      difficulty: 'beginner',
      estimatedHours: 25,
      rating: 4.5,
      skills: ['Cybersecurity', 'Linux'],
    },
    {
      title: 'Product Management Fundamentals',
      description: 'Learn product strategy, user research, roadmapping, and stakeholder management.',
      type: 'course',
      provider: 'Coursera',
      url: 'https://www.coursera.org/specializations/product-management',
      difficulty: 'beginner',
      estimatedHours: 20,
      rating: 4.4,
      skills: ['Product Management', 'Agile'],
    },
    {
      title: 'UI/UX Design Bootcamp',
      description: 'Learn user interface and user experience design with Figma. Design real products.',
      type: 'course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/complete-web-designer-mobile-designer-zero-to-mastery/',
      difficulty: 'beginner',
      estimatedHours: 30,
      rating: 4.6,
      skills: ['UI/UX Design'],
    },
    {
      title: 'Agile & Scrum Master Certification',
      description: 'Master Agile methodologies and Scrum framework for effective project management.',
      type: 'course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/agile-scrum-master-certification/',
      difficulty: 'intermediate',
      estimatedHours: 12,
      rating: 4.5,
      skills: ['Agile', 'Product Management'],
    },
    {
      title: 'System Design Interview Prep',
      description: 'Learn to design scalable systems. Cover load balancers, databases, caching, and microservices.',
      type: 'course',
      provider: 'YouTube',
      url: 'https://www.youtube.com/watch?v=F2FmTdLtb_4',
      difficulty: 'advanced',
      estimatedHours: 25,
      rating: 4.7,
      skills: ['System Design'],
    },
    {
      title: 'Web Security & Ethical Hacking',
      description: 'Learn to find and fix security vulnerabilities in web applications. OWASP Top 10 coverage.',
      type: 'course',
      provider: 'PortSwigger',
      url: 'https://portswigger.net/web-security',
      difficulty: 'intermediate',
      estimatedHours: 20,
      rating: 4.6,
      skills: ['Cybersecurity', 'JavaScript', 'Node.js'],
    },
    // Additional resources to reach 60+
    {
      title: 'Advanced React Patterns',
      description: 'Master advanced React patterns: compound components, render props, hooks patterns, and performance.',
      type: 'course',
      provider: 'Frontend Masters',
      url: 'https://frontendmasters.com/courses/advanced-react-patterns/',
      difficulty: 'advanced',
      estimatedHours: 15,
      rating: 4.8,
      skills: ['React', 'TypeScript'],
    },
    {
      title: 'Full-Stack Open',
      description: 'Free full-stack course from University of Helsinki covering React, Node, MongoDB, GraphQL, and TypeScript.',
      type: 'course',
      provider: 'University of Helsinki',
      url: 'https://fullstackopen.com/en/',
      difficulty: 'intermediate',
      estimatedHours: 100,
      rating: 4.9,
      skills: ['React', 'Node.js', 'TypeScript', 'GraphQL', 'REST APIs'],
    },
    {
      title: 'Python Data Structures & Algorithms',
      description: 'Master data structures and algorithms in Python for coding interviews.',
      type: 'course',
      provider: 'LeetCode',
      url: 'https://leetcode.com/explore/learn/',
      difficulty: 'intermediate',
      estimatedHours: 30,
      rating: 4.6,
      skills: ['Python'],
    },
    {
      title: 'NumPy Complete Guide',
      description: 'Learn NumPy for numerical computing: arrays, linear algebra, random numbers, and broadcasting.',
      type: 'tutorial',
      provider: 'NumPy',
      url: 'https://numpy.org/doc/stable/user/absolute_beginners.html',
      difficulty: 'beginner',
      estimatedHours: 6,
      rating: 4.5,
      skills: ['NumPy', 'Python'],
    },
    {
      title: 'Machine Learning A-Z: AI, Python & R',
      description: 'Learn to create Machine Learning Algorithms in Python and R with hands-on exercises.',
      type: 'course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/machinelearning/',
      difficulty: 'intermediate',
      estimatedHours: 44,
      rating: 4.5,
      skills: ['Machine Learning', 'Python', 'R'],
    },
    {
      title: 'AWS Machine Learning Specialty',
      description: 'Prepare for the AWS ML Specialty cert. Deploy ML models at scale on AWS.',
      type: 'course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/aws-machine-learning/',
      difficulty: 'advanced',
      estimatedHours: 30,
      rating: 4.5,
      skills: ['Machine Learning', 'AWS', 'Model Deployment'],
    },
    {
      title: 'Build a Chat Application with React & Node.js',
      description: 'Project: Build a real-time chat application using Socket.io, React, and Node.js.',
      type: 'project',
      provider: 'YouTube',
      url: 'https://www.youtube.com/watch?v=ZwFA3YMfkoc',
      difficulty: 'intermediate',
      estimatedHours: 12,
      rating: 4.5,
      skills: ['React', 'Node.js', 'JavaScript'],
    },
    {
      title: 'Build a Machine Learning Portfolio',
      description: 'Project: Create 5 ML projects covering regression, classification, NLP, CV, and deployment.',
      type: 'project',
      provider: 'Kaggle',
      url: 'https://www.kaggle.com/learn',
      difficulty: 'advanced',
      estimatedHours: 40,
      rating: 4.6,
      skills: ['Machine Learning', 'Deep Learning', 'Python', 'Model Deployment'],
    },
    {
      title: 'Intro to Deep Learning with PyTorch',
      description: 'Video series introducing neural networks, backpropagation, and PyTorch fundamentals.',
      type: 'video',
      provider: 'YouTube',
      url: 'https://www.youtube.com/watch?v=c36lUUr864M',
      difficulty: 'intermediate',
      estimatedHours: 10,
      rating: 4.7,
      skills: ['PyTorch', 'Deep Learning', 'Python'],
    },
    {
      title: 'Understanding CSS Grid Layout',
      description: 'Complete guide to CSS Grid: areas, templates, auto-placement, and responsive patterns.',
      type: 'article',
      provider: 'CSS-Tricks',
      url: 'https://css-tricks.com/snippets/css/complete-guide-grid/',
      difficulty: 'beginner',
      estimatedHours: 4,
      rating: 4.5,
      skills: ['CSS', 'HTML'],
    },
    {
      title: 'Docker for Data Scientists',
      description: 'Learn Docker specifically for data science workflows: Jupyter, model serving, and reproducibility.',
      type: 'tutorial',
      provider: 'Docker',
      url: 'https://docs.docker.com/guides/data-science/',
      difficulty: 'intermediate',
      estimatedHours: 6,
      rating: 4.4,
      skills: ['Docker', 'Python', 'Jupyter'],
    },
    {
      title: 'Advanced SQL for Analytics',
      description: 'Master window functions, CTEs, recursive queries, and query optimization for analytics.',
      type: 'course',
      provider: 'Mode Analytics',
      url: 'https://mode.com/sql-tutorial',
      difficulty: 'advanced',
      estimatedHours: 15,
      rating: 4.6,
      skills: ['SQL'],
    },
  ]

  const resources: Record<string, { id: string; title: string }> = {}
  for (const resource of resourcesData) {
    const { skills: resourceSkills, ...resourceFields } = resource
    const created = await prisma.resource.create({
      data: resourceFields,
    })
    resources[resource.title] = created

    // Create resource-skill associations
    for (const skillName of resourceSkills) {
      if (skills[skillName]) {
        await prisma.resourceSkill.create({
          data: {
            resourceId: created.id,
            skillId: skills[skillName].id,
          },
        })
      }
    }
  }
  console.log(`Created ${Object.keys(resources).length} resources with skill associations`)

  // ============================================================
  // ASSESSMENTS WITH QUESTIONS
  // ============================================================
  console.log('Creating assessments...')

  const assessmentsData = [
    {
      title: 'Python Fundamentals Assessment',
      description: 'Test your knowledge of Python basics including syntax, data types, and control flow.',
      skillName: 'Python',
      difficulty: 'beginner',
      questions: [
        {
          text: 'What is the output of print(type(3.14))?',
          options: ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'double'>"],
          correctIndex: 1,
          explanation: "3.14 is a floating-point number, so its type is 'float'.",
        },
        {
          text: 'Which of the following is used to define a function in Python?',
          options: ['function', 'func', 'def', 'define'],
          correctIndex: 2,
          explanation: "The 'def' keyword is used to define functions in Python.",
        },
        {
          text: 'What does the len() function return when called on a dictionary?',
          options: ['The number of values', 'The number of key-value pairs', 'The total memory size', 'An error'],
          correctIndex: 1,
          explanation: 'len() on a dictionary returns the number of key-value pairs.',
        },
        {
          text: 'Which data structure is immutable in Python?',
          options: ['List', 'Dictionary', 'Set', 'Tuple'],
          correctIndex: 3,
          explanation: 'Tuples are immutable - once created, their elements cannot be changed.',
        },
        {
          text: 'What is the correct way to handle exceptions in Python?',
          options: ['try/catch', 'try/except', 'try/handle', 'do/catch'],
          correctIndex: 1,
          explanation: "Python uses 'try/except' blocks for exception handling.",
        },
      ],
    },
    {
      title: 'JavaScript Core Concepts',
      description: 'Assess your understanding of JavaScript fundamentals including closures, async, and ES6.',
      skillName: 'JavaScript',
      difficulty: 'intermediate',
      questions: [
        {
          text: 'What is the output of typeof null in JavaScript?',
          options: ['"null"', '"undefined"', '"object"', '"boolean"'],
          correctIndex: 2,
          explanation: "typeof null returns 'object' - this is a known JavaScript quirk from its early implementation.",
        },
        {
          text: 'Which statement about closures is correct?',
          options: [
            'Closures can only access global variables',
            'A closure gives access to an outer function\'s scope from an inner function',
            'Closures are the same as callbacks',
            'Closures cannot access variables after the outer function returns',
          ],
          correctIndex: 1,
          explanation: 'A closure is a function that has access to variables from its outer (enclosing) function scope, even after the outer function has returned.',
        },
        {
          text: 'What does the "===" operator check in JavaScript?',
          options: ['Value equality only', 'Type equality only', 'Value and type equality', 'Reference equality'],
          correctIndex: 2,
          explanation: 'The strict equality operator (===) checks both value and type without type coercion.',
        },
        {
          text: 'What is the output of: console.log([..."hello"])?',
          options: ['["hello"]', '["h","e","l","l","o"]', 'Error', '"hello"'],
          correctIndex: 1,
          explanation: 'The spread operator on a string splits it into individual characters in an array.',
        },
        {
          text: 'Which method returns a new array without modifying the original?',
          options: ['push()', 'splice()', 'map()', 'sort()'],
          correctIndex: 2,
          explanation: 'map() returns a new array with the results of calling a function on every element, without modifying the original array.',
        },
      ],
    },
    {
      title: 'Machine Learning Concepts',
      description: 'Test your understanding of ML fundamentals including algorithms, evaluation, and best practices.',
      skillName: 'Machine Learning',
      difficulty: 'intermediate',
      questions: [
        {
          text: 'What type of machine learning problem is email spam detection?',
          options: ['Regression', 'Clustering', 'Binary Classification', 'Dimensionality Reduction'],
          correctIndex: 2,
          explanation: 'Spam detection is a binary classification problem - emails are classified as either spam or not spam.',
        },
        {
          text: 'What is overfitting?',
          options: [
            'When a model performs poorly on training data',
            'When a model performs well on training data but poorly on unseen data',
            'When a model is too simple',
            'When there is too little training data',
          ],
          correctIndex: 1,
          explanation: 'Overfitting occurs when a model learns the training data too well, including its noise, resulting in poor generalization to new data.',
        },
        {
          text: 'Which metric is most appropriate for imbalanced classification datasets?',
          options: ['Accuracy', 'F1-Score', 'Mean Squared Error', 'R-Squared'],
          correctIndex: 1,
          explanation: 'F1-Score (harmonic mean of precision and recall) is preferred for imbalanced datasets because accuracy can be misleading.',
        },
        {
          text: 'What is the purpose of cross-validation?',
          options: [
            'To increase training data size',
            'To evaluate model performance more robustly',
            'To speed up training',
            'To reduce the number of features',
          ],
          correctIndex: 1,
          explanation: 'Cross-validation provides a more robust estimate of model performance by training and evaluating on different subsets of the data.',
        },
        {
          text: 'Which algorithm is best suited for finding natural groupings in data without labels?',
          options: ['Linear Regression', 'Random Forest', 'K-Means Clustering', 'Logistic Regression'],
          correctIndex: 2,
          explanation: 'K-Means is an unsupervised clustering algorithm that groups similar data points without requiring labeled data.',
        },
      ],
    },
    {
      title: 'SQL Proficiency Test',
      description: 'Evaluate your SQL skills including queries, joins, aggregations, and subqueries.',
      skillName: 'SQL',
      difficulty: 'intermediate',
      questions: [
        {
          text: 'What is the difference between INNER JOIN and LEFT JOIN?',
          options: [
            'No difference',
            'LEFT JOIN returns all rows from the left table, INNER JOIN only returns matching rows',
            'INNER JOIN is faster',
            'LEFT JOIN cannot use ON clause',
          ],
          correctIndex: 1,
          explanation: 'LEFT JOIN returns all rows from the left table and matching rows from the right. INNER JOIN only returns rows where there is a match in both tables.',
        },
        {
          text: 'Which SQL clause is used to filter groups created by GROUP BY?',
          options: ['WHERE', 'HAVING', 'FILTER', 'GROUP FILTER'],
          correctIndex: 1,
          explanation: 'HAVING is used to filter groups after GROUP BY. WHERE filters individual rows before grouping.',
        },
        {
          text: 'What does the COALESCE function do?',
          options: [
            'Combines two tables',
            'Returns the first non-NULL value from a list',
            'Converts data types',
            'Counts NULL values',
          ],
          correctIndex: 1,
          explanation: 'COALESCE returns the first non-NULL value in the list of arguments.',
        },
        {
          text: 'Which type of subquery returns a single value?',
          options: ['Correlated subquery', 'Scalar subquery', 'Table subquery', 'Nested subquery'],
          correctIndex: 1,
          explanation: 'A scalar subquery returns exactly one row and one column (a single value).',
        },
        {
          text: 'What is the correct order of SQL clause execution?',
          options: [
            'SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY',
            'FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY',
            'FROM, SELECT, WHERE, GROUP BY, ORDER BY, HAVING',
            'SELECT, FROM, GROUP BY, WHERE, HAVING, ORDER BY',
          ],
          correctIndex: 1,
          explanation: 'SQL processes clauses in this order: FROM (source), WHERE (row filter), GROUP BY (grouping), HAVING (group filter), SELECT (columns), ORDER BY (sorting).',
        },
      ],
    },
    {
      title: 'React Development Assessment',
      description: 'Test your React knowledge including hooks, state management, and component patterns.',
      skillName: 'React',
      difficulty: 'intermediate',
      questions: [
        {
          text: 'What is the primary purpose of the useEffect hook?',
          options: [
            'To manage component state',
            'To perform side effects in function components',
            'To create refs',
            'To memoize expensive calculations',
          ],
          correctIndex: 1,
          explanation: 'useEffect is used for side effects like data fetching, subscriptions, and DOM manipulation in function components.',
        },
        {
          text: 'What happens when you call setState with the same value as the current state?',
          options: [
            'The component always re-renders',
            'React may bail out of re-rendering',
            'An error is thrown',
            'The component unmounts',
          ],
          correctIndex: 1,
          explanation: 'React uses Object.is comparison and may skip re-rendering if the new state is identical to the current state.',
        },
        {
          text: 'Which pattern is used to share logic between components without changing the component hierarchy?',
          options: ['Higher-Order Components', 'Custom Hooks', 'Both A and B', 'Neither'],
          correctIndex: 2,
          explanation: 'Both HOCs and custom hooks allow sharing logic between components. Custom hooks are the modern preferred approach.',
        },
        {
          text: 'What is the correct dependency array for useEffect that should only run on mount?',
          options: ['No dependency array', 'Empty array []', '[props]', 'undefined'],
          correctIndex: 1,
          explanation: 'An empty dependency array [] means the effect runs only once after the initial render (on mount).',
        },
        {
          text: 'What is React.memo used for?',
          options: [
            'Memoizing expensive calculations',
            'Preventing unnecessary re-renders of a component',
            'Creating memoized event handlers',
            'Storing values between renders',
          ],
          correctIndex: 1,
          explanation: 'React.memo is a higher-order component that prevents re-renders when props have not changed.',
        },
      ],
    },
  ]

  const assessments: Record<string, { id: string }> = {}
  for (const assessment of assessmentsData) {
    const { questions, skillName, ...assessmentFields } = assessment
    const created = await prisma.assessment.create({
      data: {
        ...assessmentFields,
        skillId: skills[skillName].id,
        questions: {
          create: questions,
        },
      },
    })
    assessments[assessment.title] = created
  }
  console.log(`Created ${Object.keys(assessments).length} assessments with questions`)

  // ============================================================
  // DEMO USER
  // ============================================================
  console.log('Creating demo user...')

  const passwordHash = await bcrypt.hash('password123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Alex Johnson',
      passwordHash,
    },
  })

  // Create learner profile
  const profile = await prisma.learnerProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      experienceLevel: 'intermediate',
      weeklyHours: 8,
      preferredLearningStyle: 'visual',
      preferredDifficulty: 'intermediate',
      currentRole: 'Junior Data Analyst',
    },
  })

  // Create interests
  const interestNames = ['Machine Learning', 'Data Science', 'Python']
  for (const name of interestNames) {
    await prisma.interest.upsert({
      where: {
        profileId_name: {
          profileId: profile.id,
          name,
        },
      },
      update: {},
      create: {
        profileId: profile.id,
        name,
      },
    })
  }

  // Create learner skills
  const learnerSkillsData = [
    { skillName: 'Python', proficiency: 3, yearsExperience: 2 },
    { skillName: 'SQL', proficiency: 2, yearsExperience: 1.5 },
    { skillName: 'JavaScript', proficiency: 2, yearsExperience: 1 },
    { skillName: 'HTML', proficiency: 4, yearsExperience: 3 },
    { skillName: 'CSS', proficiency: 3, yearsExperience: 3 },
  ]

  for (const ls of learnerSkillsData) {
    await prisma.learnerSkill.upsert({
      where: {
        profileId_skillId: {
          profileId: profile.id,
          skillId: skills[ls.skillName].id,
        },
      },
      update: { proficiency: ls.proficiency, yearsExperience: ls.yearsExperience },
      create: {
        profileId: profile.id,
        skillId: skills[ls.skillName].id,
        proficiency: ls.proficiency,
        yearsExperience: ls.yearsExperience,
      },
    })
  }

  // Create goal
  const goal = await prisma.goal.create({
    data: {
      profileId: profile.id,
      title: 'Become a Machine Learning Engineer',
      description: 'Transition from data analysis to machine learning engineering, building and deploying ML models in production.',
      targetRole: 'Machine Learning Engineer',
      timeframeMonths: 6,
      status: 'active',
      requiredSkills: ['Machine Learning', 'Deep Learning', 'Python', 'Docker', 'Model Deployment'],
    },
  })

  // Create learning path
  const learningPath = await prisma.learningPath.create({
    data: {
      profileId: profile.id,
      goalId: goal.id,
      title: 'ML Engineer Learning Path',
      description: 'A structured path to become a Machine Learning Engineer in 6 months.',
      status: 'active',
    },
  })

  // Create learning path items across phases
  const pathItemsData = [
    // Phase 1: Foundations
    {
      order: 1,
      phase: 'foundations',
      status: 'completed',
      title: 'Python for Data Science Review',
      description: 'Refresh Python skills with focus on data science libraries.',
      resourceTitle: 'Python for Everybody Specialization',
      skillName: 'Python',
      estimatedHours: 10,
      isMilestone: false,
    },
    {
      order: 2,
      phase: 'foundations',
      status: 'completed',
      title: 'Statistics Fundamentals',
      description: 'Build a solid foundation in statistics for ML.',
      resourceTitle: 'Statistics and Probability - Khan Academy',
      skillName: 'Statistics',
      estimatedHours: 20,
      isMilestone: false,
    },
    {
      order: 3,
      phase: 'foundations',
      status: 'in_progress',
      title: 'NumPy & Pandas Mastery',
      description: 'Master numerical computing and data manipulation.',
      resourceTitle: 'Data Science with Python',
      skillName: 'Pandas',
      estimatedHours: 25,
      isMilestone: false,
    },
    {
      order: 4,
      phase: 'foundations',
      status: 'not_started',
      title: 'Foundations Milestone: Data Pipeline Project',
      description: 'Build a complete data processing pipeline to demonstrate foundational skills.',
      skillName: 'Python',
      estimatedHours: 8,
      isMilestone: true,
    },
    // Phase 2: Core ML
    {
      order: 5,
      phase: 'core',
      status: 'not_started',
      title: 'Machine Learning Fundamentals',
      description: 'Learn core ML algorithms and concepts.',
      resourceTitle: 'Machine Learning by Andrew Ng',
      skillName: 'Machine Learning',
      estimatedHours: 60,
      isMilestone: false,
    },
    {
      order: 6,
      phase: 'core',
      status: 'locked',
      title: 'Feature Engineering',
      description: 'Learn to create effective features for ML models.',
      resourceTitle: 'Feature Engineering for Machine Learning',
      skillName: 'Feature Engineering',
      estimatedHours: 12,
      isMilestone: false,
    },
    {
      order: 7,
      phase: 'core',
      status: 'locked',
      title: 'Hands-On ML Practice',
      description: 'Apply ML algorithms to real-world datasets.',
      resourceTitle: 'Hands-On Machine Learning with Scikit-Learn',
      skillName: 'Machine Learning',
      estimatedHours: 45,
      isMilestone: false,
    },
    {
      order: 8,
      phase: 'core',
      status: 'locked',
      title: 'Core ML Milestone: Build a Recommendation System',
      description: 'Complete a recommendation system project to demonstrate ML skills.',
      resourceTitle: 'Build a Recommendation System',
      skillName: 'Machine Learning',
      estimatedHours: 20,
      isMilestone: true,
    },
    // Phase 3: Deep Learning
    {
      order: 9,
      phase: 'specialization',
      status: 'locked',
      title: 'Deep Learning Fundamentals',
      description: 'Learn neural networks and deep learning.',
      resourceTitle: 'Deep Learning Specialization',
      skillName: 'Deep Learning',
      estimatedHours: 80,
      isMilestone: false,
    },
    {
      order: 10,
      phase: 'specialization',
      status: 'locked',
      title: 'PyTorch Deep Dive',
      description: 'Master PyTorch for building deep learning models.',
      resourceTitle: 'PyTorch for Deep Learning',
      skillName: 'PyTorch',
      estimatedHours: 35,
      isMilestone: false,
    },
    // Phase 4: Deployment
    {
      order: 11,
      phase: 'capstone',
      status: 'locked',
      title: 'Docker for ML',
      description: 'Learn containerization for ML model deployment.',
      resourceTitle: 'ML Model Deployment with Docker & FastAPI',
      skillName: 'Docker',
      estimatedHours: 15,
      isMilestone: false,
    },
    {
      order: 12,
      phase: 'capstone',
      status: 'locked',
      title: 'Capstone: End-to-End ML Project',
      description: 'Build, train, and deploy a complete ML model to production.',
      resourceTitle: 'Build a Machine Learning Portfolio',
      skillName: 'Model Deployment',
      estimatedHours: 40,
      isMilestone: true,
    },
  ]

  for (const item of pathItemsData) {
    const { resourceTitle, skillName, ...itemFields } = item
    await prisma.learningPathItem.create({
      data: {
        ...itemFields,
        learningPathId: learningPath.id,
        resourceId: resourceTitle ? resources[resourceTitle]?.id : undefined,
        skillId: skillName ? skills[skillName]?.id : undefined,
      },
    })
  }

  // Create some progress entries for the demo user
  const completedResource = resources['Python for Everybody Specialization']
  if (completedResource) {
    await prisma.progress.create({
      data: {
        profileId: profile.id,
        resourceId: completedResource.id,
        status: 'completed',
        completedAt: new Date('2024-09-15'),
        timeSpent: 55,
      },
    })
  }

  const statsResource = resources['Statistics and Probability - Khan Academy']
  if (statsResource) {
    await prisma.progress.create({
      data: {
        profileId: profile.id,
        resourceId: statsResource.id,
        status: 'completed',
        completedAt: new Date('2024-10-20'),
        timeSpent: 38,
      },
    })
  }

  const inProgressResource = resources['Data Science with Python']
  if (inProgressResource) {
    await prisma.progress.create({
      data: {
        profileId: profile.id,
        resourceId: inProgressResource.id,
        status: 'in_progress',
        timeSpent: 15,
      },
    })
  }

  console.log('Demo user created successfully')
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
