const db = require("../startup/database");

exports.getAllCropNameDAO = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT cg.id AS cropId, cc.id AS varietyId, cg.cropNameEnglish, cc.varietyEnglish
            FROM cropcalender cc
            JOIN cropgroup cg ON cg.id = cc.cropGroupId
        `;

        db.query(sql, (err, results) => {
            if (err) {
                return reject(err);
            }

            const groupedData = {};

            results.forEach(item => {
                const { cropNameEnglish, varietyEnglish, varietyId, cropId } = item;

                if (!groupedData[cropNameEnglish]) {
                    groupedData[cropNameEnglish] = {
                        cropId: cropId,
                        variety: [] 
                    };
                }

                groupedData[cropNameEnglish].variety.push({
                    id: varietyId,
                    varietyEnglish: varietyEnglish
                });
            });

            const formattedResult = Object.keys(groupedData).map(cropName => ({
                cropId: groupedData[cropName].cropId,
                cropNameEnglish: cropName,
                variety: groupedData[cropName].variety
            }));

            resolve(formattedResult);
        });
    });
};
