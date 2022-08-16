const express = require('express');
const router = express.Router();
const tagsController = require('../controllers/tagsController');

router.route('/').get(tagsController.getTags);

router.route('/limit').get(tagsController.getNumTags);

router.route('/limit/:userId').get(tagsController.getFollowingTags);

router.route('/:name').get(tagsController.getTagByName);

router.route('/:name/:action').patch(tagsController.handleFollow);

module.exports = router;
