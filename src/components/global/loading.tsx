import React, { useEffect, useRef } from 'react';

const StoreLoading = () => {
  const containerRef = useRef(null);
  const storeRef = useRef(null);
  const awningRef = useRef(null);
  const sphereRef = useRef(null);
  const cubesRef = useRef([]);
  const mascotRef = useRef(null);
  const iconsRef = useRef([]);
  const nftPanelRef = useRef(null);
  const dotsRef = useRef([]);
  const inventoryItemsRef = useRef([]);
  const conveyorRef = useRef(null);
  const scannerRef = useRef(null);
  const barcodeRef = useRef(null);
  const counterRef = useRef(null);
  const packagesRef = useRef([]);
  const inventoryPanelRef = useRef(null);
  const stockIndicatorsRef = useRef([]);
  const dataStreamRef = useRef([]);

  useEffect(() => {
    // Load GSAP from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    script.onload = () => {
      const { gsap } = window;
      
      // Create main timeline
      const tl = gsap.timeline();
      
      // Initial setup - hide all elements
      gsap.set([storeRef.current, awningRef.current, sphereRef.current, ...cubesRef.current, mascotRef.current, nftPanelRef.current, inventoryPanelRef.current], {
        opacity: 0,
        scale: 0,
        rotationY: 180
      });
      
      gsap.set([iconsRef.current, ...inventoryItemsRef.current, ...packagesRef.current, ...stockIndicatorsRef.current], {
        opacity: 0,
        x: -50
      });

      gsap.set([conveyorRef.current, scannerRef.current, barcodeRef.current], {
        opacity: 0,
        scale: 0
      });

      // Entrance animations
      tl.to(containerRef.current, {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
      })
      .to(storeRef.current, {
        opacity: 1,
        scale: 1,
        rotationY: -15,
        duration: 0.8,
        ease: "back.out(1.7)"
      }, 0.3)
      .to(inventoryPanelRef.current, {
        opacity: 1,
        scale: 1,
        rotationY: 0,
        duration: 0.7,
        ease: "power2.out"
      }, 0.5)
      .to(awningRef.current, {
        opacity: 1,
        scale: 1,
        rotationY: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)"
      }, 0.6)
      .to([conveyorRef.current, scannerRef.current], {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.5)"
      }, 0.8)
      .to([iconsRef.current, ...stockIndicatorsRef.current], {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.out"
      }, 0.9)
      .to(nftPanelRef.current, {
        opacity: 1,
        scale: 1,
        rotationY: 15,
        duration: 0.7,
        ease: "power2.out"
      }, 1.0)
      .to([sphereRef.current, ...cubesRef.current], {
        opacity: 1,
        scale: 1,
        rotationY: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "bounce.out"
      }, 1.1)
      .to([...inventoryItemsRef.current, ...packagesRef.current], {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.4,
        stagger: 0.1,
        ease: "power2.out"
      }, 1.2)
      .to(mascotRef.current, {
        opacity: 1,
        scale: 1,
        rotationY: 0,
        duration: 0.5,
        ease: "back.out(2)"
      }, 1.4);

      // Continuous animations
      
      // Floating store
      gsap.to(storeRef.current, {
        y: -3,
        duration: 2.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });

      // Conveyor belt movement
      gsap.to(conveyorRef.current, {
        backgroundPosition: "100px 0px",
        duration: 3,
        ease: "none",
        repeat: -1
      });

      // Scanner laser effect
      gsap.to(scannerRef.current, {
        opacity: 0.3,
        duration: 0.8,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1
      });

      // Barcode scanning animation
      gsap.to(barcodeRef.current, {
        scaleX: 1.1,
        duration: 1.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });

      // Inventory counter animation
      let currentCount = 0;
      gsap.to({}, {
        duration: 4,
        repeat: -1,
        ease: "none",
        onUpdate: function() {
          currentCount = Math.floor(Math.random() * 999) + 100;
          if (counterRef.current) {
            counterRef.current.textContent = currentCount;
          }
        }
      });

      // Rotating sphere (inventory item)
      gsap.to(sphereRef.current, {
        rotation: 360,
        duration: 4,
        ease: "none",
        repeat: -1
      });

      // Wobbling cubes (packages)
      cubesRef.current.forEach((cube, index) => {
        gsap.to(cube, {
          rotation: index % 2 === 0 ? 15 : -15,
          y: Math.sin(index) * 2,
          duration: 1.5 + index * 0.3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1
        });
      });

      // Inventory items floating
      inventoryItemsRef.current.forEach((item, index) => {
        gsap.to(item, {
          y: -2 + Math.sin(index) * 1,
          rotation: Math.cos(index) * 5,
          duration: 2 + index * 0.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1
        });
      });

      // Packages sliding
      packagesRef.current.forEach((pkg, index) => {
        gsap.to(pkg, {
          x: 5,
          duration: 2.5 + index * 0.3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1
        });
      });

      // Stock indicators pulsing
      stockIndicatorsRef.current.forEach((indicator, index) => {
        gsap.to(indicator, {
          scale: 1.2,
          opacity: 0.7,
          duration: 1.5 + index * 0.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1
        });
      });

      // Data stream animation
      dataStreamRef.current.forEach((stream, index) => {
        gsap.to(stream, {
          y: -20,
          opacity: 0,
          duration: 2,
          delay: index * 0.5,
          ease: "power2.out",
          repeat: -1,
          repeatDelay: 1
        });
      });

      // Pulsing icons
      iconsRef.current.forEach((icon, index) => {
        gsap.to(icon, {
          scale: 1.15,
          duration: 1.2 + index * 0.2,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1
        });
      });

      // Swaying awning
      gsap.to(awningRef.current, {
        rotation: 3,
        duration: 3.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });

      // Dancing mascot (warehouse worker)
      gsap.to(mascotRef.current, {
        rotation: -8,
        y: -3,
        duration: 0.9,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });

      // Inventory panel glow
      gsap.to(inventoryPanelRef.current, {
        boxShadow: "0 0 25px rgba(34, 197, 94, 0.4)",
        duration: 2.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });

      // NFT panel (now showing inventory data)
      gsap.to(nftPanelRef.current, {
        boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });

      // Loading dots
      gsap.to(dotsRef.current, {
        y: -10,
        duration: 0.7,
        ease: "power2.inOut",
        stagger: 0.15,
        yoyo: true,
        repeat: -1
      });
    };
    
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-green-50">
      <div ref={containerRef} className="relative opacity-0">
        {/* Base platform */}
        <div className="w-96 h-44 bg-white rounded-xl shadow-2xl transform perspective-1000 rotate-x-12 relative overflow-visible">
          
          {/* Conveyor belt */}
          <div 
            ref={conveyorRef}
            className="absolute bottom-2 left-8 right-8 h-3 bg-gray-800 rounded-sm shadow-inner"
            style={{
              background: 'repeating-linear-gradient(90deg, #374151 0px, #374151 8px, #4b5563 8px, #4b5563 16px)'
            }}
          ></div>

          {/* Main store building */}
          <div 
            ref={storeRef}
            className="absolute top-8 left-16 w-28 h-24 bg-blue-400 rounded-lg shadow-xl transform -rotate-y-15 overflow-visible"
          >
            {/* Store front */}
            <div className="w-full h-full bg-gradient-to-b from-blue-300 via-blue-400 to-blue-500 rounded-lg relative overflow-hidden border border-blue-300">
              {/* Store sign */}
              <div className="absolute top-2 left-2 right-2 h-7 bg-gradient-to-r from-green-400 to-green-500 rounded-md flex items-center justify-center shadow-md border border-green-300">
                <span className="text-white text-xs font-bold tracking-wider drop-shadow-sm">INVENTORY</span>
              </div>
              
              {/* Door */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-16 bg-gradient-to-b from-blue-600 to-blue-700 rounded-t-lg border-x border-t border-blue-500 shadow-inner"></div>
              
              {/* Windows with inventory displays */}
              <div className="absolute top-12 left-2 w-6 h-6 bg-gradient-to-br from-green-100 to-green-200 rounded-sm shadow-inner border border-green-300 flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-sm opacity-80"></div>
              </div>
              <div className="absolute top-12 right-2 w-6 h-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-sm shadow-inner border border-blue-300 flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-500 rounded-sm opacity-80"></div>
              </div>
              
              {/* Door handle */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 translate-x-2 w-1 h-1 bg-yellow-400 rounded-full shadow-sm"></div>
            </div>
            
            {/* Striped awning */}
            <div 
              ref={awningRef}
              className="absolute -top-6 -left-4 w-36 h-12 transform -skew-y-12 origin-bottom-left"
            >
              <div className="w-full h-full bg-gradient-to-b from-white to-blue-50 rounded-md shadow-lg relative overflow-hidden border border-blue-200">
                <div 
                  className="absolute inset-0 opacity-80" 
                  style={{
                    background: 'repeating-linear-gradient(90deg, #3b82f6 0px, #3b82f6 6px, #ffffff 6px, #ffffff 12px)',
                  }}
                ></div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 opacity-60"></div>
              </div>
            </div>
          </div>

          {/* Left sidebar with inventory controls */}
          <div className="absolute top-4 left-4 w-10 h-20 bg-gradient-to-b from-green-500 to-green-600 rounded-lg shadow-lg flex flex-col items-center justify-around py-2 border border-green-400">
            <div 
              ref={el => iconsRef.current[0] = el}
              className="w-7 h-7 bg-gradient-to-br from-white to-gray-100 rounded-md flex items-center justify-center shadow-md border border-gray-200"
            >
              <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-green-600 rounded-sm shadow-sm"></div>
            </div>
            <div 
              ref={el => iconsRef.current[1] = el}
              className="w-7 h-7 bg-gradient-to-br from-white to-gray-100 rounded-md flex items-center justify-center shadow-md border border-gray-200"
            >
              <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-sm"></div>
            </div>
            <div 
              ref={el => iconsRef.current[2] = el}
              className="w-7 h-7 bg-gradient-to-br from-white to-gray-100 rounded-md flex items-center justify-center shadow-md border border-gray-200"
            >
              <div className="text-xs font-bold text-green-600" ref={counterRef}>124</div>
            </div>
          </div>

          {/* Inventory management panel */}
          <div 
            ref={inventoryPanelRef}
            className="absolute top-6 right-8 w-24 h-28 bg-gradient-to-br from-green-700 to-green-800 rounded-lg shadow-xl transform rotate-y-15 border border-green-600"
          >
            <div className="w-full h-full bg-gradient-to-br from-green-600 to-green-800 rounded-lg relative overflow-hidden p-2">
              {/* Inventory header */}
              <div className="absolute top-1 left-1 right-1 h-4 bg-green-500 rounded text-center">
                <span className="text-white text-xs font-bold">STOCK</span>
              </div>
              
              {/* Stock indicators */}
              <div className="absolute top-6 left-2 space-y-1">
                <div ref={el => stockIndicatorsRef.current[0] = el} className="w-3 h-1 bg-green-400 rounded-full"></div>
                <div ref={el => stockIndicatorsRef.current[1] = el} className="w-4 h-1 bg-yellow-400 rounded-full"></div>
                <div ref={el => stockIndicatorsRef.current[2] = el} className="w-2 h-1 bg-red-400 rounded-full"></div>
              </div>
              
              {/* Data stream */}
              <div className="absolute top-6 right-2 space-y-1">
                <div ref={el => dataStreamRef.current[0] = el} className="w-1 h-1 bg-green-300 rounded-full opacity-60"></div>
                <div ref={el => dataStreamRef.current[1] = el} className="w-1 h-1 bg-green-300 rounded-full opacity-60"></div>
                <div ref={el => dataStreamRef.current[2] = el} className="w-1 h-1 bg-green-300 rounded-full opacity-60"></div>
              </div>

              {/* Barcode scanner */}
              <div 
                ref={barcodeRef}
                className="absolute bottom-6 left-2 right-2 h-4 bg-gray-800 rounded-sm border border-gray-700"
              >
                <div className="w-full h-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-sm relative overflow-hidden">
                  <div 
                    className="absolute inset-0 opacity-80"
                    style={{
                      background: 'repeating-linear-gradient(90deg, #000000 0px, #000000 1px, #ffffff 1px, #ffffff 2px)'
                    }}
                  ></div>
                </div>
              </div>

              {/* Scanner laser */}
              <div 
                ref={scannerRef}
                className="absolute bottom-4 left-0 right-0 h-px bg-red-500 shadow-lg"
                style={{
                  boxShadow: '0 0 10px #ef4444'
                }}
              ></div>
            </div>
          </div>

          {/* Inventory items */}
          <div className="absolute top-6 left-28 space-x-2 flex">
            <div 
              ref={el => inventoryItemsRef.current[0] = el}
              className="w-4 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-sm shadow-md border border-orange-300"
            ></div>
            <div 
              ref={el => inventoryItemsRef.current[1] = el}
              className="w-4 h-5 bg-gradient-to-b from-purple-400 to-purple-600 rounded-sm shadow-md border border-purple-300"
            ></div>
            <div 
              ref={el => inventoryItemsRef.current[2] = el}
              className="w-4 h-7 bg-gradient-to-b from-red-400 to-red-600 rounded-sm shadow-md border border-red-300"
            ></div>
          </div>

          {/* Right side packages */}
          <div className="absolute top-4 right-20 space-y-3">
            {/* Green sphere (inventory item) */}
            <div 
              ref={sphereRef}
              className="w-10 h-10 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-full shadow-lg border border-green-300 relative"
            >
              <div className="absolute top-1 left-2 w-2 h-2 bg-white rounded-full opacity-60"></div>
              <div className="absolute bottom-2 right-2 w-1 h-1 bg-green-200 rounded-full opacity-80"></div>
            </div>
            
            {/* Package boxes */}
            <div 
              ref={el => cubesRef.current[0] = el}
              className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg transform rotate-12 relative border border-amber-300 rounded-sm"
            >
              <div className="absolute inset-1 bg-gradient-to-br from-amber-300 to-amber-400 opacity-60 rounded-sm"></div>
              <div className="absolute top-1 left-1 w-2 h-2 bg-amber-200 opacity-80 rounded-sm"></div>
              <div className="absolute bottom-1 right-1 text-xs text-amber-800 font-bold">📦</div>
            </div>
            
            <div 
              ref={el => cubesRef.current[1] = el}
              className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 shadow-md transform -rotate-12 relative border border-teal-400 rounded-sm"
            >
              <div className="absolute inset-1 bg-gradient-to-br from-teal-400 to-teal-500 opacity-60 rounded-sm"></div>
              <div className="absolute top-0 right-0 w-1 h-1 bg-teal-200 opacity-80 rounded-full"></div>
              <div className="absolute bottom-1 left-1 text-xs text-teal-800">📋</div>
            </div>
          </div>

          {/* Small packages on conveyor */}
          <div className="absolute bottom-6 left-12 flex space-x-3">
            <div ref={el => packagesRef.current[0] = el} className="w-3 h-3 bg-gradient-to-br from-gray-400 to-gray-600 rounded-sm shadow-sm border border-gray-300"></div>
            <div ref={el => packagesRef.current[1] = el} className="w-3 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-sm shadow-sm border border-blue-300"></div>
            <div ref={el => packagesRef.current[2] = el} className="w-3 h-3 bg-gradient-to-br from-green-400 to-green-600 rounded-sm shadow-sm border border-green-300"></div>
          </div>

          {/* Warehouse worker/mascot */}
          <div 
            ref={mascotRef}
            className="absolute bottom-4 left-8 w-8 h-10 bg-gradient-to-b from-orange-600 via-orange-700 to-orange-800 rounded-t-full shadow-lg transform -rotate-12 border border-orange-500"
          >
            <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full shadow-sm"></div>
            <div className="absolute top-2 right-2 w-1 h-1 bg-white rounded-full shadow-sm"></div>
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-orange-900 rounded-full opacity-60"></div>
            {/* Hard hat */}
            <div className="absolute -top-1 left-0 right-0 h-2 bg-yellow-400 rounded-t-full border border-yellow-300 shadow-sm"></div>
          </div>

          {/* Background NFT panel (now inventory dashboard) */}
          <div 
            ref={nftPanelRef}
            className="absolute top-6 right-2 w-16 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg shadow-xl transform rotate-y-25 border border-gray-600 opacity-80"
          >
            <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg relative overflow-hidden p-1">
              <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-sm opacity-60 shadow-inner"></div>
              <div className="absolute top-2 left-2 w-2 h-2 bg-green-400 rounded-full opacity-80 shadow-sm"></div>
              <div className="absolute bottom-2 right-2 w-2 h-1 bg-red-400 rounded-sm opacity-70 shadow-sm"></div>
              <div className="absolute top-6 right-2 w-1 h-1 bg-yellow-400 rounded-full opacity-60 shadow-sm"></div>
            </div>
          </div>
        </div>

        {/* Loading animation */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-2">
            <div ref={el => dotsRef.current[0] = el} className="w-3 h-3 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-md"></div>
            <div ref={el => dotsRef.current[1] = el} className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-md"></div>
            <div ref={el => dotsRef.current[2] = el} className="w-3 h-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-md"></div>
          </div>
          <p className="text-gray-600 text-sm mt-3 text-center font-medium tracking-wide">Cargando inventario...</p>
          <div className="text-center mt-1">
            <span className="text-xs text-gray-500">Sincronizando stock...</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-x-12 {
          transform: rotateX(12deg);
        }
        .rotate-y-15 {
          transform: rotateY(15deg);
        }
        .rotate-y-25 {
          transform: rotateY(25deg);
        }
        .-rotate-y-15 {
          transform: rotateY(-15deg);
        }
        .w-28 { width: 7rem; }
        .h-24 { height: 6rem; }
        .w-24 { width: 6rem; }
        .h-28 { height: 7rem; }
        .h-20 { height: 5rem; }
        .w-96 { width: 24rem; }
        .h-44 { height: 11rem; }
      `}</style>
    </div>
  );
};

export default StoreLoading;