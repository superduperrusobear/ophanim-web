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
      uv *= 1.-.3*(sin(time*.2)*.5+.5);
      
      // Base dark color for background
      vec3 baseColor = vec3(0.0, 0.0, 0.0);
      
      for (float i=1.; i<12.; i++) {
        uv += .1*cos(i*vec2(.1+.01*i, .8)+i*i+time*.5+.1*uv.x);
        vec2 p = uv;
        float d = length(p);
        
        // White ethereal glow color
        vec3 glowColor = vec3(1.0, 1.0, 1.0) * (cos(sin(i)*vec3(1,1,1))+1.);
        col += .00125/d*glowColor;
        
        float b = noise(i+p+bg*1.731);
        col += .002*b/length(max(p,vec2(b*p.x*.02,p.y)));
        
        // White cloud mix color
        vec3 mixColor = vec3(bg*0.8);
        col = mix(col, mixColor, d);
      }
      
      // Final color adjustment
      col = mix(col, baseColor, 0.1);
      col = pow(col, vec3(0.9)); // Soften contrast for more ethereal look
      
      gl_FragColor = vec4(col, 1.0);
    }
  `
);

extend({ BackgroundShaderMaterial });

export function ShaderBackground() {
  const materialRef = React.useRef();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.elapsedTime * 0.3; // Even slower animation
      materialRef.current.resolution.set(window.innerWidth, window.innerHeight);
    }
  });

  return (
    <mesh position={[0, 0, -100]} renderOrder={-1000}>
      <planeGeometry args={[200, 200]} />
      <backgroundShaderMaterial 
        ref={materialRef} 
        transparent={false}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
} 