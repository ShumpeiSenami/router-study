'use strict';
const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.send('このルーターは /first で開ける。');
});

// param 関数で、パスのパラメータに　id という項目が存在する場合に、その id をどのように処理するかのハンドラ設定
// この場合　id= :titleで入力したパス名をそのまま画面に表示させる
router.param('title', (req, res, next, title) => {
  res.send(title);
  next();
});

router.get('/:title', (req, res, next) => {
  res.end();
});

module.exports = router;