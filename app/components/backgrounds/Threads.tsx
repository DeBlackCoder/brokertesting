"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Color } from "ogl";

interface ThreadsProps {
  color?: [number, number, number];
  amplitude?: number;
  distance?: number;
  enableMouseInteraction?: boolean;
  className?: string;
}

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;

#define PI 3.1415926538

const int u_line_count = 40;
const float u_line_width = 7.0;
const float u_line_blur = 10.0;

float Perlin2D(vec2 P) {
    vec2 Pi = floor(P);
    vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
    vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
    Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
    Pt += vec2(26.0, 161.0).xyxy;
    Pt *= Pt;
    Pt = Pt.xzxz * Pt.yyww;
    vec4 hash_x = fract(Pt * (1.0 / 951.135664));
    vec4 hash_y = fract(Pt * (1.0 / 642.949883));
    vec4 grad_x = hash_x - 0.49999;
    vec4 grad_y = hash_y - 0.49999;
    vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
        * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
    grad_results *= 1.4142135623730950;
    vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
               * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
    vec4 blend2 = vec4(blend, vec2(1.0 - blend));
    return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

float pixel(float count, vec2 resolution) {
    return (1.0 / max(resolution.x, resolution.y)) * count;
}

float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse,
             float time, float amplitude, float distance) {
    float split_offset   = (perc * 0.4);
    float split_point    = 0.1 + split_offset;
    float amplitude_normal   = smoothstep(split_point, 0.7, st.x);
    float amplitude_strength = 0.5;
    float finalAmplitude = amplitude_normal * amplitude_strength
                         * amplitude * (1.0 + (mouse.y - 0.5) * 0.2);
    float time_scaled = time / 10.0 + (mouse.x - 0.5) * 1.0;
    float blur  = smoothstep(split_point, split_point + 0.05, st.x) * perc;
    float xnoise = mix(
        Perlin2D(vec2(time_scaled, st.x + perc)       * 2.5),
        Perlin2D(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
        st.x * 0.3
    );
    float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude;
    float line_start = smoothstep(
        y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        y, st.y
    );
    float line_end = smoothstep(
        y,
        y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        st.y
    );
    return clamp(
        (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
        0.0, 1.0
    );
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    float line_strength = 1.0;
    for (int i = 0; i < u_line_count; i++) {
        float p = float(i) / float(u_line_count);
        line_strength *= (1.0 - lineFn(
            uv, u_line_width * pixel(1.0, iResolution.xy) * (1.0 - p),
            p, (PI * 1.0) * p, uMouse, iTime, uAmplitude, uDistance
        ));
    }
    float colorVal = 1.0 - line_strength;
    fragColor = vec4(uColor * colorVal, colorVal);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

export default function Threads({
  color = [1, 1, 1],
  amplitude = 1,
  distance = 0,
  enableMouseInteraction = false,
  className = "",
}: ThreadsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const propsRef = useRef({ color, amplitude, distance, enableMouseInteraction });
  propsRef.current = { color, amplitude, distance, enableMouseInteraction };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Respect prefers-reduced-motion: still render a single static frame so
    // the background isn't blank, but never start the animation loop.
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = reducedMotionQuery.matches;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ alpha: true });
    } catch (err) {
      // WebGL unavailable (old browser, headless env, disabled GPU, etc.)
      // Fail silently rather than crashing the parent tree.
      console.warn("Threads: WebGL renderer could not be created.", err);
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime:       { value: 0 },
        iResolution: { value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height) },
        uColor:      { value: new Color(...propsRef.current.color) },
        uAmplitude:  { value: propsRef.current.amplitude },
        uDistance:   { value: propsRef.current.distance },
        uMouse:      { value: new Float32Array([0.5, 0.5]) },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    const MAX_DIM = 1920;
    const resize = () => {
      const { clientWidth, clientHeight } = container;
      // Guard against a 0x0 container (e.g. mid-hydration, display:none
      // ancestor). Sizing the canvas to zero would divide-by-zero the
      // aspect ratio and hand the shader NaN uniforms.
      if (clientWidth === 0 || clientHeight === 0) return;

      const baseDpr = Math.min(window.devicePixelRatio || 1, 2);
      const longest = Math.max(clientWidth, clientHeight) * baseDpr;
      renderer.dpr = longest > MAX_DIM ? (baseDpr * MAX_DIM) / longest : baseDpr;
      renderer.setSize(clientWidth, clientHeight);
      program.uniforms.iResolution.value.r = gl.canvas.width;
      program.uniforms.iResolution.value.g = gl.canvas.height;
      program.uniforms.iResolution.value.b = gl.canvas.width / gl.canvas.height;
    };

    // A single ResizeObserver on the container covers window resizes,
    // layout-driven resizes, and flex/grid reflows alike — no need for a
    // parallel window "resize" listener that would just double the work.
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const currentMouse = [0.5, 0.5];
    let targetMouse    = [0.5, 0.5];

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetMouse = [
        (e.clientX - rect.left) / rect.width,
        1.0 - (e.clientY - rect.top) / rect.height,
      ];
    };
    const onMouseLeave = () => { targetMouse = [0.5, 0.5]; };
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);

    let isVisible = true;
    const io = new IntersectionObserver(([e]) => { isVisible = e.isIntersecting; }, { threshold: 0 });
    io.observe(container);

    // If the GPU context is lost (backgrounding, driver reset, too many
    // live WebGL contexts), stop rendering instead of spamming console
    // errors every frame from calls into a dead context.
    let contextLost = false;
    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
      cancelAnimationFrame(rafRef.current);
    };
    gl.canvas.addEventListener("webglcontextlost", onContextLost, false);

    const update = (t: number) => {
      rafRef.current = requestAnimationFrame(update);
      if (!isVisible || document.hidden || contextLost) return;

      const { color, amplitude, distance, enableMouseInteraction } = propsRef.current;
      program.uniforms.uColor.value.set(...color);
      program.uniforms.uAmplitude.value = amplitude;
      program.uniforms.uDistance.value  = distance;

      if (enableMouseInteraction) {
        const s = 0.05;
        currentMouse[0] += s * (targetMouse[0] - currentMouse[0]);
        currentMouse[1] += s * (targetMouse[1] - currentMouse[1]);
        program.uniforms.uMouse.value[0] = currentMouse[0];
        program.uniforms.uMouse.value[1] = currentMouse[1];
      } else {
        program.uniforms.uMouse.value[0] = 0.5;
        program.uniforms.uMouse.value[1] = 0.5;
      }
      program.uniforms.iTime.value = t * 0.001;
      renderer.render({ scene: mesh });
    };

    const onReducedMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches;
      if (reducedMotion) {
        cancelAnimationFrame(rafRef.current);
        renderer.render({ scene: mesh }); // leave one static frame on screen
      } else {
        rafRef.current = requestAnimationFrame(update);
      }
    };
    reducedMotionQuery.addEventListener("change", onReducedMotionChange);

    if (reducedMotion) {
      renderer.render({ scene: mesh });
    } else {
      rafRef.current = requestAnimationFrame(update);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
      reducedMotionQuery.removeEventListener("change", onReducedMotionChange);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      gl.canvas.removeEventListener("webglcontextlost", onContextLost);
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative ${className}`}
      aria-hidden="true"
    />
  );
}