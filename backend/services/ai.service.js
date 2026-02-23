const axios = require('axios');

// OpenAI API configuration
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Google Gemini API configuration (alternative)
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Generate interview questions using AI
 */
const generateQuestions = async (techStack, level) => {
  try {
    const prompt = `Generate 5 technical interview questions for a ${level} level ${techStack} developer. 
    For each question, provide:
    1. The question text
    2. An expected answer or key points that should be covered
    
    Format the response as a JSON array with this structure:
    [
      {
        "question": "Question text here",
        "expectedAnswer": "Expected answer or key points here"
      },
      ...
    ]
    
    Make the questions appropriate for ${level} level and focused on ${techStack}.`;

    // Use OpenAI if API key is available, otherwise use Gemini
    if (process.env.OPENAI_API_KEY) {
      return await generateWithOpenAI(prompt);
    } else if (process.env.GEMINI_API_KEY) {
      return await generateWithGemini(prompt);
    } else {
      // Fallback to mock questions if no API key is configured
      return getMockQuestions(techStack, level);
    }
  } catch (error) {
    console.error('Error generating questions:', error);
    // Return mock questions as fallback
    return getMockQuestions(techStack, level);
  }
};

/**
 * Generate questions using OpenAI API
 */
const generateWithOpenAI = async (prompt) => {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a technical interview expert. Generate interview questions and return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const content = response.data.choices[0].message.content;
    // Extract JSON from response (handle cases where AI adds extra text)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Generate questions using Google Gemini API
 */
const generateWithGemini = async (prompt) => {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `${prompt}\n\nReturn only valid JSON array, no additional text.`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.candidates[0].content.parts[0].text;
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(content);
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Evaluate user's answer using AI
 */
const evaluateAnswer = async (question, expectedAnswer, userAnswer) => {
  try {
    const prompt = `Evaluate the following interview answer:

Question: ${question}

Expected Answer/Key Points: ${expectedAnswer}

User's Answer: ${userAnswer}

Provide:
1. A score from 0-100 based on how well the answer matches the expected answer
2. Detailed feedback on what was good and what could be improved

Return a JSON object with this structure:
{
  "score": 85,
  "feedback": "Your feedback here"
}`;

    if (process.env.OPENAI_API_KEY) {
      return await evaluateWithOpenAI(prompt);
    } else if (process.env.GEMINI_API_KEY) {
      return await evaluateWithGemini(prompt);
    } else {
      // Fallback to mock evaluation
      return getMockEvaluation(userAnswer, expectedAnswer);
    }
  } catch (error) {
    console.error('Error evaluating answer:', error);
    return getMockEvaluation(userAnswer, expectedAnswer);
  }
};

/**
 * Evaluate answer using OpenAI API
 */
const evaluateWithOpenAI = async (prompt) => {
  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a technical interview evaluator. Return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI Evaluation Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Evaluate answer using Google Gemini API
 */
const evaluateWithGemini = async (prompt) => {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `${prompt}\n\nReturn only valid JSON object, no additional text.`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.candidates[0].content.parts[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(content);
  } catch (error) {
    console.error('Gemini Evaluation Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Mock questions for fallback (when API keys are not configured)
 */
const getMockQuestions = (techStack, level) => {
  const questionSets = {
    React: {
      Fresher: [
        {
          question: 'What is React and what are its main features?',
          expectedAnswer: 'React is a JavaScript library for building user interfaces. Main features include: Virtual DOM, Component-based architecture, JSX syntax, One-way data binding, and React Hooks.',
        },
        {
          question: 'Explain the difference between props and state in React.',
          expectedAnswer: 'Props are read-only data passed from parent to child components. State is mutable data managed within a component. Props are immutable, state can be changed using setState or useState hook.',
        },
        {
          question: 'What are React Hooks? Name a few commonly used hooks.',
          expectedAnswer: 'React Hooks are functions that let you use state and lifecycle features in functional components. Common hooks: useState, useEffect, useContext, useReducer, useMemo, useCallback.',
        },
        {
          question: 'What is the Virtual DOM and why is it important?',
          expectedAnswer: 'Virtual DOM is a lightweight copy of the real DOM. React uses it to optimize updates by comparing changes and updating only what changed, improving performance.',
        },
        {
          question: 'Explain the component lifecycle in React.',
          expectedAnswer: 'Components go through mounting, updating, and unmounting phases. With hooks, useEffect handles lifecycle: componentDidMount (empty deps), componentDidUpdate (with deps), componentWillUnmount (return cleanup function).',
        },
      ],
      '2-3 Years': [
        {
          question: 'How does React handle performance optimization? Discuss memoization techniques.',
          expectedAnswer: 'React uses React.memo, useMemo, useCallback for memoization. React.memo prevents re-renders of components, useMemo caches computed values, useCallback caches functions. Also uses code splitting, lazy loading.',
        },
        {
          question: 'Explain React Context API and when to use it.',
          expectedAnswer: 'Context API provides a way to pass data through component tree without prop drilling. Use when data needs to be accessed by many components at different nesting levels. Created with createContext, provided with Provider, consumed with useContext.',
        },
        {
          question: 'What are Higher Order Components (HOCs) and custom hooks? Compare their use cases.',
          expectedAnswer: 'HOCs are functions that take a component and return enhanced component. Custom hooks are functions starting with "use" that encapsulate reusable logic. HOCs for component composition, hooks for stateful logic reuse.',
        },
        {
          question: 'How do you handle state management in large React applications?',
          expectedAnswer: 'For large apps, use Redux, Zustand, or Context API. Redux for complex state with middleware, Context for simpler global state, Zustand for lightweight solution. Consider state normalization and selectors.',
        },
        {
          question: 'Explain React Server Components and their benefits.',
          expectedAnswer: 'Server Components render on server, reducing client bundle size. They can access backend resources directly, improve performance, and enable better SEO. Client Components marked with "use client" directive.',
        },
      ],
      Senior: [
        {
          question: 'Design a scalable React architecture for a large-scale application. Discuss patterns and best practices.',
          expectedAnswer: 'Use feature-based folder structure, implement design patterns like Container/Presentational, use state management library (Redux/Zustand), implement code splitting, lazy loading, error boundaries, implement proper testing strategy, use TypeScript, implement CI/CD.',
        },
        {
          question: 'How would you optimize a React application experiencing performance issues?',
          expectedAnswer: 'Profile with React DevTools, identify bottlenecks, implement memoization (React.memo, useMemo, useCallback), optimize re-renders, implement virtualization for lists, code splitting, lazy loading, optimize images, use Web Workers for heavy computations, implement proper caching strategies.',
        },
        {
          question: 'Explain React concurrent features and how they improve user experience.',
          expectedAnswer: 'Concurrent rendering allows React to interrupt rendering work. Features include: Suspense for data fetching, startTransition for non-urgent updates, useDeferredValue for deferring updates. Improves perceived performance and responsiveness.',
        },
        {
          question: 'How do you handle authentication and authorization in React applications?',
          expectedAnswer: 'Use JWT tokens stored securely (httpOnly cookies preferred), implement protected routes, use context/state management for auth state, implement token refresh mechanism, handle token expiration, implement role-based access control (RBAC), use middleware for route protection.',
        },
        {
          question: 'Discuss testing strategies for React applications. What tools and approaches do you use?',
          expectedAnswer: 'Unit tests with Jest and React Testing Library, integration tests, E2E tests with Cypress/Playwright, test component behavior not implementation, use MSW for API mocking, achieve high coverage for critical paths, test accessibility, implement visual regression testing.',
        },
      ],
    },
    Node: {
      Fresher: [
        {
          question: 'What is Node.js and what is it used for?',
          expectedAnswer: 'Node.js is a JavaScript runtime built on Chrome V8 engine. Used for building server-side applications, APIs, real-time applications, microservices. Enables JavaScript on server.',
        },
        {
          question: 'Explain the event loop in Node.js.',
          expectedAnswer: 'Event loop handles asynchronous operations. It has phases: timers, pending callbacks, idle/prepare, poll, check, close callbacks. Allows non-blocking I/O operations.',
        },
        {
          question: 'What is the difference between require and import in Node.js?',
          expectedAnswer: 'require is CommonJS (synchronous, used in older Node), import is ES6 modules (asynchronous, modern). require uses module.exports, import uses export/export default.',
        },
        {
          question: 'What are streams in Node.js and why are they useful?',
          expectedAnswer: 'Streams are objects for handling data in chunks. Types: Readable, Writable, Duplex, Transform. Useful for handling large files, real-time data processing, memory efficiency.',
        },
        {
          question: 'Explain middleware in Express.js.',
          expectedAnswer: 'Middleware are functions that execute during request-response cycle. They can modify request/response, end cycle, call next middleware. Examples: body-parser, cors, authentication middleware.',
        },
      ],
      '2-3 Years': [
        {
          question: 'How do you handle errors in Node.js applications? Discuss best practices.',
          expectedAnswer: 'Use try-catch for synchronous code, handle promise rejections, use error middleware in Express, implement global error handler, use error classes, proper logging, graceful shutdown, handle uncaught exceptions and unhandled rejections.',
        },
        {
          question: 'Explain clustering and how it improves Node.js performance.',
          expectedAnswer: 'Clustering allows creating child processes that share server ports. Uses all CPU cores, improves performance for CPU-intensive tasks. Master process manages workers, distributes load.',
        },
        {
          question: 'How do you secure a Node.js API? Discuss authentication and common vulnerabilities.',
          expectedAnswer: 'Use HTTPS, implement JWT authentication, validate input (express-validator), sanitize data, use helmet.js, rate limiting, CORS properly configured, avoid SQL injection (use ORM), protect against XSS, keep dependencies updated, use environment variables for secrets.',
        },
        {
          question: 'What is the difference between process.nextTick and setImmediate?',
          expectedAnswer: 'process.nextTick executes before any other async operation, has higher priority. setImmediate executes in next iteration of event loop. nextTick can starve event loop if used recursively.',
        },
        {
          question: 'How do you optimize database queries in Node.js applications?',
          expectedAnswer: 'Use connection pooling, implement query caching, use indexes, avoid N+1 queries, use aggregation pipelines, implement pagination, use database transactions, optimize queries, use read replicas, implement database sharding for scale.',
        },
      ],
      Senior: [
        {
          question: 'Design a microservices architecture using Node.js. Discuss communication patterns, service discovery, and data consistency.',
          expectedAnswer: 'Design independent services, use API Gateway, implement service discovery (Consul, Eureka), use message queues (RabbitMQ, Kafka) for async communication, implement circuit breakers, use distributed tracing, handle distributed transactions (Saga pattern), implement health checks, use containerization (Docker), orchestration (Kubernetes).',
        },
        {
          question: 'How would you scale a Node.js application to handle millions of requests?',
          expectedAnswer: 'Horizontal scaling with load balancers, use clustering/worker threads, implement caching (Redis), use CDN, database optimization (read replicas, sharding), use message queues, implement rate limiting, use connection pooling, optimize code, use monitoring and auto-scaling.',
        },
        {
          question: 'Explain event-driven architecture in Node.js. How do you implement it?',
          expectedAnswer: 'Event-driven architecture uses events to trigger actions. Implement with EventEmitter, use message brokers (RabbitMQ, Kafka), implement pub/sub pattern, use event sourcing, CQRS pattern. Benefits: loose coupling, scalability, real-time processing.',
        },
        {
          question: 'How do you implement real-time features in Node.js? Compare different approaches.',
          expectedAnswer: 'Use WebSockets (Socket.io), Server-Sent Events (SSE), or polling. Socket.io provides fallbacks, rooms, namespaces. For high scale, use Redis adapter for multi-server setup. Consider WebRTC for peer-to-peer. Implement proper connection management and scaling strategies.',
        },
        {
          question: 'Discuss monitoring and observability in production Node.js applications.',
          expectedAnswer: 'Implement logging (Winston, Pino), use APM tools (New Relic, Datadog), implement metrics (Prometheus), distributed tracing (Jaeger, Zipkin), set up alerts, monitor error rates, response times, resource usage, implement health check endpoints, use structured logging, implement log aggregation.',
        },
      ],
    },
    MERN: {
      Fresher: [
        {
          question: 'What is the MERN stack and what does each component do?',
          expectedAnswer: 'MERN = MongoDB (NoSQL database), Express (Node.js web framework), React (frontend library), Node.js (JavaScript runtime). MongoDB stores data, Express handles API, React builds UI, Node.js runs server.',
        },
        {
          question: 'How do you connect React frontend to Express backend?',
          expectedAnswer: 'Use axios/fetch to make HTTP requests from React to Express API endpoints. Configure CORS in Express, use environment variables for API URLs, handle errors and loading states in React.',
        },
        {
          question: 'Explain the flow of data in a MERN application.',
          expectedAnswer: 'User interacts with React UI -> React makes API call -> Express receives request -> Express queries MongoDB -> MongoDB returns data -> Express sends response -> React updates UI.',
        },
        {
          question: 'What is REST API and how is it used in MERN stack?',
          expectedAnswer: 'REST is architectural style for APIs. Uses HTTP methods (GET, POST, PUT, DELETE), stateless, returns JSON. Express defines routes, React consumes these endpoints.',
        },
        {
          question: 'How do you handle authentication in a MERN application?',
          expectedAnswer: 'User registers/logs in -> Backend validates -> Returns JWT token -> Frontend stores token -> Sends token in Authorization header -> Backend verifies token -> Grants access.',
        },
      ],
      '2-3 Years': [
        {
          question: 'How do you structure a MERN application for scalability?',
          expectedAnswer: 'Separate concerns: models, controllers, routes, middleware. Use environment variables, implement error handling, use validation libraries, implement logging, use design patterns, organize frontend with feature-based structure, implement state management.',
        },
        {
          question: 'Explain how you would implement file uploads in a MERN application.',
          expectedAnswer: 'Use multer middleware in Express, configure storage (disk/memory/cloud), handle file validation, upload to cloud storage (AWS S3, Cloudinary), return URL to frontend, store URL in MongoDB, display in React.',
        },
        {
          question: 'How do you handle real-time updates in a MERN application?',
          expectedAnswer: 'Use Socket.io on both Express and React. Express creates Socket.io server, React connects as client. Emit events from server, listen in React. Use rooms/namespaces for organization. Update React state on events.',
        },
        {
          question: 'Discuss state management in MERN applications. When would you use Redux vs Context API?',
          expectedAnswer: 'Context API for simple global state (auth, theme). Redux for complex state, time-travel debugging, middleware needs. Consider app size, team preference, learning curve. Can use Zustand as middle ground.',
        },
        {
          question: 'How do you optimize a MERN application for production?',
          expectedAnswer: 'Backend: compression, caching, database indexing, connection pooling. Frontend: code splitting, lazy loading, image optimization, minification, CDN. Both: environment variables, error handling, logging, monitoring, security best practices.',
        },
      ],
      Senior: [
        {
          question: 'Design a complete MERN application architecture for an enterprise-level product. Include deployment strategy.',
          expectedAnswer: 'Microservices or modular monolith, API Gateway, load balancers, containerization (Docker), orchestration (Kubernetes), CI/CD pipelines, database sharding/replication, caching layer (Redis), message queues, monitoring (APM, logs, metrics), security (WAF, rate limiting, encryption), CDN, backup strategies, disaster recovery.',
        },
        {
          question: 'How would you implement a search feature with filters in a MERN application?',
          expectedAnswer: 'Backend: Use MongoDB text indexes or Elasticsearch, implement aggregation pipelines, handle pagination, optimize queries. Frontend: Debounce search input, implement filter UI, handle loading states, cache results, implement infinite scroll or pagination.',
        },
        {
          question: 'Explain how you would implement role-based access control (RBAC) in a MERN application.',
          expectedAnswer: 'Define roles and permissions in database, middleware to check permissions, protect routes in Express, conditionally render UI in React based on roles, implement admin dashboard, audit logs for security actions.',
        },
        {
          question: 'How do you handle data consistency and transactions in a MERN application?',
          expectedAnswer: 'Use MongoDB transactions for multi-document operations, implement optimistic locking, use event sourcing for critical operations, implement idempotency keys, handle race conditions, use database constraints, implement proper error handling and rollbacks.',
        },
        {
          question: 'Discuss testing strategies for a MERN application. How do you ensure code quality?',
          expectedAnswer: 'Backend: Unit tests (Jest), integration tests, API testing (Supertest). Frontend: Component tests (React Testing Library), E2E tests (Cypress). Use ESLint, Prettier, Husky for pre-commit hooks, implement CI/CD with test automation, achieve high coverage, test critical paths.',
        },
      ],
    },
    DSA: {
      Fresher: [
        {
          question: 'What is the time complexity of binary search and how does it work?',
          expectedAnswer: 'Time complexity: O(log n). Works by repeatedly dividing sorted array in half, comparing target with middle element, eliminating half of elements each iteration.',
        },
        {
          question: 'Explain the difference between an array and a linked list.',
          expectedAnswer: 'Array: contiguous memory, fixed size (usually), O(1) access, O(n) insertion/deletion. Linked list: non-contiguous, dynamic size, O(n) access, O(1) insertion/deletion at head.',
        },
        {
          question: 'What is a stack and what are its main operations?',
          expectedAnswer: 'Stack is LIFO data structure. Main operations: push (add top), pop (remove top), peek (view top), isEmpty. Used in recursion, expression evaluation, undo operations.',
        },
        {
          question: 'Explain the concept of Big O notation.',
          expectedAnswer: 'Big O describes worst-case time/space complexity. O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, O(n²) quadratic. Describes how algorithm scales with input size.',
        },
        {
          question: 'What is recursion and what are its base cases?',
          expectedAnswer: 'Recursion is function calling itself. Base case stops recursion. Must have base case to prevent infinite recursion. Used in tree traversal, divide-and-conquer algorithms.',
        },
      ],
      '2-3 Years': [
        {
          question: 'Implement and explain the time complexity of merge sort.',
          expectedAnswer: 'Merge sort: Divide array, recursively sort halves, merge sorted halves. Time: O(n log n) all cases. Space: O(n). Stable sorting algorithm. Explain divide-and-conquer approach.',
        },
        {
          question: 'What is a hash table and how does it achieve O(1) average case lookup?',
          expectedAnswer: 'Hash table uses hash function to map keys to array indices. O(1) average case, O(n) worst case (collisions). Handle collisions with chaining or open addressing. Load factor important for performance.',
        },
        {
          question: 'Explain different tree traversal methods and their use cases.',
          expectedAnswer: 'Inorder (left-root-right): gives sorted order for BST. Preorder (root-left-right): copy tree structure. Postorder (left-right-root): delete tree. Level-order: BFS, processes by levels. Each has different applications.',
        },
        {
          question: 'What is dynamic programming? Explain with an example.',
          expectedAnswer: 'DP solves problems by breaking into subproblems, storing results to avoid recomputation. Two approaches: top-down (memoization) and bottom-up (tabulation). Example: Fibonacci, longest common subsequence.',
        },
        {
          question: 'Compare BFS and DFS algorithms. When would you use each?',
          expectedAnswer: 'BFS uses queue, explores level by level, finds shortest path. DFS uses stack/recursion, explores depth first. BFS for shortest path, level-order. DFS for topological sort, cycle detection, maze solving.',
        },
      ],
      Senior: [
        {
          question: 'Design an efficient data structure for a social media feed with real-time updates.',
          expectedAnswer: 'Use combination: Hash map for O(1) user lookup, priority queue/heap for feed ordering, linked list for user posts, caching layer. Consider: time complexity for insert/update/retrieve, handle millions of users, implement pagination, use distributed systems for scale.',
        },
        {
          question: 'Optimize an algorithm with O(n²) complexity to O(n log n) or better.',
          expectedAnswer: 'Identify bottleneck, use better data structures (hash maps, heaps), apply divide-and-conquer, use sorting to enable better approach, eliminate nested loops, use two-pointer technique, apply dynamic programming or greedy algorithms where applicable.',
        },
        {
          question: 'Explain how you would implement a distributed cache system.',
          expectedAnswer: 'Use consistent hashing for key distribution, implement replication for fault tolerance, use cache eviction policies (LRU, LFU), handle cache invalidation, implement distributed locking, use gossip protocol for coordination, monitor cache hit rates, implement sharding.',
        },
        {
          question: 'Design an algorithm to find the top K frequent elements in a stream of data.',
          expectedAnswer: 'Use hash map to count frequencies, maintain min heap of size K, when new element arrives, update count, compare with heap top, replace if larger. Time: O(n log k), Space: O(n). Alternative: Bucket sort if range known.',
        },
        {
          question: 'How would you implement a thread-safe data structure? Discuss concurrency challenges.',
          expectedAnswer: 'Use locks (mutex, semaphore), atomic operations, lock-free data structures, read-write locks for better concurrency. Challenges: deadlocks, race conditions, performance overhead. Consider: lock granularity, minimize critical sections, use concurrent data structures, implement proper synchronization.',
        },
      ],
    },
  };

  return questionSets[techStack]?.[level] || questionSets.React.Fresher;
};

/**
 * Mock evaluation for fallback
 */
const getMockEvaluation = (userAnswer, expectedAnswer) => {
  // Simple scoring based on answer length and keyword matching
  const answerLength = userAnswer.trim().length;
  const expectedKeywords = expectedAnswer.toLowerCase().split(/\s+/);
  const userKeywords = userAnswer.toLowerCase().split(/\s+/);
  
  let matchedKeywords = 0;
  expectedKeywords.forEach((keyword) => {
    if (userKeywords.includes(keyword) && keyword.length > 3) {
      matchedKeywords++;
    }
  });
  
  const keywordScore = (matchedKeywords / expectedKeywords.length) * 100;
  const lengthScore = Math.min((answerLength / 100) * 50, 50);
  const score = Math.round(Math.min(keywordScore + lengthScore, 100));
  
  const feedback = `Your answer ${answerLength > 50 ? 'provides good detail' : 'could be more detailed'}. ${
    score > 70
      ? 'Good understanding demonstrated.'
      : score > 50
      ? 'Some key points covered, but could be improved.'
      : 'Consider reviewing the fundamentals and providing more comprehensive answers.'
  }`;

  return { score, feedback };
};

module.exports = {
  generateQuestions,
  evaluateAnswer,
};
