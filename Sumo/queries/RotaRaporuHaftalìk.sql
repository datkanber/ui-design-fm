DROP PROCEDURE IF EXISTS RotaRaporuHaftalık;

DELIMITER //
CREATE PROCEDURE RotaRaporuHaftalık (IN p_tarih_baş DATE, IN p_tarih_bitiş DATE)
BEGIN
    SELECT  
        t.Gün AS Hafta, 
        SUM(t.KatedilenToplamYol) AS KatedilenToplamYol, 
        SUM(t.ToplamEnerjiTüketimi) AS ToplamEnerjiTüketimi,
        SUM(t.ToplamÇalışmaSaati) AS ToplamÇalışmaSaati, 
        SUM(t.TeslimEdilenToplamÜrünAğırlığı) AS TeslimEdilenToplamÜrünAğırlığı,
        SUM(t.TeslimEdilenToplamÜrünSayısı) AS TeslimEdilenToplamÜrünSayısı,
        SUM(t.ToplamSipariş) AS ToplamSipariş,
        SUM(t.ZamanındaUlaştırılanSipariş) AS ZamanındaUlaştırılanSipariş,
        SUM(t.ZamanındaUlaştırılamayanSipariş) AS ZamanındaUlaştırılamayanSipariş
    FROM (
			SELECT  rota_raporu.tarih AS Gün, 
			        SUM(toplam_mesafe) AS KatedilenToplamYol,
			        SUM(toplam_enerji_tüketimi)  AS ToplamEnerjiTüketimi,
			        SUM(TIME_TO_SEC(toplam_süre)) / 3600  AS ToplamÇalışmaSaati,
			        SUM(teslim_edilen_toplam_ürün_ağırlığı) AS TeslimEdilenToplamÜrünAğırlığı,
			        SUM(teslim_edilen_ürün_sayısı) AS TeslimEdilenToplamÜrünSayısı,
			        SUM(zamanında_ulaştırılan_sipariş + zamanında_ulaştırılamayan_sipariş) AS ToplamSipariş, 
			        SUM(zamanında_ulaştırılan_sipariş) AS ZamanındaUlaştırılanSipariş, 
			        SUM(zamanında_ulaştırılamayan_sipariş) AS ZamanındaUlaştırılamayanSipariş
			FROM rota_raporu
			JOIN rota ON rota.rota_id = rota_raporu.rota_id
		   WHERE rota_raporu.tarih BETWEEN p_tarih_baş AND p_tarih_bitiş
		   GROUP BY rota_raporu.tarih
    ) AS t
    GROUP BY WEEK(t.Gün)
    ORDER BY t.Gün;
END //
DELIMITER ;

CALL RotaRaporuHaftalık('2023-12-30', '2024-12-30')