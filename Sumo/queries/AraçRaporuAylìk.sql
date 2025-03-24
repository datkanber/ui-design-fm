DROP PROCEDURE IF EXISTS AraçRaporuAylık;

DELIMITER //
CREATE PROCEDURE AraçRaporuAylık (IN p_araç_id VARCHAR(50),  IN p_tarih_baş DATE, IN p_tarih_bitiş DATE)
BEGIN
    SELECT  
        t.Gün AS Hafta, 
        SUM(t.ToplamÇalışmaSaati) AS ToplamÇalışmaSaati, 
        SUM(t.KatedilenToplamYol) AS KatedilenToplamYol, 
        SUM(t.ToplamEnerjiTüketimi) AS ToplamEnerjiTüketimi,
        SUM(t.ToplamŞarjSüresi) AS ToplamŞarjSüresi
    FROM (
        SELECT  
            tarih AS Gün, 
            SUM(TIME_TO_SEC(toplam_süre)) / 3600  AS ToplamÇalışmaSaati,  
            SUM(toplam_mesafe) AS KatedilenToplamYol,
            SUM(toplam_enerji_tüketimi)  AS ToplamEnerjiTüketimi,
            SUM(COALESCE(şarj_durumu.ŞarjSüresi, 0)) / 60 AS ToplamŞarjSüresi
        FROM rota_raporu 
        JOIN rota ON rota.rota_id = rota_raporu.rota_id
        LEFT JOIN(
            SELECT 
                rota_id,
                nokta_id,
                SUM(TIMESTAMPDIFF(SECOND, varış_zamanı, ayrılış_zamanı)) AS ŞarjSüresi
            FROM rota_durak_kayıtları
            WHERE nokta_id IN (SELECT şarj_istasyonu_id FROM şarj_istasyonu)
            GROUP BY rota_id, nokta_id		
        ) AS şarj_durumu ON rota_raporu.rota_id = şarj_durumu.rota_id
        WHERE rota.araç_id = p_araç_id
            AND rota_raporu.tarih BETWEEN p_tarih_baş AND p_tarih_bitiş
        GROUP BY rota_raporu.tarih
    ) AS t
    GROUP BY MONTH(t.Gün)
    ORDER BY t.Gün;
END //
DELIMITER ;

CALL AraçRaporuAylık('musoshi005', '2023-12-01', '2024-01-5')