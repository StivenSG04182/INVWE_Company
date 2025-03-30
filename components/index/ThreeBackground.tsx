// components/ThreeBackground.tsx
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";

const ThreeBackground: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 1. Crear la escena, cámara y renderer
        const mountNode = mountRef.current;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountNode?.appendChild(renderer.domElement);

        // 2. Crear un cubo
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // 3. Agregar iluminación
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        // 4. Posicionar la cámara
        camera.position.z = 3;

        // Variable para saber si la sección "features" está en vista
        let featuresActive = false;

        // 5. Listener para el custom event que indica si features está en vista
        const handleFeaturesInView = (event: CustomEvent) => {
            featuresActive = event.detail; // true o false
        };
        window.addEventListener("featuresInView", handleFeaturesInView as EventListener);

        // 6. Función de animación
        let reqId: number;
        const animate = () => {
            // Ejemplo: el cubo rota normalmente pero además cambia su posición Y
            // según si la sección "features" está visible
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;

            // Definir la posición objetivo en Y: baja cuando features está activa
            const targetY = featuresActive ? -1 : 0;
            cube.position.y = THREE.MathUtils.lerp(cube.position.y, targetY, 0.05);

            renderer.render(scene, camera);
            reqId = requestAnimationFrame(animate);
        };
        animate();

        // 7. Manejar redimensionamiento
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            renderer.setSize(width, height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };
        window.addEventListener("resize", handleResize);

        // 8. Cleanup
        return () => {
            cancelAnimationFrame(reqId);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("featuresInView", handleFeaturesInView as EventListener);
            mountNode?.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: -1, // Colocar el canvas detrás de la UI
            }}
        />
    );
};

export default ThreeBackground;
