import React from 'react';
import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BackgroundShaderMaterial = shaderMaterial(
  {
    time: 0,
    resolution: new THREE.Vector2()
  },
  // Vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    precision highp float;
    uniform float time;
    uniform vec2 resolution;
    varying vec2 vUv;

    float rnd(vec2 p) {
      p=fract(p*vec2(12.9898,78.233));
      p+=dot(p,p+34.56);
      return fract(p.x*p.y);
    }

    float noise(in vec2 p) {
      vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
      float
      a=rnd(i),
      b=rnd(i+vec2(1,0)),
      c=rnd(i+vec2(0,1)),
      d=rnd(i+1.);
      return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
    }

    float fbm(vec2 p) {
      float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
      for (int i=0; i<5; i++) {
        t+=a*noise(p);
        p*=2.*m;
        a*=.5;
      }
      return t;
    }

    float clouds(vec2 p) {
      float d=1., t=.0;
      for (float i=.0; i<3.; i++) {
        float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
        t=mix(t,d,a);
        d=a;
        p*=2./(i+1.);
      }
      return t;
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy-.5*resolution.xy)/min(resolution.x,resolution.y);
      vec2 st = uv*vec2(2,1);
      vec3 col = vec3(0);
      float bg = clouds(vec2(st.x+time*.5,-st.y));
      
      // Cream colored output (RGB: 245, 240, 230)
      vec3 cream = vec3(0.96, 0.94, 0.90);
      col = vec3(bg) * cream;
      
      gl_FragColor = vec4(col * 0.85, 0.6);
    }
  `
);

extend({ BackgroundShaderMaterial });

export function ShaderBackground() {
  const materialRef = React.useRef();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime * 0.5;
      materialRef.current.resolution.set(
        state.size.width * state.viewport.dpr,
        state.size.height * state.viewport.dpr
      );
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <backgroundShaderMaterial 
        ref={materialRef} 
        transparent={true}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
} 