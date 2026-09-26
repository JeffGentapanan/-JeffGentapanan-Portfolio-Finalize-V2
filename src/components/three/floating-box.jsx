import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import * as THREE from 'three';
/** One theme-aware material; real lighting and beveled edges provide the face shading. */
export function FloatingBox({ view, dark, reduced, interaction }) {
    const group = useRef(null);
    const materials = useRef([]);
    const { camera } = useThree();
    const geometry = useMemo(() => new RoundedBoxGeometry(1.8, 1.8, 1.8, 4, .085), []);
    const target = useMemo(() => new THREE.Vector3(), []), color = useMemo(() => new THREE.Color(), []);
    useEffect(() => () => geometry.dispose(), [geometry]);
    const palette = Array(6).fill(dark ? '#ffffff' : '#080808');
    useFrame((state, delta) => {
        if (!group.current)
            return;
        const t = reduced ? 0 : state.clock.elapsedTime, ease = reduced ? 1 : 1 - Math.exp(-5 * Math.min(delta, .05)), p = interaction.current;
        target.set(0, Math.sin(t * .7) * .085, 0);
        group.current.position.lerp(target, ease);
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, .38 + p.dragY + (reduced ? 0 : p.y * .10 + Math.sin(t * .24) * .035), ease);
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, -.56 + p.dragX + (reduced ? 0 : p.x * .14 + Math.sin(t * .18) * .12) + (view === 'work' ? .10 : 0), ease);
        group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, view === 'studio' ? -.07 : .035, ease);
        materials.current.forEach((material, index) => { if (material) {
            color.set(palette[index]);
            material.color.lerp(color, ease);
        } });
        target.set(0, .12, 6.8);
        camera.position.lerp(target, ease);
        camera.lookAt(0, -.1, 0);
    });
    return <>
    <group ref={group} rotation={[.38, -.56, .035]}>
      <mesh castShadow receiveShadow geometry={geometry}>
        {palette.map((_, index) => <meshPhysicalMaterial key={index} ref={material => { materials.current[index] = material; }} attach={'material-' + index} roughness={.38} metalness={.08} clearcoat={.3} clearcoatRoughness={.3}/>)}
      </mesh>
    </group>
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.45, 0]}><planeGeometry args={[8, 8]}/><shadowMaterial transparent opacity={dark ? .55 : .32}/></mesh>
  </>;
}
