'use client'
import { useEffect, useRef, useCallback, useState } from 'react'

interface Landmark { x: number; y: number; z: number }
interface HandResult {
  multiHandLandmarks: Landmark[][]
  multiHandedness: { label: string; score: number }[]
}

interface UseMediaPipeOptions {
  onResults?: (results: HandResult) => void
  maxHands?: number
  minConfidence?: number
}

export function useMediaPipe({ onResults, maxHands = 2, minConfidence = 0.7 }: UseMediaPipeOptions = {}) {
  const handsRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const init = useCallback(async (videoEl: HTMLVideoElement) => {
    try {
      const [{ Hands }, { Camera }] = await Promise.all([
        import('@mediapipe/hands'),
        import('@mediapipe/camera_utils'),
      ])

      const hands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      })
      hands.setOptions({
        maxNumHands: maxHands,
        modelComplexity: 1,
        minDetectionConfidence: minConfidence,
        minTrackingConfidence: 0.6,
      })
      if (onResults) hands.onResults(onResults)

      const camera = new Camera(videoEl, {
        onFrame: async () => { await hands.send({ image: videoEl }) },
        width: 1280,
        height: 720,
      })
      camera.start()

      handsRef.current = hands
      cameraRef.current = camera
      setReady(true)
    } catch (err) {
      setError('Failed to load MediaPipe')
      console.error(err)
    }
  }, [onResults, maxHands, minConfidence])

  const stop = useCallback(() => {
    cameraRef.current?.stop()
    handsRef.current?.close()
    setReady(false)
  }, [])

  useEffect(() => () => { stop() }, [stop])

  return { init, stop, ready, error }
}
