/* Shared GLSL — 3D simplex noise (Ashima / Stefan Gustavson, MIT). */
const SNOISE = /* glsl */ `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

export const bloomVertexShader = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform vec2 uPointer;
varying vec3 vNormal;
varying vec3 vView;
varying float vDisp;
${SNOISE}
void main() {
  vec3 pos = position;
  float t = uTime * 0.32;
  float n1 = snoise(normal * 1.5 + t);
  float n2 = snoise(normal * 3.1 - t * 0.7);
  float petals = snoise(normal * 4.7 + vec3(0.0, t * 0.5, 0.0));
  float bloom = mix(0.14, 0.52, uScroll);
  float pulse = 0.5 + 0.5 * sin(uTime * 1.7 + n1 * 3.0);
  float disp = (n1 * 0.6 + n2 * 0.28 + petals * 0.34) * bloom;
  disp += pulse * 0.045;
  disp += dot(normalize(normal.xy + 0.0001), uPointer) * 0.06 * length(uPointer);
  pos += normal * disp;
  vDisp = disp;
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

export const bloomFragmentShader = /* glsl */ `
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorRim;
varying vec3 vNormal;
varying vec3 vView;
varying float vDisp;
void main() {
  float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.6);
  vec3 base = mix(uColorA, uColorB, smoothstep(-0.2, 0.5, vDisp));
  vec3 col = base * 0.62 + uColorRim * fres * 0.85;
  col += base * 0.08 * (0.5 + 0.5 * sin(uTime * 1.2));
  gl_FragColor = vec4(col, 1.0);
}
`;

export const particleVertexShader = /* glsl */ `
uniform float uTime;
uniform float uSize;
attribute float aScale;
attribute vec3 aColor;
varying vec3 vColor;
varying float vFade;
void main() {
  vColor = aColor;
  vec3 p = position;
  p.y += sin(uTime * 0.2 + position.x * 0.5) * 0.18;
  p.x += cos(uTime * 0.15 + position.y * 0.4) * 0.18;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = min(uSize * aScale * (60.0 / -mv.z), 14.0);
  gl_Position = projectionMatrix * mv;
  vFade = smoothstep(60.0, 10.0, -mv.z);
}
`;

export const particleFragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vFade;
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float a = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vColor, a * vFade * 0.5);
}
`;
