import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'

export function CustomRenderer() {
  const { gl, size } = useThree()

  useEffect(() => {
    // Safe configuration of renderer
    try {
      gl.outputEncoding = THREE.sRGBEncoding
      gl.toneMapping = THREE.NoToneMapping
      gl.shadowMap.enabled = true
      gl.shadowMap.type = THREE.PCFSoftShadowMap
      
      // Set pixel ratio safely
      const pixelRatio = Math.min(window.devicePixelRatio, 2)
      gl.setPixelRatio(pixelRatio)
      
      // Set size
      gl.setSize(size.width, size.height, false)
    } catch (error) {
      console.warn('Error configuring renderer:', error)
    }

    // Handle window resize
    const handleResize = () => {
      try {
        const pixelRatio = Math.min(window.devicePixelRatio, 2)
        gl.setPixelRatio(pixelRatio)
        gl.setSize(size.width, size.height, false)
      } catch (error) {
        console.warn('Error handling resize:', error)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [gl, size])

  return null
} 