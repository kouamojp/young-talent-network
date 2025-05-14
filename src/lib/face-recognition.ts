
/**
 * Mock implementation of facial recognition utilities
 * (Replacing actual deepface library which is too large to install in this environment)
 */

/**
 * Interface for verification result
 */
interface VerificationResult {
  verified: boolean;
  distance: number;
  threshold: number;
  model: string;
  similarity_metric: string;
}

/**
 * Interface for facial analysis result
 */
interface AnalysisResult {
  age: number;
  gender: {
    Woman: number;
    Man: number;
  };
  emotion: {
    angry: number;
    disgust: number;
    fear: number;
    happy: number;
    sad: number;
    surprise: number;
    neutral: number;
  };
  race: {
    asian: number;
    indian: number;
    black: number;
    white: number;
    middle_eastern: number;
    latino_hispanic: number;
  };
  dominant_gender: string;
  dominant_emotion: string;
  dominant_race: string;
}

/**
 * Interface for face search result
 */
interface FindResult {
  identity: string;
  distance: number;
  threshold: number;
  neighbors: string[];
}

/**
 * Verify if two face images belong to the same person
 * 
 * @param img1 - Path or base64 string of first image
 * @param img2 - Path or base64 string of second image
 * @returns Promise with verification result
 */
export async function verifyFace(img1: string, img2: string): Promise<VerificationResult> {
  console.log(`Mock verifying faces: ${img1.substring(0, 20)}... and ${img2.substring(0, 20)}...`);
  
  // Return mock data
  return {
    verified: Math.random() > 0.5, // Randomly return true or false
    distance: Math.random() * 0.5,
    threshold: 0.4,
    model: "VGG-Face",
    similarity_metric: "cosine"
  };
}

/**
 * Analyze facial attributes in an image (age, gender, emotion, race)
 * 
 * @param img - Path or base64 string of image
 * @returns Promise with analysis result
 */
export async function analyzeFace(img: string): Promise<AnalysisResult> {
  console.log(`Mock analyzing face: ${img.substring(0, 20)}...`);
  
  // Return mock data
  return {
    age: Math.floor(Math.random() * 50) + 18,
    gender: {
      Woman: Math.random(),
      Man: Math.random()
    },
    emotion: {
      angry: Math.random() * 0.1,
      disgust: Math.random() * 0.1,
      fear: Math.random() * 0.1,
      happy: Math.random() * 0.6,
      sad: Math.random() * 0.1,
      surprise: Math.random() * 0.1,
      neutral: Math.random() * 0.3
    },
    race: {
      asian: Math.random() * 0.2,
      indian: Math.random() * 0.2,
      black: Math.random() * 0.2,
      white: Math.random() * 0.2,
      middle_eastern: Math.random() * 0.2,
      latino_hispanic: Math.random() * 0.2
    },
    dominant_gender: Math.random() > 0.5 ? "Woman" : "Man",
    dominant_emotion: "happy",
    dominant_race: "white"
  };
}

/**
 * Find similar faces in a database
 * 
 * @param img - Path or base64 string of image to search for
 * @param dbPath - Path to the database directory
 * @returns Promise with search results
 */
export async function findFace(img: string, dbPath: string): Promise<FindResult[]> {
  console.log(`Mock finding face: ${img.substring(0, 20)}... in database ${dbPath}`);
  
  // Return mock data
  return [
    {
      identity: "person1.jpg",
      distance: Math.random() * 0.3,
      threshold: 0.4,
      neighbors: ["person2.jpg", "person3.jpg"]
    },
    {
      identity: "person4.jpg",
      distance: Math.random() * 0.4,
      threshold: 0.4,
      neighbors: ["person5.jpg", "person6.jpg"]
    }
  ];
}
