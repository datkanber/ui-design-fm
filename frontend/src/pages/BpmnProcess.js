import React, { useState } from "react";
import BpmnEditor from "../components/Bpmn/BpmnEditor";
import FileUploader from "../components/Bpmn/FileUploader";

const BpmnProcess = () => {
  const [xmlData, setXmlData] = useState(null);

  return (
    <div style={{ padding: "20px" }}>
      <h2>BPMN Süreç Modelleme</h2>
      <FileUploader onFileLoad={setXmlData} />
      <BpmnEditor xml={xmlData} />
    </div>
  );
};

export default BpmnProcess;
