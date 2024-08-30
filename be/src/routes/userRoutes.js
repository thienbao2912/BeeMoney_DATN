const express = require('express');
const router = express.Router();
const { add, list, hardDelete, softDelete, deletedList, restore, getOne,update } = require('../../controllers/admin/userController');

router.get('/list', list);
router.post('/add', add);
router.delete('/delete/:id', hardDelete);
router.patch("/soft-delete/:id", softDelete);
router.patch("/restore/:id", restore);
router.get("/deleted", deletedList);
router.get("/get-one/:id", getOne);
router.put('/edit/:id',update)
module.exports = router;
