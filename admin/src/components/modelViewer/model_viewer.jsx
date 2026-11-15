import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useInView } from 'react-intersection-observer';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import "./model_viewer.scss";

const ModelViewer = ({ modelUrl }) => {
  const containerRef = useRef(null); // เอาไว้ดูว่ามีปุ่มใน close จอไหม
  const [isVisible, setIsVisible] = useState(false); // เปิด / ปิดการแสดงผล 3D

  const { ref, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (!inView) {
      setIsVisible(false);
    }
  }, [inView]);

  useEffect(() => {
    // ไม่มีโมเดล / ไม่อย่ในจอ ให้ปิดไม่ทำงาน
    if (!modelUrl || !isVisible) return;

    const container = containerRef.current; // สถานะปุ่มปิดการแสดงผลว่ามีปุ่มอยู่ไหม
    if (!container) return; // ถ้าไม่มีปุ่ม (แสดงว่ายังไม่ได้กดดูโมเดล) ก็ไม่ต้องแสดงอะไร

    let isMounted = true; // เอาไว้เช็คตอนหลังว่าผู้ใช้ปิดโมเดลไปหรือยัง จะได้สั่งหยุด Loop อนิเมชัน

    // สร้างฉากแสดงผล 3D
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x999999); // สีพื้นหลังฉาก ฐาน 16

    const camera = new THREE.PerspectiveCamera( // PerspectiveCamera มุมมองคน ใกล้ใหญ่ ไกลเล็ก
      60, // องศาการมอง ความโค้งเลนส์
      container.clientWidth / container.clientHeight, // คำนวณขนาดกล่องที่ใช้แสดงผล
      0.1, // ระยะใกล้ที่สุดที่จะ render (0)
      1000 // ไกลสุดที่จะ render (0)
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // render GLB ลบรอยหยักและรับความโปรงใส
    renderer.setSize(container.clientWidth, container.clientHeight); // ตั้งขนาด render ให้เต็มกล่อง
    renderer.setPixelRatio(window.devicePixelRatio); // ทำให้ภาพคมชัดบนจอมือถือ/จอ Retina (0)
    renderer.outputColorSpace = THREE.SRGBColorSpace;// ตั้งค่าพื้นที่สีให้สมจริง (0)

    container.appendChild(renderer.domElement); // เอาตัวเรนเดอร์ภาพ (Canvas) ยัดเข้าไปใน div ของหน้าเว็บ

    // สร้างตัวควบคุมให้ใช้เมาส์ / นิ้ว หมุนกล้องได้ เปิด Damping ให้หมุนแล้วไหลต่อได้
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // จัดไฟ
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1); // 1 คือส่วง 100%
    dirLight.position.set(5, 10, 7); // x, y, z +- ตามแกน (z+ นูนออกจากจอ z- ลึกไปในจอ)
    scene.add(dirLight);

    // ปรับขนาดให้กล้องเห็นโมเดลเต็มตัวในฉาก
    const fitCameraToObject = (object) => {
      // คำนวณหา "กล่องล่องหน" ที่ครอบโมเดลนี้ไว้ (Bounding Box) เพื่อหาขนาดและจุดกึ่งกลาง
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z); // หาด้านที่ยาวที่สุด
      const fov = camera.fov * (Math.PI / 180); // แปลงมุมมองกล้องเป็นเรเดียน
      let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)); // คำนวณระยะ Z (ความลึก) ด้วยสูตรตรีโกณมิติ

      cameraZ *= 1.8; // ตัวปรับระยะไกล้ / ไกล ของกล้อง

      camera.position.set(center.x, center.y, center.z + cameraZ); // ย้ายตำแหน่งกล้อง (เอาค่า cameraZ ไป +- แต่ละจุด xyz)
      camera.near = cameraZ / 100;
      camera.far = cameraZ * 100;
      camera.updateProjectionMatrix();

      camera.lookAt(center); // หันกล้องไปมองจุดกึ่งกลางโมเดล
      controls.target.copy(center); // ให้จุดหมุนอยู่ตรงกึ่งกลางโมเดล
      controls.update();
    };

    // ปรับสัดส่วนกล้องภาพจะได้ไม่เบี้ยว ยืด
    const handleResize = () => {
      if (!container || !isMounted) return;
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(() => { handleResize(); }); // สั่งให้เบราว์เซอร์จับตาดูขนาดกล่อง
    resizeObserver.observe(container);

    // โหลดโมเดล
    const ext = modelUrl.split(".").pop().toLowerCase();
    if (ext === "glb") {
      const loader = new GLTFLoader();
      loader.load(modelUrl, (gltf) => {
        if (!isMounted) return; // ถ้าโหลดเสร็จแต่ผู้ใช้ปิดโมเดลไปแล้ว ให้ข้ามไปเลย
        const model = gltf.scene;

        // วนลูปผ่านทุกชิ้นส่วนของโมเดล
        model.traverse((child) => {
          if (child.isMesh) {
            child.material.side = THREE.FrontSide; // บังคับให้เรนเดอร์เฉพาะผิวหน้า
            // child.material.side = THREE.DoubleSide;
            child.castShadow = true;// เปิดให้สร้างเงา
            child.receiveShadow = true;// เปิดให้รับเงา
          }
        });

        scene.add(model); // ยัดโมเดลใส่ฉาก
        fitCameraToObject(model); // สั่งถอยกล้องให้พอดี
        setTimeout(handleResize, 100); // 0.1 ดักเรียก Resize อีกรอบกันเหนียว กรณี Layout ของเว็บยังจัดไม่เสร็จ
      });
    }

    // animation loop
    const animate = () => {
      if (!isMounted) return; // ถ้าปิดโมเดลแล้ว ให้หยุด Loop
      requestAnimationFrame(animate); // สั่งเบราว์เซอร์ให้เรียกฟังก์ชันนี้ซ้ำ ๆ (60 fps)
      controls.update(); // อัปเดตการหมุนกล้องแบบลื่นไหล
      renderer.render(scene, camera); // สั่งให้วาดภาพฉากและกล้อง ณ เฟรมนั้นๆ ลงบน Canvas
    };
    animate(); // เริ่มอนิเมชัน

    // เคลียข้อมูล เมื่อไม่ได้ดูแล้ว
    return () => {
      isMounted = false; // หยุด Loop
      resizeObserver.disconnect();// เลิกจับตาดูขนาดหน้าจอ
      controls.dispose();// ทำลายตัวควบคุม
      renderer.dispose();// ทำลายตัววาดภาพ

      // ถอน Canvas (แท็ก <canvas>) ออกจากหน้าเว็บ
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // วนลูปเพื่อไล่เคลียร์ รูปทรง 3D และพื้นผิว/สี (Geometry & Material) ทุกชิ้น
      // ถ้าไม่ทำส่วนนี้ แรมเครื่องโทรศัพท์จะเต็มไวมากและทำให้แอปค้าง
      scene.traverse((object) => {
        if (!object.isMesh) return;
        object.geometry.dispose();
        if (object.material.isMaterial) {
          cleanMaterial(object.material);
        } else {
          for (const material of object.material) cleanMaterial(material);
        }
      });
    };

    // ทำลายพื้นผิววัตถุ
    function cleanMaterial(material) {
      material.dispose();
      for (const key of Object.keys(material)) {
        const value = material[key];
        if (value && typeof value.dispose === "function") value.dispose();
      }
    }
  }, [modelUrl, isVisible]);



  return (
    // ใส่ Ref ที่ div นอกสุดเพื่อใช้ดักจับระยะจอ
    <div className="model-viewer" ref={ref}>
      {!isVisible ? (
        <div className="model-placeholder" onClick={() => setIsVisible(true)}>
          <div className="icon">📦</div>
          <div className="text">Click to Load 3D Model</div>
        </div>
      ) : (
        <>
          <div ref={containerRef} className="viewer-canvas" />
          <button className="close-btn" onClick={() => setIsVisible(false)}>
            Close
          </button>
        </>
      )}
    </div>
  );
};

export default ModelViewer;