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

module.exports = router;
