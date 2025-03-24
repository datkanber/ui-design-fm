DROP PROCEDURE IF EXISTS SürücüRaporuGünlük;

DELIMITER //
CREATE PROCEDURE SürücüRaporuGünlük (IN p_sürücü_id INT,  IN p_tarih_baş DATE, IN p_tarih_bitiş DATE)
BEGIN
	SELECT  rota_raporu.tarih AS Gün, 
	        SUM(TIME_TO_SEC(toplam_süre)) / 3600  AS ToplamÇalışmaSaati, 
	        SUM(zamanında_ulaştırılan_sipariş + zamanında_ulaştırılamayan_sipariş) AS ToplamSiparis, 
	        SUM(zamanında_ulaştırılan_sipariş) AS ZamanındaUlaştırılanSipariş, 
	        SUM(zamanında_ulaştırılamayan_sipariş) AS ZamanındaUlaştırılamayanSipariş, 
	        SUM(toplam_enerji_tüketimi)  AS ToplamEnerjiTüketimi,
	        AVG(hız) AS OrtalamaHız
	FROM rota_raporu
	LEFT JOIN (
	    SELECT rota_id, AVG(hız) AS hız
	    FROM araç_canlı_takip
	    WHERE araç_canlı_takip.tarih BETWEEN p_tarih_baş AND p_tarih_bitiş
	      AND hız <> 0
	    GROUP BY rota_id
	) AS avg_hiz ON rota_raporu.rota_id = avg_hiz.rota_id
	WHERE rota_raporu.rota_id IN (SELECT rota_id FROM rota WHERE sürücü_id = p_sürücü_id) 
	  AND rota_raporu.tarih BETWEEN p_tarih_baş AND p_tarih_bitiş
	GROUP BY rota_raporu.tarih
	ORDER BY rota_raporu.tarih;
END //
DELIMITER ;

CALL SürücüRaporuGünlük(20, '2023-12-02', '2023-12-02')