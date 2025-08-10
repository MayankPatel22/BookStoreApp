exports.getError = (req, res, next) => {
  res.status(404).render("404", {
    currentPage: "404",
    isLoggedIn: req.isLoggedIn || false,
    user: req.session ? req.session.user : null,
  });
};
