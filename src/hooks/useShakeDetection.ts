
import { useEffect, useRef, useState } from 'react';

interface ShakeDetectionOptions {
  threshold?: number;
  timeWindow?: number;
  onShake?: () => void;
}

export const useShakeDetection = ({ 
  threshold = 15, 
  timeWindow = 1000, 
  onShake 
}: ShakeDetectionOptions = {}) => {
  const [isShaking, setIsShaking] = useState(false);
  const lastShakeTime = useRef(0);
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      
      if (!acceleration) return;

      const { x = 0, y = 0, z = 0 } = acceleration;
      const now = Date.now();
      
      // Calculate the change in acceleration
      const deltaX = Math.abs(x - lastAcceleration.current.x);
      const deltaY = Math.abs(y - lastAcceleration.current.y);
      const deltaZ = Math.abs(z - lastAcceleration.current.z);
      
      // Check if the change exceeds the threshold
      const totalDelta = deltaX + deltaY + deltaZ;
      
      if (totalDelta > threshold && now - lastShakeTime.current > timeWindow) {
        setIsShaking(true);
        lastShakeTime.current = now;
        
        if (onShake) {
          onShake();
        }
        
        // Reset shake state after a short delay
        setTimeout(() => setIsShaking(false), 500);
      }
      
      // Update last acceleration values
      lastAcceleration.current = { x, y, z };
    };

    // Request permission for iOS devices
    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion);
          } else {
            console.log('Device motion permission denied');
          }
        } catch (error) {
          console.error('Error requesting device motion permission:', error);
        }
      } else {
        // For non-iOS devices, just add the event listener
        window.addEventListener('devicemotion', handleDeviceMotion);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [threshold, timeWindow, onShake]);

  return { isShaking };
};
