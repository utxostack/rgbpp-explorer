CREATE VIEW "Holder" AS
SELECT
    ls."ownerAddress" AS "address",
    ls."isRgbppLock" AS "isLayer1",
    a."typeScriptHash" AS "typeScriptHash",
    COUNT(DISTINCT a.id) AS "assetCount",
    SUM(a.amount) AS "assetAmount"
FROM "LockScript" ls
JOIN "Asset" a ON ls."scriptHash" = a."lockScriptHash"
WHERE a."isLive" = true
  AND ls."ownerAddress" IS NOT NULL
GROUP BY ls."ownerAddress", ls."isRgbppLock", a."typeScriptHash";

