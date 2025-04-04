DROP PROCEDURE IF EXISTS SiparişHarcananSüreGünlük;

DELIMITER //
CREATE PROCEDURE SiparişHarcananSüreGünlük(IN p_tarih_baş DATE, IN p_tarih_bitiş DATE)
BEGIN
    SELECT
        rota_raporu.tarih AS gün, 
        SUM(TIME_TO_SEC(TIMEDIFF(rota_durak_kayıtları.ayrılış_zamanı, rota_durak_kayıtları.varış_zamanı))) / 60 AS SiparişToplamHarcananSüre
    FROM
        rota_durak_kayıtları
    INNER JOIN
        rota ON rota_durak_kayıtları.rota_id = rota.rota_id
    INNER JOIN
        rota_raporu ON rota.rota_id = rota_raporu.rota_id
    WHERE
        rota_durak_kayıtları.nokta_id NOT IN (SELECT şarj_istasyonu.şarj_istasyonu_id FROM şarj_istasyonu)
        AND rota_raporu.tarih BETWEEN p_tarih_baş AND p_tarih_bitiş
     GROUP BY rota_raporu.tarih
     ORDER BY rota_raporu.tarih;
END //
DELIMITER ;

CALL SiparişHarcananSüreGünlük('2023-12-30', '2023-12-30')