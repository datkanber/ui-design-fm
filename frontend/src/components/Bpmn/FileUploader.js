import React from "react";

const FileUploader = ({ onFileLoad }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onFileLoad(e.target.result); // Yüklenen BPMN içeriğini geri döndür
      };
      reader.readAsText(file);
    }
  };

  return (
    <div style={{ marginBottom: "10px" }}>
      <input type="file" accept=".bpmn, .xml" onChange={handleFileChange} />
    </div>
  );
};

export default FileUploader;
