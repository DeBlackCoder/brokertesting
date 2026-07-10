"use client";

import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle, Vec3 } from "ogl";

interface OrbProps {
  hue?: number;
  hoverIntensity?: number;
  rotateOnHover?: boolean;
  forceHoverState?: boolean;
  backgroundColor?: string;
}

const vert = `
  precision highp float;
  attribute vec2 position; attribute vec2 uv; varying vec2 vUv;
  void main(){ vUv=uv; gl_Position=vec4(position,0.0,1.0); }
`;

const frag = `
  precision highp float;
  uniform float iTime; uniform vec3 iResolution;
  uniform float hue,hover,rot,hoverIntensity;
  uniform vec3 backgroundColor; varying vec2 vUv;

  vec3 rgb2yiq(vec3 c){
    return vec3(dot(c,vec3(0.299,0.587,0.114)),dot(c,vec3(0.596,-0.274,-0.322)),dot(c,vec3(0.211,-0.523,0.312)));
  }
  vec3 yiq2rgb(vec3 c){
    return vec3(c.x+0.956*c.y+0.621*c.z, c.x-0.272*c.y-0.647*c.z, c.x-1.106*c.y+1.703*c.z);
  }
  vec3 adjustHue(vec3 col,float deg){
    float rad=deg*3.14159/180.0; vec3 yiq=rgb2yiq(col);
    float c=cos(rad),s=sin(rad); yiq.yz=vec2(yiq.y*c-yiq.z*s,yiq.y*s+yiq.z*c);
    return yiq2rgb(yiq);
  }
  vec3 hash33(vec3 p3){
    p3=fract(p3*vec3(0.1031,0.11369,0.13787)); p3+=dot(p3,p3.yxz+19.19);
    return -1.0+2.0*fract(vec3(p3.x+p3.y,p3.x+p3.z,p3.y+p3.z)*p3.zyx);
  }
  float snoise3(vec3 p){
    const float K1=0.333333,K2=0.166667;
    vec3 i=floor(p+(p.x+p.y+p.z)*K1), d0=p-(i-(i.x+i.y+i.z)*K2);
    vec3 e=step(vec3(0),d0-d0.yzx), i1=e*(1.0-e.zxy), i2=1.0-e.zxy*(1.0-e);
    vec3 d1=d0-(i1-K2),d2=d0-(i2-K1),d3=d0-0.5;
    vec4 h=max(0.6-vec4(dot(d0,d0),dot(d1,d1),dot(d2,d2),dot(d3,d3)),0.0);
    vec4 n=h*h*h*h*vec4(dot(d0,hash33(i)),dot(d1,hash33(i+i1)),dot(d2,hash33(i+i2)),dot(d3,hash33(i+1.0)));
    return dot(vec4(31.316),n);
  }
  vec4 extractAlpha(vec3 c){ float a=max(max(c.r,c.g),c.b); return vec4(c/(a+1e-5),a); }

  const vec3 c1=vec3(0.611765,0.262745,0.996078);
  const vec3 c2=vec3(0.298039,0.760784,0.913725);
  const vec3 c3=vec3(0.062745,0.078431,0.600000);
  const float IR=0.6, NS=0.65;
  float L1(float i,float a,float d){ return i/(1.0+d*a); }
  float L2(float i,float a,float d){ return i/(1.0+d*d*a); }

  vec4 draw(vec2 uv){
    vec3 a1=adjustHue(c1,hue),a2=adjustHue(c2,hue),a3=adjustHue(c3,hue);
    float ang=atan(uv.y,uv.x),len=length(uv),invLen=len>0.0?1.0/len:0.0;
    float bgLum=dot(backgroundColor,vec3(0.299,0.587,0.114));
    float n0=snoise3(vec3(uv*NS,iTime*0.5))*0.5+0.5;
    float r0=mix(mix(IR,1.0,0.4),mix(IR,1.0,0.6),n0);
    float d0=distance(uv,(r0*invLen)*uv);
    float v0=L1(1.0,10.0,d0)*smoothstep(r0*1.05,r0,len)*mix(smoothstep(r0*0.8,r0*0.95,len),1.0,bgLum*0.7);
    float cl=cos(ang+iTime*2.0)*0.5+0.5;
    float at=iTime*-1.0;
    float d2=distance(uv,vec2(cos(at),sin(at))*r0);
    float v1=L2(1.5,5.0,d2)*L1(1.0,50.0,d0);
    float v2=smoothstep(1.0,mix(IR,1.0,n0*0.5),len);
    float v3=smoothstep(IR,mix(IR,1.0,0.5),len);
    vec3 colBase=mix(a1,a2,cl);
    vec3 dark=clamp((mix(a3,colBase,v0)+v1)*v2*v3,0.0,1.0);
    vec3 light=clamp(mix(backgroundColor,(colBase+v1)*mix(1.0,v2*v3,mix(1.0,0.1,bgLum)),v0),0.0,1.0);
    return extractAlpha(mix(dark,light,bgLum));
  }
  void main(){
    vec2 center=iResolution.xy*0.5, sz=vec2(min(iResolution.x,iResolution.y));
    vec2 uv=(vUv*iResolution.xy-center)/sz.x*2.0;
    float s=sin(rot),c=cos(rot);
    uv=vec2(c*uv.x-s*uv.y,s*uv.x+c*uv.y);
    uv.x+=hover*hoverIntensity*0.1*sin(uv.y*10.0+iTime);
    uv.y+=hover*hoverIntensity*0.1*sin(uv.x*10.0+iTime);
    vec4 col=draw(uv);
    gl_FragColor=vec4(col.rgb*col.a,col.a);
  }
`;

// Pre-computed Vec3 for the background colour — reused every frame, not re-allocated
const bgVec3Cache = new Vec3();
function applyHex(v: Vec3, hex: string): Vec3 {
  v.x = parseInt(hex.slice(1, 3), 16) / 255;
  v.y = parseInt(hex.slice(3, 5), 16) / 255;
  v.z = parseInt(hex.slice(5, 7), 16) / 255;
  return v;
}

export default function Orb({
  hue = 0,
  hoverIntensity = 0.2,
  rotateOnHover = true,
  forceHoverState = false,
  backgroundColor = "#000000",
}: OrbProps) {
  const ctnDom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ctnDom.current;
    if (!container) return;

    // DPR capped at 1 — background shader, subpixel accuracy wasted here
    const renderer = new Renderer({ dpr: 1, alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);

    const bgVec = applyHex(bgVec3Cache, backgroundColor);

    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        iTime:           { value: 0 },
        iResolution:     { value: new Vec3(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height) },
        hue:             { value: hue },
        hover:           { value: 0 },
        rot:             { value: 0 },
        hoverIntensity:  { value: hoverIntensity },
        backgroundColor: { value: bgVec },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      if (!container.clientWidth || !container.clientHeight) return;
      renderer.setSize(container.clientWidth, container.clientHeight);
      // style the canvas to fill the container without DPR scaling mismatch
      gl.canvas.style.width  = container.clientWidth  + "px";
      gl.canvas.style.height = container.clientHeight + "px";
      program.uniforms.iResolution.value.set(
        gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height
      );
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    // Pause when scrolled off screen
    let isVisible = true;
    const io = new IntersectionObserver(([e]) => { isVisible = e.isIntersecting; }, { threshold: 0 });
    io.observe(container);

    let contextLost = false;
    const onContextLost = (e: Event) => { e.preventDefault(); contextLost = true; };
    gl.canvas.addEventListener("webglcontextlost", onContextLost, false);

    let targetHover = 0, lastTime = 0, currentRot = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      const uvX  = ((e.clientX - rect.left  - rect.width  / 2) / size) * 2;
      const uvY  = ((e.clientY - rect.top   - rect.height / 2) / size) * 2;
      targetHover = uvX * uvX + uvY * uvY < 0.64 ? 1 : 0;
    };
    const onMouseLeave = () => { targetHover = 0; };
    container.addEventListener("mousemove", onMouseMove,  { passive: true });
    container.addEventListener("mouseleave", onMouseLeave);

    let rafId: number;
    const update = (t: number) => {
      rafId = requestAnimationFrame(update);
      if (!isVisible || document.hidden || contextLost) return;

      const dt = (t - lastTime) * 0.001;
      lastTime = t;

      // Mutate uniforms in-place — no allocations per frame
      program.uniforms.iTime.value           = t * 0.001;
      program.uniforms.hue.value             = hue;
      program.uniforms.hoverIntensity.value  = hoverIntensity;
      applyHex(program.uniforms.backgroundColor.value as Vec3, backgroundColor);

      const eff = forceHoverState ? 1 : targetHover;
      program.uniforms.hover.value += (eff - program.uniforms.hover.value) * 0.1;

      if (rotateOnHover && eff > 0.5) currentRot += dt * 0.3;
      program.uniforms.rot.value = currentRot;

      renderer.render({ scene: mesh });
    };
    rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      gl.canvas.removeEventListener("webglcontextlost", onContextLost);
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  // The effect only runs once. Prop changes (hue, etc.) are read from the RAF
  // closure via direct ref — no need to re-init the whole WebGL context.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ctnDom} className="w-full h-full" aria-hidden="true" />;
}
