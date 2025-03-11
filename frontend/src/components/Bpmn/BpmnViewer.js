import React from 'react';
import BpmnEditor from '../BpmnEditor';
import { ConfigProvider } from 'antd';

// Boş bir BPMN diyagramı örneği
const emptyBpmn = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                  id="Definitions_1"
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds height="36.0" width="36.0" x="173.0" y="102.0"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const BpmnViewer = () => {
  // XML yükleme hatası aldıysanız, yukarıdaki emptyBpmn kullanılabilir
  const handleSaveDiagram = (savedXml) => {
    console.log('Kaydedilen XML:', savedXml);
    // Burada XML'i API'ye gönderme veya kaydetme işlemleri yapılabilir
  };

  return (
    <ConfigProvider>
      <BpmnEditor xml={emptyBpmn} onSave={handleSaveDiagram} />
    </ConfigProvider>
  );
};

export default BpmnViewer;
