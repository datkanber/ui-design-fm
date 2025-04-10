import React from "react";

const TaskCompletionChart = ({ routes }) => {
  if (!routes || routes.length === 0) {
    return <p>Veri bulunamadı</p>;
  }

  const data = routes.map((route) => {
    const totalTasks = route.tasks.length;
    const completedTasks = route.tasks.filter((task) => task.status === "completed").length;
    const completionRate = (completedTasks / totalTasks) * 100;
    return { name: route.name, completion: completionRate };
  });

  return (
    <div style={{ padding: "10px" }}>
      <h3>Görev Tamamlanma Oranları</h3>
      {data.map((item) => (
        <div key={item.name} style={{ marginBottom: "15px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: "80px", marginRight: "10px" }}>{item.name}:</div>
            <div style={{ flex: 1, backgroundColor: "#e0e0e0", height: "24px", borderRadius: "4px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${item.completion}%`,
                  height: "100%",
                  backgroundColor:
                    item.completion > 75 ? "#4caf50" : item.completion > 50 ? "#ff9800" : "#f44336",
                  transition: "width 0.5s ease-in-out",
                }}
              />
            </div>

            <div style={{ marginLeft: "10px", width: "60px", textAlign: "right" }}>
              {item.completion.toFixed(1)}%
            </div>
            
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskCompletionChart;
