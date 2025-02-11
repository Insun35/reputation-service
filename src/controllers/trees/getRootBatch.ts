import { MerkleTreeRootBatch } from "@interep/db"
import { NextApiRequest, NextApiResponse } from "next"
import { logger, removeDBFields } from "src/utils/backend"
import { connectDatabase } from "src/utils/backend/database"

export default async function getRootBatchController(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        res.status(405).end()
        return
    }

    const rootHash = req.query?.rootHash

    if (!rootHash || typeof rootHash !== "string") {
        res.status(400).end()
        return
    }

    try {
        await connectDatabase()

        const rootBatch = await MerkleTreeRootBatch.findOne({
            rootHashes: { $elemMatch: { $eq: rootHash } }
        })

        if (!rootBatch) {
            res.status(404).end("The Merkle root does not exist")
            return
        }

        res.status(200).send({
            data: removeDBFields(rootBatch.toJSON())
        })
    } catch (error) {
        res.status(500).end()

        logger.error(error)
    }
}
