import React, { useEffect, useRef } from "react";
import BpmnModeler from "bpmn-js/lib/Modeler";
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";

const BpmnEditor = ({ xml }) => {
  const containerRef = useRef(null);
  const modelerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const modeler = new BpmnModeler({
      container: containerRef.current,
    });
    modelerRef.current = modeler;

    return () => modeler.destroy(); // Komponent unmount edildiğinde temizleme yap
  }, []);

  useEffect(() => {
    if (!xml || !modelerRef.current) return;
    
    modelerRef.current.importXML(xml).catch((err) => {
      console.error("XML Yükleme Hatası:", err);
    });
  }, [xml]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>BPMN Süreç Modelleme</h2>
      <div ref={containerRef} style={{ width: "100%", height: "500px", border: "1px solid #ccc" }} />
    </div>
  );
};

export default BpmnEditor;
