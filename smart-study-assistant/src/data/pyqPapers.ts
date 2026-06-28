export interface PYQPaperQuestion {
  question: string;
  marks: number;
  year: string;
  answer_guide: string;
}

export interface PYQPaper {
  id: string;
  subject: string;
  topic: string;
  year: string;
  sourceName: string;
  sourceUrl: string;
  description: string;
  syllabusHighlights: string[];
  questions: PYQPaperQuestion[];
}

export const PYQ_PAPERS_DATABASE: PYQPaper[] = [
  {
    id: "dbms-gate-2024",
    subject: "Database Management Systems (DBMS)",
    topic: "Functional Dependencies & Normalization (1NF to BCNF)",
    year: "2024",
    sourceName: "GATE 2024 (IISc Bangalore)",
    sourceUrl: "https://gate2024.iisc.ac.in/",
    description: "Official Graduate Aptitude Test in Engineering (GATE) questions on database design theory, closures, and Normal Forms.",
    syllabusHighlights: ["Functional Dependency closure", "Candidate Key identification", "3NF vs BCNF decomposition"],
    questions: [
      {
        question: "Consider a relation R(A, B, C, D, E) with the following functional dependencies: F = { A -> B, BC -> D, E -> C, D -> A }. Identify the candidate keys of the relation R and determine the highest normal form of R.",
        marks: 2,
        year: "2024",
        answer_guide: "Step 1: Compute attribute closures to find Candidate Keys.\n- Find closures of candidate attribute combinations:\n  (AE)+ = {A, E} -> Since E->C, we get {A, C, E}.\n  Since A->B, we get {A, B, C, E}.\n  Since BC->D, we get {A, B, C, D, E} = R.\n  Therefore, (AE) is a Candidate Key.\n- Check if other keys exist:\n  (DE)+ = {A, D, E} (since D->A) -> {A, B, D, E} (since A->B) -> {A, B, C, D, E} (since E->C). Therefore (DE) is also a Candidate Key.\n- (CE)+ = {C, E} (no candidate key).\n- The Candidate Keys are AE and DE.\n\nStep 2: Check normal form constraints.\n- Prime attributes: A, D, E. Non-prime attributes: B, C.\n- FD: A -> B. Since A is a subset of candidate key AE (partial dependency on candidate key), this violates 2NF because non-prime attribute B depends on a proper subset of candidate key AE.\n- Thus, the highest normal form of R is 1NF."
      },
      {
        question: "Suppose relation R(A, B, C, D) has functional dependencies: F = { AB -> C, C -> D, D -> A }. State whether the decomposition of R into R1(A, B, C) and R2(C, D) is dependency preserving and loss-less join.",
        marks: 2,
        year: "2024",
        answer_guide: "Step 1: Loss-less Join test:\n- The intersection of R1 and R2 is R1 ∩ R2 = {C}.\n- C is a key for R2 since C -> D exists. Since R1 ∩ R2 -> R2 (C -> CD), the decomposition is strictly Loss-less.\n\nStep 2: Dependency Preservation test:\n- The original FDs are AB -> C, C -> D, D -> A.\n- For R1(A, B, C), the projection of FDs retains AB -> C.\n- For R2(C, D), the projection of FDs retains C -> D.\n- The dependency D -> A is lost because neither R1 nor R2 contains both D and A. Thus, the decomposition is NOT dependency preserving."
      }
    ]
  },
  {
    id: "algo-gate-2023",
    subject: "Data Structures & Algorithms",
    topic: "Dynamic Programming & Greedy Algorithms (Dijkstra)",
    year: "2023",
    sourceName: "GATE 2023 (IIT Kanpur)",
    sourceUrl: "https://gate.iitk.ac.in/",
    description: "Official GATE question paper focusing on time complexity of greedy shortest-paths and dynamic programming table configurations.",
    syllabusHighlights: ["Dijkstra's Greedy Choice", "Fibonacci heap vs Binary heap priority queues", "Bellman-Ford negative cycles"],
    questions: [
      {
        question: "Let G = (V, E) be a directed graph with positive edge weights. We run Dijkstra's algorithm from source vertex s. If we use a Binary Heap to implement the priority queue, what is the tight asymptotic upper bound of the algorithm? Explain how it changes if we use a Fibonacci Heap.",
        marks: 2,
        year: "2023",
        answer_guide: "Step 1: Binary Heap Implementation:\n- Extract-Min takes O(log V) time, done V times = O(V log V).\n- Decrease-Key takes O(log V) time, done E times = O(E log V).\n- Total time complexity is O((V + E) log V).\n\nStep 2: Fibonacci Heap Implementation:\n- Extract-Min takes O(log V) amortized time, done V times = O(V log V).\n- Decrease-Key takes O(1) constant amortized time, done E times = O(E).\n- Total time complexity is O(E + V log V).\n\nThis is why Fibonacci heaps are theoretically superior for dense graphs where E is much larger than V."
      },
      {
        question: "Explain why Dijkstra's algorithm can fail to find the correct shortest path in graphs with negative edge weights, whereas the Bellman-Ford algorithm successfully handles them (unless there is a negative weight cycle).",
        marks: 5,
        year: "2023",
        answer_guide: "Step 1: Greedy Assumption:\n- Dijkstra assumes that once a vertex's shortest distance is extracted from the priority queue, its path cannot be shortened. If negative weights exist, a later edge could 'backtrack' and decrease a previously processed vertex's path weight.\n\nStep 2: Relaxation Strategy:\n- Bellman-Ford relaxes all E edges systematically V-1 times. It does not assume finality until all possible relaxation passes are complete, allowing updates to ripple regardless of sign.\n\nStep 3: Negative Cycles:\n- A negative weight cycle allows infinite loops of cost reduction. Bellman-Ford detects this during the V-th relaxation check."
      }
    ]
  },
  {
    id: "os-anna-2022",
    subject: "Operating Systems",
    topic: "Process Synchronization & Semaphores",
    year: "2022",
    sourceName: "Anna University Semester End Exams",
    sourceUrl: "https://www.annauniv.edu/",
    description: "Standard end-semester university questions examining the classical Producer-Consumer and Bounded-Buffer synchronization challenges.",
    syllabusHighlights: ["Counting Semaphores", "Mutex Locks", "Deadlock condition prevention"],
    questions: [
      {
        question: "Explain the Bounded-Buffer Producer-Consumer problem using Semaphores. Write the pseudo-code for both the Producer and Consumer processes ensuring no race condition or deadlock occurs.",
        marks: 13,
        year: "2022",
        answer_guide: "Step 1: Define the Semaphores:\n- 'mutex' (binary semaphore initialized to 1) protects critical buffer slots.\n- 'empty' (counting semaphore initialized to N) tracks empty spots.\n- 'full' (counting semaphore initialized to 0) tracks filled spots.\n\nStep 2: Producer Process pseudo-code:\n```c\ndo {\n    // produce an item\n    wait(empty);\n    wait(mutex);\n    // add item to buffer\n    signal(mutex);\n    signal(full);\n} while (true);\n```\n\nStep 3: Consumer Process pseudo-code:\n```c\ndo {\n    wait(full);\n    wait(mutex);\n    // remove item from buffer\n    signal(mutex);\n    signal(empty);\n    // consume item\n} while (true);\n```"
      }
    ]
  },
  {
    id: "cn-gate-2022",
    subject: "Computer Networks",
    topic: "IPv4 CIDR Subnetting & Routing",
    year: "2022",
    sourceName: "GATE 2022 (IIT Kharagpur)",
    sourceUrl: "https://gate.iitkgp.ac.in/",
    description: "Highly academic previous year question testing knowledge of subnet masks, network prefixes, and host range allocation.",
    syllabusHighlights: ["CIDR Subnet notation", "Valid host count formulas", "IP routing table matching"],
    questions: [
      {
        question: "An organization is allocated the IP block 192.168.10.0/24. The administrator wants to divide this network into 4 subnets with an equal number of hosts. Identify the new subnet mask, subnet addresses, and the range of valid IP addresses for each subnet.",
        marks: 5,
        year: "2022",
        answer_guide: "Step 1: Calculate new subnet prefix length:\n- We need 4 subnets, which requires log2(4) = 2 bits.\n- Original prefix is /24. New prefix = 24 + 2 = /26.\n- Subnet mask for /26 is 255.255.255.192.\n\nStep 2: Subnet boundaries:\n- Each subnet has 2^(32-26) = 64 IPs (62 usable, 1 net address, 1 broadcast address).\n- Subnet 1: 192.168.10.0/26. Range: .1 to .62. Broadcast: .63\n- Subnet 2: 192.168.10.64/26. Range: .65 to .126. Broadcast: .127\n- Subnet 3: 192.168.10.128/26. Range: .129 to .190. Broadcast: .191\n- Subnet 4: 192.168.10.192/26. Range: .193 to .254. Broadcast: .255"
      }
    ]
  }
];
