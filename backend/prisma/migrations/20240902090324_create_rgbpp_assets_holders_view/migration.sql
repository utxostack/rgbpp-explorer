CREATE VIEW "Holder" AS
SELECT
    ls."ownerAddress" AS "address",
    ls."isRgbppLock" AS "isLayer1",
    COUNT(DISTINCT a.id) AS "assetCount",
    a."typeScriptHash" AS "typeScriptHash"
FROM "LockScript" ls
JOIN "Asset" a ON ls."scriptHash" = a."lockScriptHash"
WHERE a."isLive" = true
  AND ls."ownerAddress" IS NOT NULL
GROUP BY ls."ownerAddress", ls."isRgbppLock", a."typeScriptHash";
