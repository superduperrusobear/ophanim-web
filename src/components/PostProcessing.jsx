import { extend, useThree, useFrame } from '@react-three/fiber'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'

// Extend so we can use these in JSX
extend({ EffectComposer, RenderPass, UnrealBloomPass, SMAAPass, ShaderPass })

// Custom shader material for the final pass
const FinalShaderMaterial = {
  uniforms: {
    baseTexture: { value: null },
    bloomTexture: { value: null }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D baseTexture;
    uniform sampler2D bloomTexture;
    varying vec2 vUv;
    void main() {
      vec4 base = texture2D(baseTexture, vUv);
      vec4 bloom = texture2D(bloomTexture, vUv);
      gl_FragColor = base + bloom;
    }
  `
}

// Create materials outside component to avoid recreation
const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' })
const materials = {}

export function PostProcessing() {
  const { gl, scene, camera, size } = useThree()
  const bloomLayer = useRef(new THREE.Layers())
  const BLOOM_SCENE = 1
  const bloomPassRef = useRef()
  
  // Create render targets and passes
  const [bloomComposer, finalComposer] = useMemo(() => {
    const renderTarget = new THREE.WebGLRenderTarget(800, 600, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      encoding: THREE.sRGBEncoding
    })

    // Bloom composer setup
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      1.3, // strength
      0.1, // radius
      0    // threshold
    )
    bloomPassRef.current = bloomPass

    const bloomComposer = new EffectComposer(gl)
    bloomComposer.renderToScreen = false
    bloomComposer.addPass(new RenderPass(scene, camera))
    bloomComposer.addPass(bloomPass)

    // Final composer setup
    const finalPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: bloomComposer.renderTarget2.texture }
        },
        vertexShader: FinalShaderMaterial.vertexShader,
        fragmentShader: FinalShaderMaterial.fragmentShader
      }),
      "baseTexture"
    )
    finalPass.needsSwap = true

    const finalComposer = new EffectComposer(gl, renderTarget)
    finalComposer.addPass(new RenderPass(scene, camera))
    finalComposer.addPass(finalPass)
    finalComposer.addPass(new SMAAPass())

    return [bloomComposer, finalComposer]
  }, [gl, scene, camera, size])

  // Handle resizing
  useEffect(() => {
    bloomComposer.setSize(size.width, size.height)
    finalComposer.setSize(size.width, size.height)
  }, [bloomComposer, finalComposer, size])

  // Set up bloom layers
  useEffect(() => {
    bloomLayer.current.set(BLOOM_SCENE)
    
    // Add bloom layer to glowing objects
    scene.traverse((obj) => {
      if (obj.isMesh && obj.material && 
         (obj.name.includes('ring') || obj.name.includes('eye'))) {
        obj.layers.enable(BLOOM_SCENE)
      }
    })
  }, [scene])

  // Add bloom controls
  useEffect(() => {
    const handleBloomStrength = (e) => {
      if (bloomPassRef.current) {
        bloomPassRef.current.strength = e.detail;
      }
    };

    const handleBloomRadius = (e) => {
      if (bloomPassRef.current) {
        bloomPassRef.current.radius = e.detail;
      }
    };

    const handleBloomThreshold = (e) => {
      if (bloomPassRef.current) {
        bloomPassRef.current.threshold = e.detail;
      }
    };

    window.addEventListener('updateBloomStrength', handleBloomStrength);
    window.addEventListener('updateBloomRadius', handleBloomRadius);
    window.addEventListener('updateBloomThreshold', handleBloomThreshold);

    return () => {
      window.removeEventListener('updateBloomStrength', handleBloomStrength);
      window.removeEventListener('updateBloomRadius', handleBloomRadius);
      window.removeEventListener('updateBloomThreshold', handleBloomThreshold);
    };
  }, []);

  const darkenNonBloomed = (obj) => {
    if (obj.isMesh && !bloomLayer.current.test(obj.layers)) {
      materials[obj.uuid] = obj.material
      obj.material = darkMaterial
    }
  }

  const restoreMaterial = (obj) => {
    if (materials[obj.uuid]) {
      obj.material = materials[obj.uuid]
      delete materials[obj.uuid]
    }
  }

  // Render loop
  useFrame(() => {
    // Render bloom
    scene.traverse(darkenNonBloomed)
    bloomComposer.render()
    scene.traverse(restoreMaterial)

    // Final render
    finalComposer.render()
  }, 1)

  return null
} 