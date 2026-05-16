'use client'
import { useEffect, useRef, useCallback, useState } from 'react'

interface Landmark { x: number; y: number; z: number }
interface GestureResult { gesture: string; confidence: number; hand: 'left' | 'right' }

export function useGestureWS(url?: string) {
  const wsRef = useRef<WebSocket | null>(null)
  const [gesture, setGesture] = useState<GestureResult | null>(null)
  const [connected, setConnected] = useState(false)
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>()

  const connect = useCallback(() => {
    const endpoint = url ?? process.env.NEXT_PUBLIC_API_WS_URL ?? 'ws://localhost:8000/ws/gesture-stream'
    try {
      const ws = new WebSocket(endpoint)
      ws.onopen = () => setConnected(true)
      ws.onclose = () => {
        setConnected(false)
        reconnectRef.current = setTimeout(connect, 3000)
      }
      ws.onerror = () => ws.close()
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as GestureResult
          if (data.gesture) setGesture(data)
        } catch {}
      }
      wsRef.current = ws
    } catch {}
  }, [url])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  const send = useCallback((landmarks: Landmark[], hand: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ landmarks, hand }))
    }
  }, [])

  return { gesture, connected, send }
}
