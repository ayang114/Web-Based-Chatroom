exports.getNickname = (req, res) => {
  const { roomId } = req.params;
  res.render('nickname', { roomId });
};

exports.postNickname = (req, res) => {
  const { roomId } = req.params;
  const { nickname } = req.body;
  res.redirect(`/${roomId}?nickname=${nickname}`);
};
