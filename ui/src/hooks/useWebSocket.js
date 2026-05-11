import { useEffect, useRef, useCallback } from 'react'

const WS_URL = import.meta.env.VITE_API_URL ? 
import.meta.env.VITE_API_URL.replace('https://', 'wss://').replace('http://', 'ws://') : 'ws://localhost:8000'
const RECONNECT_DELAY = 3000

export function useWebSocket(token, onMessage) {
  const wsRef        = useRef(null)
  const reconnectRef = useRef(null)
  const mountedRef   = useRef(true)
  const onMessageRef = useRef(onMessage)  


  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  const connect = useCallback(() => {
    if (!token || !mountedRef.current) return

    if (wsRef.current) {
      wsRef.current.close()
    }

    console.log('[WS] Connecting...')
    const ws = new WebSocket(`${WS_URL}?token=${token}`)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('[WS] Connected ✓')
      const ping = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }))
        } else {
          clearInterval(ping)
        }
      }, 30000)
      ws._pingInterval = ping
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('[WS] Message received:', data)
        if (data.type !== 'pong') {
          onMessageRef.current?.(data)
        }
      } catch(e) {
        console.error('[WS] Parse error:', e)
      }
    }

    ws.onclose = (event) => {
      console.log('[WS] Disconnected, code:', event.code)
      clearInterval(ws._pingInterval)
      if (event.code === 4001) {
        console.log('[WS] Auth failed — not reconnecting')
        return
      }
      if (mountedRef.current) {
        console.log(`[WS] Reconnecting in ${RECONNECT_DELAY}ms...`)
        reconnectRef.current = setTimeout(connect, RECONNECT_DELAY)
      }
    }

    ws.onerror = (err) => {
      console.error('[WS] Error:', err)
      ws.close()
    }

  }, [token]) 

  useEffect(() => {
    mountedRef.current = true
    connect()

    return () => {
      mountedRef.current = false
      clearTimeout(reconnectRef.current)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect])
}