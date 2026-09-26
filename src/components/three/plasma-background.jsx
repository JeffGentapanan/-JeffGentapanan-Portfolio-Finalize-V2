import { useEffect, useRef } from 'react';
import { useTheme } from '@/components/theme-provider';
import { useMediaQuery } from '@/hooks/use-media-query';
const vertex = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() { vUv = aPosition * .5 + .5; gl_Position = vec4(aPosition, 0., 1.); }
`;
const fragment = `
precision mediump float;
varying vec2 vUv;
uniform float uTime;
uniform float uAspect;
uniform float uOpacity;
uniform float uLight;
void main() {
  vec2 p = (vUv - .5) * vec2(uAspect, 1.);
  float t = uTime * .18;
  float field = sin(p.x * 3.5 + t + sin(p.y * 4. - t));
  field += sin(p.y * 4.8 - t * .7 + cos(p.x * 3. + t));
  field += .5 * sin(length(p) * 8. - t);
  float bands = pow(.5 + .5 * sin(field * 2.2), 3.);
  // Quiet center protects the cube; fade at the edges avoids a hard canvas boundary.
  float centerMask = mix(.15, 1., smoothstep(.1, .6, length(vUv - .5)));
  float edgeMask = .75 + .25 * sin(vUv.y * 3.14159);
  float alpha = bands * centerMask * edgeMask * uOpacity;
  // Composite in the shader instead of relying on browser/GPU canvas alpha.
  vec3 base = vec3(uLight);
  vec3 plasma = vec3(1. - uLight);
  gl_FragColor = vec4(mix(base, plasma, alpha), 1.);
}
`;
/** Decorative only: low-resolution, capped at 30fps, never intercepts input. */
export default function PlasmaBackground({ opacity = .36 }) {
    const canvasRef = useRef(null);
    const { resolvedTheme } = useTheme();
    const themeTarget = useRef(resolvedTheme === 'light' ? 1 : 0);
    const redraw = useRef(null);
    useEffect(() => {
        themeTarget.current = resolvedTheme === 'light' ? 1 : 0;
        redraw.current?.();
    }, [resolvedTheme]);
    const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
        if (!gl)
            return; // Solid theme background is the graceful fallback.
        const compile = (type, source) => {
            const shader = gl.createShader(type);
            if (!shader)
                return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };
        const vs = compile(gl.VERTEX_SHADER, vertex), fs = compile(gl.FRAGMENT_SHADER, fragment);
        if (!vs || !fs) {
            if (vs)
                gl.deleteShader(vs);
            if (fs)
                gl.deleteShader(fs);
            return;
        }
        const program = gl.createProgram();
        if (!program) {
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            return;
        }
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            gl.deleteProgram(program);
            return;
        }
        const buffer = gl.createBuffer();
        if (!buffer) {
            gl.deleteProgram(program);
            return;
        }
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const position = gl.getAttribLocation(program, 'aPosition');
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        const time = gl.getUniformLocation(program, 'uTime');
        const aspect = gl.getUniformLocation(program, 'uAspect');
        const lightUniform = gl.getUniformLocation(program, 'uLight');
        const opacityUniform = gl.getUniformLocation(program, 'uOpacity');
        let light = themeTarget.current;
        let frame = 0, last = 0, visible = true, lost = false;
        const start = performance.now();
        const draw = (now) => {
            if (lost)
                return;
            light = reduced ? themeTarget.current : light + (themeTarget.current - light) * .2;
            gl.uniform1f(lightUniform, light);
            // Keep white text readable even at the brightest point of the plasma.
            gl.uniform1f(opacityUniform, Math.min(.4, Math.max(0, opacity)) * (.42 + light * .13));
            gl.uniform1f(time, reduced ? 0 : (now - start) / 1000);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        };
        redraw.current = () => draw(performance.now());
        const resize = () => {
            const bounds = canvas.getBoundingClientRect();
            // Half CSS resolution, independent of high-DPI screens.
            canvas.width = Math.max(1, Math.round(bounds.width * .5));
            canvas.height = Math.max(1, Math.round(bounds.height * .5));
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform1f(aspect, canvas.width / canvas.height);
            draw(performance.now());
        };
        const tick = (now) => {
            if (!visible || document.hidden || lost || reduced) {
                frame = 0;
                return;
            }
            if (now - last >= 1000 / 30) {
                draw(now);
                last = now;
            }
            frame = requestAnimationFrame(tick);
        };
        const resume = () => { if (!frame && visible && !document.hidden && !reduced && !lost)
            frame = requestAnimationFrame(tick); };
        const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; resume(); });
        const size = new ResizeObserver(resize);
        const onLost = () => { lost = true; cancelAnimationFrame(frame); };
        observer.observe(canvas);
        size.observe(canvas);
        resize();
        resume();
        document.addEventListener('visibilitychange', resume);
        canvas.addEventListener('webglcontextlost', onLost);
        return () => {
            redraw.current = null;
            cancelAnimationFrame(frame);
            observer.disconnect();
            size.disconnect();
            document.removeEventListener('visibilitychange', resume);
            canvas.removeEventListener('webglcontextlost', onLost);
            gl.deleteBuffer(buffer);
            gl.deleteProgram(program);
        };
    }, [reduced, opacity]);
    return <canvas ref={canvasRef} className="plasma-background" aria-hidden="true"/>;
}
