import {
  ThumbsUp,
  ThumbsDown,
  DollarSign,
  Bookmark,
  Share2,
} from "lucide-react";

// Types for our review data
export interface ReviewMedia {
  type: "image" | "video";
  url: string;
}

export interface Review {
  id: string;
  userName: string;
  phoneNumber: string;
  branch: string;
  caption: string;
  rating: number;
  billAmount: number;
  likes: number;
  dislikes: number;
  saves: number;
  shares: number;
  date: Date;
  media: ReviewMedia[];
  type: "Dine-in" | "Delivery" | "Takeaway";
  // Store answers to questions for each review
  questionAnswers: Record<string, string | string[]>;
}

// Mock review questions data
// Update the ReviewQuestion interface to support multiple branches
export interface ReviewAnswer {
  answer: string;
  count: number;
  points?: number;
}

export interface ReviewQuestion {
  question: string;
  type: "Dine-in" | "Delivery" | "Takeaway" | string;
  topAnswer: string;
  count: number;
  multipleAnswers?: ReviewAnswer[];
  standardizedAnswers?: ReviewAnswer[]; // New field for exactly 5 standardized answers
  isRatingQuestion?: boolean; // Flag to identify rating questions
  allowMultipleAnswers?: boolean; // Flag for non-rating questions that allow multiple selections
  branch?: string | string[]; // Can be a single branch, multiple branches, or undefined (for all branches)
}

// Generate mock reviews with consistent question answers
export const allMockReviews = (() => {
  console.log("Generating mock reviews - this should only happen once");
  const branches = [
    "Gulberg",
    "DHA Phase 5",
    "Johar Town",
    "MM Alam Road",
    "Bahria Town",
  ];
  const names = [
    "Ahmed Khan",
    "Ayesha Malik",
    "Saad Ahmed",
    "Nadia Malik",
    "Imran Sheikh",
    "Kamran Ali",
    "Sara Ahmed",
    "Faisal Khan",
    "Zubair Hassan",
    "Zubair Hassan",
    "Asma Riaz",
    "Tariq Mahmood",
    "Bilal Ahmed",
    "Zain Malik",
    "Adnan Qureshi",
    "Yasir Ali",
  ];
  const captions = [
    "Absolutely amazing experience! The food was delicious and the service was impeccable.",
    "The staff was incredibly attentive and the food was outstanding. Will definitely return!",
    "Perfect spot for family dinners. Kids loved the special menu items.",
    "The atmosphere is unmatched. Perfect for business meetings and special occasions.",
    "The staff went above and beyond. Made our anniversary dinner truly special.",
    "Service was slow and the food was not up to the standard I expected.",
    "The food was cold and service was slow.",
    "The wait time was unacceptable and the food was mediocre at best.",
    "Overpriced for the quality. The ambiance doesn't make up for the average food.",
    "Not worth the drive. Food was bland and portions were small for the price.",
    "Celebrated my daughter's graduation. The special menu was worth every rupee!",
    "Corporate event for 20 people. Everyone was impressed with the service and food quality.",
    "Hosted a corporate dinner. Everyone loved the food and service. Worth every rupee!",
    "Family reunion dinner. The private dining room and custom menu were perfect.",
    "Anniversary celebration with extended family. The chef's special menu was exceptional.",
  ];
  const phoneNumbers = [
    "+92 300 1234567",
    "+92 321 9876543",
    "+92 333 4567890",
    "+92 345 6789012",
    "+92 301 2345678",
    "+92 312 8765432",
    "+92 334 5678901",
    "+92 346 7890123",
    "+92 302 3456789",
    "+92 313 9876543",
    "+92 335 6789012",
    "+92 347 8901234",
    "+92 303 4567890",
    "+92 314 0987654",
    "+92 336 7890123",
  ];

  // Define review types
  const reviewTypes = ["Dine-in", "Delivery", "Takeaway"] as const;

  // Generate dates within the last month
  const generateRandomDate = () => {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30); // Random day within the last month
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    return date;
  };

  // Get all questions to assign answers
  const allQuestions = getReviewQuestions("All branches");

  // Create reviews with consistent question answers
  return Array.from({ length: 50 }).map((_, index) => {
    const randomNameIndex = Math.floor(Math.random() * names.length);
    const randomBranchIndex = Math.floor(Math.random() * branches.length);
    const randomCaptionIndex = Math.floor(Math.random() * captions.length);
    // Assign a random type to each review
    const randomTypeIndex = Math.floor(Math.random() * reviewTypes.length);
    const reviewType = reviewTypes[randomTypeIndex];

    // Generate rating with one decimal place (1.0 to 5.0)
    const rating = Math.round((Math.random() * 4 + 1) * 10) / 10;

    const billAmount = Math.floor(Math.random() * 10000) + 1000; // 1000-11000 bill amount
    const likes = Math.floor(Math.random() * 200) + 1;
    const dislikes = Math.floor(Math.random() * 50);
    const saves = Math.floor(Math.random() * 100);
    const shares = Math.floor(Math.random() * 80);
    const date = generateRandomDate();

    // Random number of media items (0-5)
    const mediaCount = Math.floor(Math.random() * 6);
    const media = Array.from({ length: mediaCount }).map((_, mediaIndex) => {
      // 20% chance of being a video
      const isVideo = Math.random() < 0.2;
      return {
        type: isVideo ? ("video" as const) : ("image" as const),
        url: isVideo
          ? "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
          : `/placeholder.svg?height=400&width=600&text=Review+${index}+Media+${mediaIndex}`,
      };
    });

    // Generate question answers for this review
    const questionAnswers: Record<string, string | string[]> = {};

    // Filter questions for this review type
    const typeQuestions = allQuestions.filter((q) => q.type === reviewType);

    typeQuestions.forEach((question) => {
      // Get possible answers for this question
      const answers =
        question.standardizedAnswers ||
        (question.multipleAnswers
          ? question.multipleAnswers
          : [{ answer: question.topAnswer, count: question.count }]);

      if (question.isRatingQuestion) {
        // For rating questions, select one answer based on review ID
        const answerIndex = (index + answers.length) % answers.length;
        questionAnswers[question.question] = answers[answerIndex].answer;
      } else if (question.allowMultipleAnswers) {
        // For multiple-answer questions, select 1-3 answers
        const numAnswers = Math.floor(Math.random() * 3) + 1;
        const selectedAnswers: string[] = [];

        // Use a deterministic selection based on review ID
        for (let i = 0; i < numAnswers; i++) {
          const answerIndex = (index + i) % answers.length;
          selectedAnswers.push(answers[answerIndex].answer);
        }

        questionAnswers[question.question] = selectedAnswers;
      } else {
        // For single-answer non-rating questions, select one answer
        const answerIndex = index % answers.length;
        questionAnswers[question.question] = answers[answerIndex].answer;
      }
    });

    return {
      id: `review-${index}`,
      userName: names[randomNameIndex],
      phoneNumber: phoneNumbers[randomNameIndex],
      branch: branches[randomBranchIndex],
      caption: captions[randomCaptionIndex],
      rating,
      billAmount,
      likes,
      dislikes,
      saves,
      shares,
      date,
      media,
      type: reviewType,
      questionAnswers,
    };
  });
})(); // Immediately invoke to generate once

// Mock data for featured reviews with media
export const featuredReviews = [
  // Most Liked category - one for each branch
  {
    type: "Most Liked",
    icon: ThumbsUp,
    caption:
      "Absolutely amazing experience! The food was delicious and the service was impeccable.",
    userName: "Ahmed Khan",
    branch: "DHA Phase 5",
    totalBill: 4500,
    rating: 5.0,
    likes: 342,
    dislikes: 5,
    saves: 89,
    shares: 56,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
    ],
  },
  {
    type: "Most Liked",
    icon: ThumbsUp,
    caption:
      "The staff was incredibly attentive and the food was outstanding. Will definitely return!",
    userName: "Ayesha Malik",
    branch: "Johar Town",
    totalBill: 3800,
    rating: 4.9,
    likes: 315,
    dislikes: 4,
    saves: 76,
    shares: 48,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
    ],
  },
  {
    type: "Most Liked",
    icon: ThumbsUp,
    caption:
      "Perfect spot for family dinners. Kids loved the special menu items.",
    userName: "Saad Ahmed",
    branch: "MM Alam Road",
    totalBill: 4200,
    rating: 4.8,
    likes: 298,
    dislikes: 5,
    saves: 89,
    shares: 56,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
    ],
  },
  {
    type: "Most Liked",
    icon: ThumbsUp,
    caption:
      "The atmosphere is unmatched. Perfect for business meetings and special occasions.",
    userName: "Nadia Malik",
    branch: "Gulberg",
    totalBill: 3900,
    rating: 4.8,
    likes: 287,
    dislikes: 4,
    saves: 112,
    shares: 78,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
    ],
  },
  {
    type: "Most Liked",
    icon: ThumbsUp,
    caption:
      "The staff went above and beyond. Made our anniversary dinner truly special.",
    userName: "Imran Sheikh",
    branch: "Bahria Town",
    totalBill: 6500,
    rating: 4.9,
    likes: 267,
    dislikes: 3,
    saves: 134,
    shares: 92,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
    ],
  },

  // Most Disliked category - one for each branch
  {
    type: "Most Disliked",
    icon: ThumbsDown,
    caption:
      "Service was slow and the food was not up to the standard I expected.",
    userName: "Kamran Ali",
    branch: "DHA Phase 5",
    totalBill: 3200,
    rating: 2.5,
    likes: 15,
    dislikes: 142,
    saves: 8,
    shares: 27,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
    ],
  },
  {
    type: "Most Disliked",
    icon: ThumbsDown,
    caption:
      "Disappointing experience. The food was cold and service was slow.",
    userName: "Sara Ahmed",
    branch: "Johar Town",
    totalBill: 3200,
    rating: 2.0,
    likes: 12,
    dislikes: 156,
    saves: 5,
    shares: 23,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
    ],
  },
  {
    type: "Most Disliked",
    icon: ThumbsDown,
    caption:
      "The wait time was unacceptable and the food was mediocre at best.",
    userName: "Faisal Khan",
    branch: "MM Alam Road",
    totalBill: 2800,
    rating: 2.2,
    likes: 18,
    dislikes: 138,
    saves: 7,
    shares: 31,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
    ],
  },
  {
    type: "Most Disliked",
    icon: ThumbsDown,
    caption:
      "Overpriced for the quality. The ambiance doesn't make up for the average food.",
    userName: "Zubair Hassan",
    branch: "Gulberg",
    totalBill: 4100,
    rating: 2.3,
    likes: 21,
    dislikes: 129,
    saves: 9,
    shares: 25,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
    ],
  },
  {
    type: "Most Disliked",
    icon: ThumbsDown,
    caption:
      "Not worth the drive. Food was bland and portions were small for the price.",
    userName: "Asma Riaz",
    branch: "Bahria Town",
    totalBill: 3500,
    rating: 2.1,
    likes: 14,
    dislikes: 147,
    saves: 6,
    shares: 29,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
    ],
  },

  // Highest Bill category - one for each branch
  {
    type: "Highest Bill",
    icon: DollarSign,
    caption:
      "Celebrated my daughter's graduation. The special menu was worth every rupee!",
    userName: "Tariq Mahmood",
    branch: "DHA Phase 5",
    totalBill: 22000,
    rating: 4.7,
    likes: 198,
    dislikes: 7,
    saves: 56,
    shares: 42,
    media: [
      {
        type: "video" as const,
        url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      },
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
    ],
  },
  {
    type: "Highest Bill",
    icon: DollarSign,
    caption:
      "Corporate event for 20 people. Everyone was impressed with the service and food quality.",
    userName: "Bilal Ahmed",
    branch: "Johar Town",
    totalBill: 18500,
    rating: 4.6,
    likes: 187,
    dislikes: 9,
    saves: 48,
    shares: 37,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
    ],
  },
  {
    type: "Highest Bill",
    icon: DollarSign,
    caption:
      "Hosted a corporate dinner. Everyone loved the food and service. Worth every rupee!",
    userName: "Zain Malik",
    branch: "MM Alam Road",
    totalBill: 25000,
    rating: 4.8,
    likes: 210,
    dislikes: 8,
    saves: 45,
    shares: 32,
    media: [
      {
        type: "video" as const,
        url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      },
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
    ],
  },
  {
    type: "Highest Bill",
    icon: DollarSign,
    caption:
      "Family reunion dinner. The private dining room and custom menu were perfect.",
    userName: "Adnan Qureshi",
    branch: "Gulberg",
    totalBill: 19800,
    rating: 4.7,
    likes: 192,
    dislikes: 6,
    saves: 51,
    shares: 39,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
    ],
  },
  {
    type: "Highest Bill",
    icon: DollarSign,
    caption:
      "Anniversary celebration with extended family. The chef's special menu was exceptional.",
    userName: "Yasir Ali",
    branch: "Bahria Town",
    totalBill: 21500,
    rating: 4.8,
    likes: 205,
    dislikes: 5,
    saves: 53,
    shares: 41,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
      {
        type: "video" as const,
        url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      },
    ],
  },

  // Most Saved category - one for each branch
  {
    type: "Most Saved",
    icon: Bookmark,
    caption:
      "The new seasonal menu is a must-try! Every dish was a culinary delight.",
    userName: "Hasan Raza",
    branch: "DHA Phase 5",
    totalBill: 5200,
    rating: 4.8,
    likes: 245,
    dislikes: 6,
    saves: 278,
    shares: 67,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
    ],
  },
  {
    type: "Most Saved",
    icon: Bookmark,
    caption:
      "Their weekend brunch is the best in town. Definitely worth bookmarking!",
    userName: "Sana Khalid",
    branch: "Johar Town",
    totalBill: 4800,
    rating: 4.7,
    likes: 232,
    dislikes: 8,
    saves: 265,
    shares: 59,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
    ],
  },
  {
    type: "Most Saved",
    icon: Bookmark,
    caption:
      "The chef's tasting menu is an experience everyone should try at least once.",
    userName: "Omar Farooq",
    branch: "MM Alam Road",
    totalBill: 5500,
    rating: 4.9,
    likes: 256,
    dislikes: 4,
    saves: 289,
    shares: 72,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
      {
        type: "video" as const,
        url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      },
    ],
  },
  {
    type: "Most Saved",
    icon: Bookmark,
    caption:
      "Perfect place for family gatherings. The variety of dishes is impressive!",
    userName: "Fatima Riaz",
    branch: "Gulberg",
    totalBill: 6800,
    rating: 4.9,
    likes: 278,
    dislikes: 3,
    saves: 312,
    shares: 89,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
      {
        type: "video" as const,
        url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      },
    ],
  },
  {
    type: "Most Saved",
    icon: Bookmark,
    caption:
      "Their signature dishes are worth the trip. A culinary journey not to be missed!",
    userName: "Amir Sohail",
    branch: "Bahria Town",
    totalBill: 5900,
    rating: 4.8,
    likes: 261,
    dislikes: 5,
    saves: 295,
    shares: 78,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
    ],
  },

  // Most Shared category - one for each branch
  {
    type: "Most Shared",
    icon: Share2,
    caption:
      "The new menu items are a game-changer! Especially loved the fusion desserts.",
    userName: "Hassan Ali",
    branch: "DHA Phase 5",
    totalBill: 3800,
    rating: 4.7,
    likes: 189,
    dislikes: 7,
    saves: 102,
    shares: 245,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
      {
        type: "video" as const,
        url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      },
    ],
  },
  {
    type: "Most Shared",
    icon: Share2,
    caption:
      "The presentation of each dish is Instagram-worthy! Food tastes as good as it looks.",
    userName: "Amina Akram",
    branch: "Johar Town",
    totalBill: 3500,
    rating: 4.6,
    likes: 176,
    dislikes: 9,
    saves: 95,
    shares: 228,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
    ],
  },
  {
    type: "Most Shared",
    icon: Share2,
    caption:
      "Their themed dinner nights are a unique experience. Everyone needs to know about this!",
    userName: "Rizwan Khan",
    branch: "MM Alam Road",
    totalBill: 4100,
    rating: 4.8,
    likes: 195,
    dislikes: 6,
    saves: 108,
    shares: 237,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
    ],
  },
  {
    type: "Most Shared",
    icon: Share2,
    caption:
      "The live cooking station is a must-see! Chef's skills are impressive and entertaining.",
    userName: "Saira Jabeen",
    branch: "Gulberg",
    totalBill: 4300,
    rating: 4.7,
    likes: 183,
    dislikes: 8,
    saves: 99,
    shares: 231,
    media: [
      {
        type: "video" as const,
        url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      },
    ],
  },
  {
    type: "Most Shared",
    icon: Share2,
    caption:
      "The scenic view combined with excellent food makes this place a hidden gem worth sharing!",
    userName: "Naveed Ahmed",
    branch: "Bahria Town",
    totalBill: 4500,
    rating: 4.9,
    likes: 201,
    dislikes: 4,
    saves: 112,
    shares: 252,
    media: [
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
      { type: "image" as const, url: "/placeholder.svg?height=400&width=600" },
    ],
  },
];

// Function to get review questions based on branch
export function getReviewQuestions(branch: string): ReviewQuestion[] {
  // In a real app, this would fetch from an API based on the branch
  // For now, we'll create mock data with branch-specific questions

  // Common questions for all branches
  const dineInRatingQuestions: ReviewQuestion[] = [
    {
      question: "How was the food quality?",
      type: "Dine-in",
      topAnswer: "Excellent",
      count: 120,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Excellent", count: 35, points: 5 },
        { answer: "Very Good", count: 30, points: 4 },
        { answer: "Good", count: 25, points: 3 },
        { answer: "Average", count: 20, points: 2 },
        { answer: "Poor", count: 10, points: 1 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
    {
      question: "How was the service?",
      type: "Dine-in",
      topAnswer: "Very attentive",
      count: 95,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Very attentive", count: 30, points: 5 },
        { answer: "Friendly", count: 25, points: 4 },
        { answer: "Prompt", count: 20, points: 3 },
        { answer: "Slow", count: 15, points: 2 },
        { answer: "Inattentive", count: 5, points: 1 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
    {
      question: "Was the ambiance to your liking?",
      type: "Dine-in",
      topAnswer: "Perfect",
      count: 88,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Perfect", count: 28, points: 5 },
        { answer: "Very good", count: 22, points: 4 },
        { answer: "Comfortable", count: 18, points: 3 },
        { answer: "Too noisy", count: 12, points: 2 },
        { answer: "Not comfortable", count: 8, points: 1 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
    {
      question: "How was the cleanliness?",
      type: "Dine-in",
      topAnswer: "Spotless",
      count: 110,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Spotless", count: 35, points: 5 },
        { answer: "Very clean", count: 30, points: 4 },
        { answer: "Clean", count: 25, points: 3 },
        { answer: "Could be better", count: 15, points: 2 },
        { answer: "Not clean", count: 5, points: 1 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
    {
      question: "Would you recommend this restaurant to others?",
      type: "Dine-in",
      topAnswer: "Definitely",
      count: 130,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Definitely", count: 40, points: 5 },
        { answer: "Yes", count: 35, points: 4 },
        { answer: "Maybe", count: 25, points: 3 },
        { answer: "Probably not", count: 20, points: 2 },
        { answer: "No", count: 10, points: 1 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
  ];

  // Add non-rating questions for Dine-in with multiple answers
  const dineInNonRatingQuestions: ReviewQuestion[] = [
    {
      question: "What dishes did you try?",
      type: "Dine-in",
      topAnswer: "Biryani",
      count: 75,
      isRatingQuestion: false,
      allowMultipleAnswers: true,
      multipleAnswers: [
        { answer: "Biryani", count: 35 },
        { answer: "Karahi", count: 30 },
        { answer: "Kebabs", count: 25 },
        { answer: "Nihari", count: 20 },
        { answer: "Desserts", count: 15 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
    {
      question: "What was the occasion for your visit?",
      type: "Dine-in",
      topAnswer: "Family dinner",
      count: 85,
      isRatingQuestion: false,
      multipleAnswers: [
        { answer: "Family dinner", count: 30 },
        { answer: "Business meeting", count: 20 },
        { answer: "Celebration", count: 15 },
        { answer: "Casual meal", count: 12 },
        { answer: "Date night", count: 8 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
    {
      question: "Which features did you appreciate most?",
      type: "Dine-in",
      topAnswer: "Private dining area",
      count: 60,
      isRatingQuestion: false,
      allowMultipleAnswers: true,
      multipleAnswers: [
        { answer: "Private dining area", count: 25 },
        { answer: "Outdoor seating", count: 20 },
        { answer: "Live music", count: 15 },
        { answer: "Kids play area", count: 10 },
        { answer: "Parking facility", count: 8 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
  ];

  const deliveryRatingQuestions: ReviewQuestion[] = [
    {
      question: "How was the delivery time?",
      type: "Delivery",
      topAnswer: "On time",
      count: 85,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "On time", count: 30, points: 5 },
        { answer: "Earlier than expected", count: 20, points: 5 },
        { answer: "Slightly delayed", count: 15, points: 3 },
        { answer: "Delayed", count: 12, points: 2 },
        { answer: "Very late", count: 8, points: 1 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
    {
      question: "Was the food still hot when it arrived?",
      type: "Delivery",
      topAnswer: "Yes, very hot",
      count: 75,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Yes, very hot", count: 25, points: 5 },
        { answer: "Yes, warm enough", count: 20, points: 4 },
        { answer: "Lukewarm", count: 15, points: 3 },
        { answer: "Cold", count: 10, points: 2 },
        { answer: "Very cold", count: 5, points: 1 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
    {
      question: "How was the packaging?",
      type: "Delivery",
      topAnswer: "Excellent",
      count: 90,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Excellent", count: 30, points: 5 },
        { answer: "Good", count: 25, points: 4 },
        { answer: "Adequate", count: 15, points: 3 },
        { answer: "Leaking", count: 10, points: 2 },
        { answer: "Poor", count: 5, points: 1 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
    {
      question: "Was the order accurate?",
      type: "Delivery",
      topAnswer: "Completely accurate",
      count: 95,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Completely accurate", count: 35, points: 5 },
        { answer: "Mostly accurate", count: 25, points: 4 },
        { answer: "Some items missing", count: 15, points: 3 },
        { answer: "Wrong items", count: 10, points: 2 },
        { answer: "Completely wrong", count: 5, points: 1 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
    {
      question: "How was the delivery person's behavior?",
      type: "Delivery",
      topAnswer: "Very polite",
      count: 80,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Very polite", count: 30, points: 5 },
        { answer: "Polite", count: 25, points: 4 },
        { answer: "Professional", count: 15, points: 4 },
        { answer: "Rushed", count: 10, points: 2 },
        { answer: "Rude", count: 5, points: 1 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
  ];

  // Add non-rating questions for Delivery with multiple answers
  const deliveryNonRatingQuestions: ReviewQuestion[] = [
    {
      question: "Which delivery platform did you use?",
      type: "Delivery",
      topAnswer: "Restaurant's own app",
      count: 70,
      isRatingQuestion: false,
      multipleAnswers: [
        { answer: "Restaurant's own app", count: 25 },
        { answer: "Foodpanda", count: 20 },
        { answer: "Careem", count: 15 },
        { answer: "Bykea", count: 7 },
        { answer: "Phone call", count: 3 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
    {
      question: "What items did you order?",
      type: "Delivery",
      topAnswer: "Family meal deal",
      count: 60,
      isRatingQuestion: false,
      allowMultipleAnswers: true,
      multipleAnswers: [
        { answer: "Family meal deal", count: 22 },
        { answer: "Individual meals", count: 18 },
        { answer: "Appetizers", count: 15 },
        { answer: "Desserts", count: 12 },
        { answer: "Beverages", count: 10 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
    {
      question: "Did you use any promotional code?",
      type: "Delivery",
      topAnswer: "Yes, first-time user",
      count: 50,
      isRatingQuestion: false,
      multipleAnswers: [
        { answer: "Yes, first-time user", count: 15 },
        { answer: "Yes, special offer", count: 12 },
        { answer: "Yes, loyalty discount", count: 10 },
        { answer: "No, regular price", count: 8 },
        { answer: "No, but would have if available", count: 5 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
  ];

  const takeawayRatingQuestions: ReviewQuestion[] = [
    {
      question: "How was the pickup experience?",
      type: "Takeaway",
      topAnswer: "Quick and easy",
      count: 70,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Quick and easy", count: 25, points: 5 },
        { answer: "Smooth", count: 20, points: 4 },
        { answer: "Organized", count: 15, points: 4 },
        { answer: "Slightly confusing", count: 7, points: 2 },
        { answer: "Disorganized", count: 3, points: 1 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
    {
      question: "Was your order ready on time?",
      type: "Takeaway",
      topAnswer: "Yes, on time",
      count: 65,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Yes, on time", count: 22, points: 5 },
        { answer: "Ready early", count: 18, points: 5 },
        { answer: "Short wait", count: 15, points: 3 },
        { answer: "Long wait", count: 10, points: 2 },
        { answer: "Very delayed", count: 5, points: 1 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
    {
      question: "How was the food quality?",
      type: "Takeaway",
      topAnswer: "Excellent",
      count: 75,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Excellent", count: 25, points: 5 },
        { answer: "Very good", count: 20, points: 4 },
        { answer: "Good", count: 15, points: 3 },
        { answer: "Average", count: 10, points: 2 },
        { answer: "Poor", count: 5, points: 1 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
    {
      question: "Was the staff helpful?",
      type: "Takeaway",
      topAnswer: "Very helpful",
      count: 60,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Very helpful", count: 22, points: 5 },
        { answer: "Helpful", count: 18, points: 4 },
        { answer: "Neutral", count: 15, points: 3 },
        { answer: "Not very helpful", count: 10, points: 2 },
        { answer: "Unhelpful", count: 5, points: 1 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
    {
      question: "How was the packaging?",
      type: "Takeaway",
      topAnswer: "Secure and neat",
      count: 70,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Secure and neat", count: 25, points: 5 },
        { answer: "Good", count: 20, points: 4 },
        { answer: "Adequate", count: 15, points: 3 },
        { answer: "Messy", count: 10, points: 2 },
        { answer: "Poor", count: 5, points: 1 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
  ];

  // Add non-rating questions for Takeaway with multiple answers
  const takeawayNonRatingQuestions: ReviewQuestion[] = [
    {
      question: "How did you place your order?",
      type: "Takeaway",
      topAnswer: "In-person",
      count: 55,
      isRatingQuestion: false,
      multipleAnswers: [
        { answer: "In-person", count: 20 },
        { answer: "Phone call", count: 15 },
        { answer: "Website", count: 10 },
        { answer: "Mobile app", count: 7 },
        { answer: "Third-party app", count: 3 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
    {
      question: "What time of day did you visit?",
      type: "Takeaway",
      topAnswer: "Dinner time",
      count: 65,
      isRatingQuestion: false,
      multipleAnswers: [
        { answer: "Dinner time", count: 25 },
        { answer: "Lunch time", count: 20 },
        { answer: "Breakfast", count: 10 },
        { answer: "Late night", count: 7 },
        { answer: "Off-peak hours", count: 3 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
    {
      question: "What items did you purchase?",
      type: "Takeaway",
      topAnswer: "Main course",
      count: 70,
      isRatingQuestion: false,
      allowMultipleAnswers: true,
      multipleAnswers: [
        { answer: "Main course", count: 30 },
        { answer: "Appetizers", count: 20 },
        { answer: "Desserts", count: 15 },
        { answer: "Beverages", count: 10 },
        { answer: "Special menu items", count: 5 },
      ],
      branch: [
        "Gulberg",
        "DHA Phase 5",
        "Johar Town",
        "MM Alam Road",
        "Bahria Town",
      ], // Apply to all specific branches
    },
  ];

  // Branch-specific questions - for demonstration purposes
  const branchSpecificQuestions: ReviewQuestion[] = [
    // Gulberg branch specific questions
    {
      question: "How do you rate our new dessert menu?",
      type: "Dine-in",
      topAnswer: "Excellent",
      count: 45,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Excellent", count: 20, points: 5 },
        { answer: "Very Good", count: 15, points: 4 },
        { answer: "Good", count: 7, points: 3 },
        { answer: "Average", count: 2, points: 2 },
        { answer: "Poor", count: 1, points: 1 },
      ],
      branch: ["Gulberg"], // This question only applies to Gulberg branch
    },
    {
      question: "How was your experience with our live music?",
      type: "Dine-in",
      topAnswer: "Excellent",
      count: 40,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Excellent", count: 18, points: 5 },
        { answer: "Very Good", count: 12, points: 4 },
        { answer: "Good", count: 6, points: 3 },
        { answer: "Average", count: 3, points: 2 },
        { answer: "Poor", count: 1, points: 1 },
      ],
      branch: ["Gulberg"], // This question only applies to Gulberg branch
    },

    // DHA Phase 5 branch specific questions
    {
      question: "How was your rooftop dining experience?",
      type: "Dine-in",
      topAnswer: "Breathtaking",
      count: 55,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Breathtaking", count: 25, points: 5 },
        { answer: "Excellent", count: 15, points: 4 },
        { answer: "Good", count: 10, points: 3 },
        { answer: "Average", count: 3, points: 2 },
        { answer: "Poor", count: 2, points: 1 },
      ],
      branch: ["DHA Phase 5"], // This question only applies to DHA Phase 5 branch
    },
    {
      question: "How would you rate our special weekend brunch?",
      type: "Dine-in",
      topAnswer: "Excellent",
      count: 50,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Excellent", count: 22, points: 5 },
        { answer: "Very Good", count: 16, points: 4 },
        { answer: "Good", count: 8, points: 3 },
        { answer: "Average", count: 3, points: 2 },
        { answer: "Poor", count: 1, points: 1 },
      ],
      branch: ["DHA Phase 5"], // This question only applies to DHA Phase 5 branch
    },

    // MM Alam Road branch specific questions for delivery
    {
      question: "Rate our exclusive delivery packaging",
      type: "Delivery",
      topAnswer: "Excellent",
      count: 60,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Excellent", count: 25, points: 5 },
        { answer: "Very Good", count: 20, points: 4 },
        { answer: "Good", count: 10, points: 3 },
        { answer: "Average", count: 4, points: 2 },
        { answer: "Poor", count: 1, points: 1 },
      ],
      branch: ["MM Alam Road"], // This question only applies to MM Alam Road branch
    },

    // Johar Town branch specific questions for takeaway
    {
      question: "How was your experience with our new quick pickup service?",
      type: "Takeaway",
      topAnswer: "Very efficient",
      count: 65,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Very efficient", count: 30, points: 5 },
        { answer: "Good", count: 20, points: 4 },
        { answer: "Average", count: 10, points: 3 },
        { answer: "Slow", count: 4, points: 2 },
        { answer: "Poor", count: 1, points: 1 },
      ],
      branch: ["Johar Town"], // This question only applies to Johar Town branch
    },

    // Bahria Town branch specific questions
    {
      question: "How do you rate our family entertainment area?",
      type: "Dine-in",
      topAnswer: "Excellent",
      count: 70,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Excellent", count: 30, points: 5 },
        { answer: "Very Good", count: 25, points: 4 },
        { answer: "Good", count: 10, points: 3 },
        { answer: "Average", count: 4, points: 2 },
        { answer: "Poor", count: 1, points: 1 },
      ],
      branch: ["Bahria Town"], // This question only applies to Bahria Town branch
    },
    {
      question: "Rate our exclusive children's menu",
      type: "Dine-in",
      topAnswer: "Excellent",
      count: 60,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Excellent", count: 25, points: 5 },
        { answer: "Very Good", count: 20, points: 4 },
        { answer: "Good", count: 10, points: 3 },
        { answer: "Average", count: 4, points: 2 },
        { answer: "Poor", count: 1, points: 1 },
      ],
      branch: ["Bahria Town"], // This question only applies to Bahria Town branch
    },
  ];

  // Multi-branch questions (for demonstration) - now with explicit branch arrays
  const multiBranchQuestions: ReviewQuestion[] = [
    {
      question: "How was your experience with our weekend buffet?",
      type: "Dine-in",
      topAnswer: "Excellent",
      count: 85,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Excellent", count: 35, points: 5 },
        { answer: "Very Good", count: 25, points: 4 },
        { answer: "Good", count: 15, points: 3 },
        { answer: "Average", count: 7, points: 2 },
        { answer: "Poor", count: 3, points: 1 },
      ],
      branch: ["DHA Phase 5", "Gulberg", "MM Alam Road"], // This question applies to multiple specific branches
    },
    {
      question: "Rate our new mobile app ordering experience",
      type: "Delivery",
      topAnswer: "Very intuitive",
      count: 70,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Very intuitive", count: 30, points: 5 },
        { answer: "Easy to use", count: 20, points: 4 },
        { answer: "Acceptable", count: 12, points: 3 },
        { answer: "Confusing", count: 5, points: 2 },
        { answer: "Very difficult", count: 3, points: 1 },
      ],
      branch: ["Johar Town", "Bahria Town"], // This question applies to multiple specific branches
    },
    {
      question: "How would you rate our new eco-friendly packaging?",
      type: "Takeaway",
      topAnswer: "Excellent",
      count: 65,
      isRatingQuestion: true,
      standardizedAnswers: [
        { answer: "Excellent", count: 25, points: 5 },
        { answer: "Very Good", count: 20, points: 4 },
        { answer: "Good", count: 12, points: 3 },
        { answer: "Average", count: 5, points: 2 },
        { answer: "Poor", count: 3, points: 1 },
      ],
      branch: ["DHA Phase 5", "MM Alam Road", "Bahria Town"], // This question applies to multiple specific branches
    },
  ];

  // Combine all questions
  const allQuestions = [
    ...dineInRatingQuestions,
    ...dineInNonRatingQuestions,
    ...deliveryRatingQuestions,
    ...deliveryNonRatingQuestions,
    ...takeawayRatingQuestions,
    ...takeawayNonRatingQuestions,
    ...branchSpecificQuestions,
    ...multiBranchQuestions,
  ];

  // If "All branches" selected, return all questions
  if (branch === "All branches" || branch === "") {
    return allQuestions;
  }
  // Otherwise filter to show only questions that apply to the selected branch
  else {
    return allQuestions.filter((question) => {
      if (Array.isArray(question.branch)) {
        return question.branch.includes(branch);
      }
      return false; // Question with non-array branch should no longer exist in our data
    });
  }
}

// Mock function to calculate actual answer counts (replace with real implementation)
function calculateActualAnswerCounts(): Record<string, Record<string, number>> {
  const actualCounts: Record<string, Record<string, number>> = {};

  // Iterate through all mock reviews
  allMockReviews.forEach((review) => {
    // Iterate through each question and answer in the review
    Object.entries(review.questionAnswers).forEach(([question, answer]) => {
      if (!actualCounts[question]) {
        actualCounts[question] = {};
      }

      if (Array.isArray(answer)) {
        // If the answer is an array (multiple answers), iterate through each answer
        answer.forEach((singleAnswer) => {
          actualCounts[question][singleAnswer] =
            (actualCounts[question][singleAnswer] || 0) + 1;
        });
      } else {
        // If the answer is a single answer
        actualCounts[question][answer] =
          (actualCounts[question][answer] || 0) + 1;
      }
    });
  });

  return actualCounts;
}

// Modify the getReviewQuestionsWithActualCounts function to match the updated branch handling
export function getReviewQuestionsWithActualCounts(
  selectedBranch = "All branches"
): ReviewQuestion[] {
  const questions = getReviewQuestions(selectedBranch);
  const actualCounts = calculateActualAnswerCounts();

  // Update questions with actual counts
  return questions.map((question) => {
    const questionCounts = actualCounts[question.question] || {};

    // Update standardizedAnswers or multipleAnswers with actual counts
    if (question.standardizedAnswers) {
      question.standardizedAnswers = question.standardizedAnswers.map(
        (answer) => ({
          ...answer,
          count: questionCounts[answer.answer] || 0,
        })
      );

      // Recalculate total count
      question.count = question.standardizedAnswers.reduce(
        (sum, answer) => sum + answer.count,
        0
      );
    } else if (question.multipleAnswers) {
      question.multipleAnswers = question.multipleAnswers.map((answer) => ({
        ...answer,
        count: questionCounts[answer.answer] || 0,
      }));

      // For multiple-answer questions, count might be higher than total reviews
      question.count =
        Math.max(...question.multipleAnswers.map((a) => a.count)) * 2;
    }

    // Update topAnswer to be the one with highest count
    const answers = question.standardizedAnswers || question.multipleAnswers;
    if (answers && answers.length > 0) {
      const topAnswerObj = [...answers].sort((a, b) => b.count - a.count)[0];
      question.topAnswer = topAnswerObj.answer;
    }

    return question;
  });
}
