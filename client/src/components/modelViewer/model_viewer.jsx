import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";

const ModelViewer = ({ modelUrl }) => {
  const containerRef = useRef(null);
  
  // 1. เพิ่ม State เพื่อควบคุมการแสดงผล
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 2. ถ้ายังไม่กดดู (isVisible = false) หรือไม่มี URL ให้หยุดทำงานทันที
    if (!modelUrl || !isVisible) return;

    const container = containerRef.current;
    if (!container) return;

    /* ================= Scene ================= */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x999999);

    /* ================= Camera ================= */
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    /* ================= Renderer ================= */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);

    /* ================= Controls ================= */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    /* ================= Lights ================= */
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    /* ================= Environment ================= */
    const envMap = new THREE.CubeTextureLoader().load([
      "https://threejs.org/examples/textures/cube/Bridge2/posx.jpg",
      "https://threejs.org/examples/textures/cube/Bridge2/negx.jpg",
      "https://threejs.org/examples/textures/cube/Bridge2/posy.jpg",
      "https://threejs.org/examples/textures/cube/Bridge2/negy.jpg",
      "https://threejs.org/examples/textures/cube/Bridge2/posz.jpg",
      "https://threejs.org/examples/textures/cube/Bridge2/negz.jpg",
    ]);
    envMap.encoding = THREE.sRGBEncoding;
    scene.environment = envMap;

    /* ================= Utils ================= */
    const fitCameraToObject = (object) => {
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = camera.fov * (Math.PI / 180);
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

      cameraZ *= 1.5;

      camera.position.set(center.x, center.y, center.z + cameraZ);
      camera.near = cameraZ / 100;
      camera.far = cameraZ * 100;
      camera.updateProjectionMatrix();

      camera.lookAt(center);
      controls.target.copy(center);
      controls.update();
    };

    /* ================= Load Model ================= */
    const ext = modelUrl.split(".").pop().toLowerCase();

    const onModelLoaded = (model) => {
      model.traverse((child) => {
        if (child.isMesh) {
          child.material.side = THREE.DoubleSide;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(model);
      fitCameraToObject(model);
    };

    if (ext === "glb" || ext === "gltf") {
      const loader = new GLTFLoader();
      loader.load(modelUrl, (gltf) => onModelLoaded(gltf.scene));
    } else if (ext === "obj") {
      const loader = new OBJLoader();
      loader.load(modelUrl, (obj) => onModelLoaded(obj));
    } else {
      console.warn("Unsupported model format");
    }

    /* ================= Animate ================= */
    let isMounted = true;

    const animate = () => {
      if (!isMounted) return;
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    /* ================= Resize ================= */
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    /* ================= Cleanup ================= */
    return () => {
      isMounted = false;
      window.removeEventListener("resize", handleResize);

      controls.dispose();
      renderer.dispose();
      
      // ล้างค่า Environment Map ด้วยเพื่อคืน memory
      envMap.dispose(); 

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl, isVisible]); // เพิ่ม isVisible เป็น dependency

  // 3. ส่วนแสดงผล UI (Placeholder) ตอนยังไม่กดโหลด
  if (!isVisible) {
    return (
      <div
        onClick={() => setIsVisible(true)}
        style={{
          width: "100%",
          height: "400px",
          marginTop: "10px",
          borderRadius: "10px",
          background: "#e0e0e0", // สีพื้นหลังตอนยังไม่โหลด
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: "1px solid #ccc"
        }}
      >
        <div style={{ fontSize: "50px" }}>📦</div>
        <div style={{ marginTop: "10px", fontWeight: "bold", color: "#555" }}>
          Click to Load 3D Model
        </div>
      </div>
    );
  }

  // 4. ส่วนแสดงผล Viewer ของจริง (เมื่อกดแล้ว)
  return (
    <div style={{ position: "relative", marginTop: "10px" }}>
      {/* Container ของ Three.js */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "400px",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      />
      
      {/* ปุ่ม Close เพื่อปิดโมเดล (คืน Memory) */}
      <button
        onClick={() => setIsVisible(false)}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "rgba(0,0,0,0.6)",
          color: "white",
          border: "none",
          borderRadius: "5px",
          padding: "5px 10px",
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        Close
      </button>
    </div>
  );
};

export default ModelViewer;