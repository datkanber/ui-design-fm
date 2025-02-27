const BASE_URL = 'http://localhost:5000'; // Backend'inizin URL'si

export const startProcess = async (processKey, variables) => {
    try {
        const response = await fetch(`${BASE_URL}/start-process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ processKey, variables })
        });

        if (!response.ok) {
            throw new Error(`HTTP Hatası: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Process başlatma hatası:", error);
        return { message: "Process başlatılamadı", error: error.message };
    }
};
