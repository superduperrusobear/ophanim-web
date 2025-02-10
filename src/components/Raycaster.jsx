import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function Raycaster() {
  const { scene, camera, size } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const cursor = useRef(new THREE.Vector2())
  const cursorDown = useRef(new THREE.Vector2())
  const touchedPoints = useRef([])
  
  // Add refs for cursor boundaries
  const cursorBounds = useRef({
    xMin: 0,
    xMax: 0,
    yMin: 0,
    yMax: 0
  })

  useEffect(() => {
    // Create hitboxes for interactive elements
    const hitBoxMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff0000, 
      wireframe: true,
      visible: false 
    })

    // Create groups for different types of hitboxes
    const hitBoxes = new THREE.Group()
    scene.add(hitBoxes)

    // Handle pointer events
    const handlePointerDown = (event) => {
      touchedPoints.current.push(event.pointerId)

      // Store cursor boundaries in the ref
      cursorBounds.current = {
        xMin: Math.abs((event.clientX / size.width * 2 - 1) * 0.9),
        xMax: Math.abs((event.clientX / size.width * 2 - 1) * 1.1),
        yMin: Math.abs((event.clientY / size.height * 2 - 1) * 0.9),
        yMax: Math.abs((event.clientY / size.height * 2 - 1) * 1.1)
      }

      cursorDown.current.set(
        event.clientX / size.width * 2 - 1,
        -(event.clientY / size.height) * 2 + 1
      )
    }

    const handlePointerUp = (event) => {
      cursor.current.x = event.clientX / size.width * 2 - 1
      cursor.current.y = -(event.clientY / size.height) * 2 + 1

      const absX = Math.abs(cursor.current.x)
      const absY = Math.abs(cursor.current.y)

      if (touchedPoints.current.length === 1 &&
          absX > cursorBounds.current.xMin && absX < cursorBounds.current.xMax &&
          absY > cursorBounds.current.yMin && absY < cursorBounds.current.yMax) {
        
        // Update raycaster
        raycaster.current.setFromCamera(cursor.current, camera)

        // Get intersected objects
        const intersects = raycaster.current.intersectObjects(scene.children, true)
        
        if (intersects.length > 0) {
          const selectedObject = intersects[0].object
          
          // Handle object selection
          if (selectedObject.userData.clickable) {
            selectedObject.userData.onClick?.()
          }
        }
      }

      touchedPoints.current = []
    }

    // Add event listeners
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
      scene.remove(hitBoxes)
    }
  }, [scene, camera, size])

  return null
} 