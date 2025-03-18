import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

const TaskCompletionChart = ({ routes }) => {
  // Rota bazında tamamlanma yüzdelerini hesapla
  const data = routes.map((route) => {
    const totalTasks = route.tasks.length;
    const completedTasks = route.tasks.filter((task) => task.status === "completed").length;
    const completionRate = (completedTasks / totalTasks) * 100;
    return { name: route.name, completion: completionRate };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Bar dataKey="completion" fill="green" name="Tamamlama Yüzdesi" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TaskCompletionChart;