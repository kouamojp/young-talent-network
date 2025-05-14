
import * as deepface from 'deepface';

/**
 * Utility functions for facial recognition using DeepFace
 */

/**
 * Verify if two face images belong to the same person
 * 
 * @param img1 - Path or base64 string of first image
 * @param img2 - Path or base64 string of second image
 * @returns Promise with verification result
 */
export async function verifyFace(img1: string, img2: string) {
  try {
    const result = await deepface.verify({
      img1,
      img2,
    });
    return result;
  } catch (error) {
    console.error('Face verification error:', error);
    throw error;
  }
}

/**
 * Analyze facial attributes in an image (age, gender, emotion, race)
 * 
 * @param img - Path or base64 string of image
 * @returns Promise with analysis result
 */
export async function analyzeFace(img: string) {
  try {
    const result = await deepface.analyze({
      img,
      actions: ['age', 'gender', 'emotion', 'race']
    });
    return result;
  } catch (error) {
    console.error('Face analysis error:', error);
    throw error;
  }
}

/**
 * Find similar faces in a database
 * 
 * @param img - Path or base64 string of image to search for
 * @param dbPath - Path to the database directory
 * @returns Promise with search results
 */
export async function findFace(img: string, dbPath: string) {
  try {
    const result = await deepface.find({
      img,
      db_path: dbPath,
    });
    return result;
  } catch (error) {
    console.error('Face search error:', error);
    throw error;
  }
}
