import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ageFromBirthday, MIN_AGE, PARENTAL_CONSENT_AGE } from './age';

describe('ageFromBirthday', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-13T10:00:00'));
  });
  afterEach(() => vi.useRealTimers());

  it('returns null for empty or invalid input', () => {
    expect(ageFromBirthday('')).toBeNull();
    expect(ageFromBirthday('pas une date')).toBeNull();
  });

  it('counts full years only', () => {
    expect(ageFromBirthday('2013-11-13')).toBe(13); // birthday today
    expect(ageFromBirthday('2013-11-14')).toBe(12); // birthday tomorrow
    expect(ageFromBirthday('2013-11-12')).toBe(13);
  });

  it('handles a birthday later in the year', () => {
    expect(ageFromBirthday('2011-12-31')).toBe(14);
    expect(ageFromBirthday('2011-01-01')).toBe(15);
  });

  it('places the legal thresholds where the signup form expects them', () => {
    expect(MIN_AGE).toBe(13);
    expect(PARENTAL_CONSENT_AGE).toBe(15);
    const age = ageFromBirthday('2012-06-01')!; // 14 ans
    expect(age >= MIN_AGE && age < PARENTAL_CONSENT_AGE).toBe(true);
  });
});
