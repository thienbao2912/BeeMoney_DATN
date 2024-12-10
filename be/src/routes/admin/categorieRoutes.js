const express = require("express");
const router = express.Router();
const {
    list,
    add,
    hardDelete,
    getOne,
    update,
    softDelete,
    restore,
    deletedList
} = require("../../controllers/admin/categorieController");
const middlewareController = require("../../middleware/auth");

router.get("/list", middlewareController.verifyTokenAuthorization,list);
router.post("/add", middlewareController.verifyTokenAuthorization,add);
router.delete("/delete/:id", middlewareController.verifyTokenAuthorization,hardDelete);
router.get("/get-one/:id", middlewareController.verifyTokenAuthorization,getOne);
router.put("/update/:id", middlewareController.verifyTokenAuthorization,update);
router.patch("/soft-delete/:id", middlewareController.verifyTokenAuthorization,softDelete);
router.patch("/restore/:id", middlewareController.verifyTokenAuthorization,restore);
router.get("/deleted", middlewareController.verifyTokenAuthorization,deletedList);

router.get("/user/:userId/categories", middlewareController.verifyTokenAuthorization, async (req, res) => {
    try {
        const userId = req.params.userId;

        const categories = await modelCategorie.find({ userId, status: { $ne: 'disable' } });

        return res.status(200).json(categories);
    } catch (error) {
        return res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;
