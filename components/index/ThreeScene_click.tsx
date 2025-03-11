"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";

export default function ThreeScene() {
    const mountRef = useRef<HTMLDivElement>(null);
    const [sideBoxes, setSideBoxes] = useState<THREE.Mesh[]>([]);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (!mountRef.current) return;
        let boxes: THREE.Mesh[] = [];

        // 🛠 Crear escena, cámara y renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 5, 10);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.appendChild(renderer.domElement);

        // 🎯 Raycaster para detección de clicks
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // 💡 Luces
        const light = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(light);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        scene.add(directionalLight);

        // 🟦 Suelo
        const planeGeometry = new THREE.PlaneGeometry(20, 20);
        const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        scene.add(plane);

        // 📦 Contenedor central
        const containerGeometry = new THREE.BoxGeometry(1, 1, 1);
        const containerMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x0055ff,
            transparent: true,
            opacity: 0.8
        });

        const centerBox = new THREE.Mesh(containerGeometry, containerMaterial);
        centerBox.position.set(0, 0.5, 0);
        scene.add(centerBox);

        // Crear contenedores laterales (inicialmente ocultos)
        const sideBoxGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        const sideBoxMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xff5500,
            transparent: true,
            opacity: 0
        });

        for (let i = 0; i < 6; i++) {
            const box = new THREE.Mesh(sideBoxGeometry, sideBoxMaterial.clone());
            box.position.set(
                (i < 3 ? -2 : 2) + (Math.random() - 0.5),
                0.4,
                (i % 3 - 1) * 2
            );
            box.scale.set(0.01, 0.01, 0.01);
            scene.add(box);
            boxes.push(box);
        }

        setSideBoxes(boxes);

        // Manejar click en elementos
        const handleClick = (event: MouseEvent) => {
            if (isAnimating) return;

            // Calcular posición del mouse normalizada
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // Actualizar el raycaster
            raycaster.setFromCamera(mouse, camera);

            // Verificar intersección con el contenedor central
            const intersects = raycaster.intersectObject(centerBox);

            if (intersects.length > 0) {
                setIsAnimating(true);

                // Animar todos los contenedores laterales
                boxes.forEach((box, index) => {
                    const material = box.material as THREE.MeshStandardMaterial;
                    const currentScale = box.scale.x;
                    const targetScale = currentScale < 0.5 ? 1 : 0.01;
                    const targetOpacity = currentScale < 0.5 ? 0.8 : 0;

                    // Animar escala
                    const scaleAnimation = new THREE.Vector3(targetScale, targetScale, targetScale);
                    box.scale.lerp(scaleAnimation, 0.1);

                    // Animar opacidad
                    material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.1);

                    // Verificar si la animación ha terminado
                    if (Math.abs(box.scale.x - targetScale) < 0.01) {
                        setIsAnimating(false);
                    }
                });
            }
        };

        mountRef.current.addEventListener("click", handleClick);

        // 🌀 Animación
        const animate = () => {
            renderer.render(scene, camera);
            requestAnimationFrame(animate);

            // Rotación suave de los contenedores laterales
            boxes.forEach(box => {
                box.rotation.y += 0.01;
            });
        };
        animate();

        // Manejar redimensionamiento
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize);

        // ♻️ Cleanup
        return () => {
            window.removeEventListener("resize", handleResize);
            mountRef.current?.removeEventListener("click", handleClick);
            mountRef.current?.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} className="absolute top-0 left-0 w-full h-full" />;
}
