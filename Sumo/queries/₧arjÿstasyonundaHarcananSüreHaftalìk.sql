DROP PROCEDURE IF EXISTS  ŞarjİstasyonundaHarcananSüreHaftalık;

DELIMITER //
CREATE PROCEDURE  ŞarjİstasyonundaHarcananSüreHaftalık(IN p_tarih_baş DATE, IN p_tarih_bitiş DATE)
BEGIN
    SELECT  
        t.Gün AS Hafta, 
        SUM(t.ŞarjİstasyonundaToplamHarcananSüre) AS ŞarjİstasyonundaToplamHarcananSüre
    FROM (    
			 SELECT
		        rota_raporu.tarih AS gün, 
		        SUM(TIME_TO_SEC(TIMEDIFF(rota_durak_kayıtları.ayrılış_zamanı, rota_durak_kayıtları.varış_zamanı))) / 60 AS ŞarjİstasyonundaToplamHarcananSüre
		    FROM
		        rota_durak_kayıtları
		    INNER JOIN
		        rota ON rota_durak_kayıtları.rota_id = rota.rota_id
		    INNER JOIN
		        rota_raporu ON rota.rota_id = rota_raporu.rota_id
		    WHERE
		        rota_durak_kayıtları.nokta_id IN (SELECT şarj_istasyonu.şarj_istasyonu_id FROM şarj_istasyonu)
		        AND rota_raporu.tarih BETWEEN p_tarih_baş AND p_tarih_bitiş
		    GROUP BY rota_raporu.tarih
		   ) AS t
    GROUP BY WEEK(t.Gün)
    ORDER BY t.Gün;
END //
DELIMITER ;

CALL ŞarjİstasyonundaHarcananSüreHaftalık('2023-12-01', '2024-01-31')
